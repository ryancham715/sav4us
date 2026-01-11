import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Button, FlatList, Pressable, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { auth, db } from "../services/firebase";
import { onSnapshot, collection, query, where, orderBy } from "firebase/firestore";
import { signOut } from "firebase/auth";

type Props = NativeStackScreenProps<RootStackParamList, "Projects">;

type Project = {
    id: string;
    name: string;
    targetCents: number;
    memberAUid: string;
    memberBUid: string | null;
    memberAWeight: number;
    memberBWeight: number;
    status: "open" | "archived";
    createdAt?: any;
};

export default function ProjectsScreen({ navigation }: Props) {
    const uid = auth.currentUser?.uid;

    const [projectsA, setProjectsA] = useState<Project[]>([]);
    const [projectsB, setProjectsB] = useState<Project[]>([]);

    useEffect(() => {
        if (!uid) {
            navigation.replace("Login");
            return;
        }

        const col = collection(db, "projects");

        const qA = query(col, where("memberAUid", "==", uid));
        const unsubA = onSnapshot(
            qA,
            (snap) => {
                setProjectsA(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
            },
            (err) => Alert.alert("Firestore", err.message)
        );

        const qB = query(col, where("memberBUid", "==", uid));
        const unsubB = onSnapshot(
            qB,
            (snap) => {
                setProjectsB(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
            },
            (err) => Alert.alert("Firestore", err.message)
        );

        return () => {
            unsubA();
            unsubB();
        };
    }, [uid, navigation]);

    const projects = useMemo(() => {
        const map = new Map<string, Project>();
        for (const p of [...projectsA, ...projectsB]) map.set(p.id, p);
        return Array.from(map.values()).sort(
            (a: any, b: any) => a.name.localeCompare(b.name)
        );
    }, [projectsA, projectsB]);

    const logout = async () => {
        await signOut(auth);
        navigation.replace("Login");
    };

    return (
        <View style={{ padding: 16, gap: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontWeight: "600" }}>Your Projects</Text>
                <Button title="Logout" onPress={logout} />
            </View>

            <Button title="Create Project" onPress={() => navigation.navigate("CreateProject")} />

            {projects.length === 0 ? (
                <Text style={{ marginTop: 12 }}>No projects yet. Create one!</Text>
            ) : (
                <FlatList
                    data={projects}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={() => Alert.alert("Project", `${item.name}\n(id: ${item.id})`)}
                            style={{
                                padding: 12,
                                borderWidth: 1,
                                borderRadius: 10,
                                marginTop: 10,
                            }}
                        >
                            <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.name}</Text>
                            <Text>Total target: ${(item.targetCents / 100).toFixed(2)}</Text>
                            <Text>Ratio (A:B): {item.memberAWeight}:{item.memberBWeight}</Text>
                            <Text>Member B: {item.memberBUid ? "Joined" : "Not joined yet"}</Text>
                        </Pressable>
                    )}
                />
            )}
        </View>
    );
}
