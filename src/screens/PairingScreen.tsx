import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Button, Alert, Pressable, ScrollView } from "react-native";
import { signOut } from "firebase/auth";
import { auth, db } from "../services/firebase";
import {
    addDoc,
    collection,
    doc,
    getDocs,
    limit,
    onSnapshot,
    query,
    runTransaction,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";

type PairRequest = {
    id: string;
    fromUid: string;
    toUid: string;
    status: "pending" | "accepted" | "ignored" | "cancelled";
    createdAt?: any;
};

export default function PairingScreen({ navigation }: any) {
    const me = auth.currentUser;
    const myUid = me?.uid;

    const [busy, setBusy] = useState(false);
    const [partnerUsername, setPartnerUsername] = useState("");

    const [myUsername, setMyUsername] = useState<string | null>(null);
    const [pairedWithUid, setPairedWithUid] = useState<string | null>(null);

    const [incoming, setIncoming] = useState<PairRequest[]>([]);
    const [outgoingPending, setOutgoingPending] = useState<PairRequest | null>(null);

    // listen my user doc (paired status + my username)
    useEffect(() => {
        if (!myUid) return;
        const unsub = onSnapshot(doc(db, "users", myUid), (snap) => {
            const d = snap.data() as any;
            setPairedWithUid(d?.pairedWithUid ?? null);
            setMyUsername(d?.username ?? null);
        });
        return unsub;
    }, [myUid]);

    // listen incoming pending requests
    useEffect(() => {
        if (!myUid) return;
        const qIncoming = query(
            collection(db, "pair_requests"),
            where("toUid", "==", myUid),
            where("status", "==", "pending")
        );

        const unsub = onSnapshot(qIncoming, (snap) => {
            const rows: PairRequest[] = snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as any),
            }));
            setIncoming(rows);
        });

        return unsub;
    }, [myUid]);

    // listen my outgoing pending request (optional: just show one latest)
    useEffect(() => {
        if (!myUid) return;
        const qOutgoing = query(
            collection(db, "pair_requests"),
            where("fromUid", "==", myUid),
            where("status", "==", "pending")
        );

        const unsub = onSnapshot(qOutgoing, (snap) => {
            if (snap.empty) setOutgoingPending(null);
            else setOutgoingPending({ id: snap.docs[0].id, ...(snap.docs[0].data() as any) });
        });

        return unsub;
    }, [myUid]);

    const canInteract = useMemo(() => !busy && !!myUid, [busy, myUid]);

    const logout = async () => {
        await signOut(auth);
    };

    const sendInvite = async () => {
        if (!myUid) return;

        const input = partnerUsername.trim();
        if (!input) {
            Alert.alert("Missing info", "Please enter your partner's username.");
            return;
        }

        if (pairedWithUid) {
            Alert.alert("Already paired", "You are already paired.");
            return;
        }

        setBusy(true);
        try {
            // find partner by username
            const qUser = query(collection(db, "users"), where("username", "==", input), limit(1));
            const userSnap = await getDocs(qUser);
            if (userSnap.empty) {
                Alert.alert("Not found", "No user found with that username.");
                return;
            }

            const partnerUid = userSnap.docs[0].id;
            if (partnerUid === myUid) {
                Alert.alert("Invalid", "You cannot invite yourself.");
                return;
            }

            // ensure partner not already paired
            const partnerData = userSnap.docs[0].data() as any;
            if (partnerData?.pairedWithUid) {
                Alert.alert("Unavailable", "That user is already paired.");
                return;
            }

            // prevent duplicate pending request from me -> them
            const qDup = query(
                collection(db, "pair_requests"),
                where("fromUid", "==", myUid),
                where("toUid", "==", partnerUid),
                where("status", "==", "pending"),
                limit(1)
            );
            const dupSnap = await getDocs(qDup);
            if (!dupSnap.empty) {
                Alert.alert("Already sent", "You already sent a pending invite to this user.");
                return;
            }

            await addDoc(collection(db, "pair_requests"), {
                fromUid: myUid,
                toUid: partnerUid,
                status: "pending",
                createdAt: serverTimestamp(),
            });

            Alert.alert("Invite sent", "Waiting for your partner to accept.");
            setPartnerUsername("");
        } catch (e: any) {
            Alert.alert("Failed", e?.message ?? "Unknown error");
        } finally {
            setBusy(false);
        }
    };

    const ignoreInvite = async (req: PairRequest) => {
        if (!myUid) return;
        try {
            await updateDoc(doc(db, "pair_requests", req.id), {
                status: "ignored",
                respondedAt: serverTimestamp(),
            });
        } catch (e: any) {
            Alert.alert("Failed", e?.message ?? "Unknown error");
        }
    };

    const acceptInvite = async (req: PairRequest) => {
        if (!myUid) return;
        if (pairedWithUid) {
            Alert.alert("Already paired", "You are already paired.");
            return;
        }

        setBusy(true);
        try {
            const meRef = doc(db, "users", myUid);
            const otherRef = doc(db, "users", req.fromUid);
            const reqRef = doc(db, "pair_requests", req.id);

            await runTransaction(db, async (tx) => {
                const meSnap = await tx.get(meRef);
                const otherSnap = await tx.get(otherRef);
                const reqSnap = await tx.get(reqRef);

                const mePaired = meSnap.data()?.pairedWithUid ?? null;
                const otherPaired = otherSnap.data()?.pairedWithUid ?? null;
                const reqData = reqSnap.data() as any;

                if (!reqSnap.exists()) throw new Error("Invite no longer exists.");
                if (reqData?.status !== "pending") throw new Error("Invite is no longer pending.");
                if (reqData?.toUid !== myUid) throw new Error("This invite is not for you.");

                if (mePaired) throw new Error("You are already paired.");
                if (otherPaired) throw new Error("Sender is already paired.");

                // pair both users
                tx.update(meRef, { pairedWithUid: req.fromUid, pairedAt: serverTimestamp() });
                tx.update(otherRef, { pairedWithUid: myUid, pairedAt: serverTimestamp() });

                // mark request accepted
                tx.update(reqRef, { status: "accepted", respondedAt: serverTimestamp() });
            });

            navigation.replace("Dashboard");
        } catch (e: any) {
            Alert.alert("Accept failed", e?.message ?? "Unknown error");
        } finally {
            setBusy(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
            <Text style={{ fontSize: 22, fontWeight: "600" }}>Pairing</Text>

            <Text>Your username: {myUsername ?? "(loading...)"}</Text>

            {pairedWithUid ? (
                <View style={{ gap: 8 }}>
                    <Text>You are already paired.</Text>
                    <Button title="Go to Dashboard" onPress={() => navigation.replace("Dashboard")} />
                    <Button title="Sign out" onPress={logout} />
                </View>
            ) : (
                <>
                    {/* Send invite */}
                    <View style={{ gap: 8 }}>
                        <Text style={{ fontSize: 16, fontWeight: "600" }}>Send an invite</Text>
                        <TextInput
                            value={partnerUsername}
                            onChangeText={setPartnerUsername}
                            autoCapitalize="none"
                            placeholder="partner_username"
                            style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
                            editable={canInteract}
                        />
                        <Button title={busy ? "Sending..." : "Send Invite"} onPress={sendInvite} disabled={!canInteract} />
                        {outgoingPending ? (
                            <Text style={{ opacity: 0.7 }}>You have a pending invite sent (waiting for acceptance).</Text>
                        ) : null}
                    </View>

                    {/* Incoming invites */}
                    <View style={{ gap: 8 }}>
                        <Text style={{ fontSize: 16, fontWeight: "600" }}>Incoming invites</Text>

                        {incoming.length === 0 ? (
                            <Text style={{ opacity: 0.7 }}>No pending invites.</Text>
                        ) : (
                            incoming.map((req) => (
                                <View
                                    key={req.id}
                                    style={{
                                        borderWidth: 1,
                                        borderRadius: 10,
                                        padding: 12,
                                        gap: 10,
                                    }}
                                >
                                    <Text>Invite from: {req.fromUid}</Text>
                                    <View style={{ flexDirection: "row", gap: 12 }}>
                                        <Pressable
                                            onPress={() => acceptInvite(req)}
                                            disabled={!canInteract}
                                            style={{
                                                paddingVertical: 10,
                                                paddingHorizontal: 14,
                                                borderWidth: 1,
                                                borderRadius: 10,
                                                opacity: canInteract ? 1 : 0.5,
                                            }}
                                        >
                                            <Text>Accept</Text>
                                        </Pressable>

                                        <Pressable
                                            onPress={() => ignoreInvite(req)}
                                            disabled={!canInteract}
                                            style={{
                                                paddingVertical: 10,
                                                paddingHorizontal: 14,
                                                borderWidth: 1,
                                                borderRadius: 10,
                                                opacity: canInteract ? 1 : 0.5,
                                            }}
                                        >
                                            <Text>Ignore</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>

                    <Button title="Sign out" onPress={logout} />
                </>
            )}
        </ScrollView>
    );
}
