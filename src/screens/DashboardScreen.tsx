import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { signOut } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function DashboardScreen({ navigation }: any) {
    const [pairedWith, setPairedWith] = useState<string | null>(null);

    useEffect(() => {
        const me = auth.currentUser;
        if (!me) return;
        const unsub = onSnapshot(doc(db, "users", me.uid), (s) => {
            const d = s.data() as any;
            setPairedWith(d?.pairedWithUid ?? null);
        });
        return unsub;
    }, []);

    const logout = async () => {
        await signOut(auth);
        // App.tsx 会自动回到 AuthStack
    };

    return (
        <View style={{ padding: 24, gap: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: "600" }}>Dashboard (Placeholder)</Text>
            <Text>Paired with: {pairedWith ?? "Not paired"}</Text>
            <Button title="Logout" onPress={logout} />
        </View>
    );
}
