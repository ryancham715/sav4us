import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { auth, db } from "../services/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

type Props = NativeStackScreenProps<RootStackParamList, "CreateProject">;

export default function CreateProjectScreen({ navigation }: Props) {
    const uid = auth.currentUser?.uid;

    const [name, setName] = useState("");
    const [target, setTarget] = useState(""); // dollars string
    const [wA, setWA] = useState("");
    const [wB, setWB] = useState("");
    const [saving, setSaving] = useState(false);

    const create = async () => {
        if (!uid) {
            navigation.replace("Login");
            return;
        }

        const projectName = name.trim();
        if (!projectName) {
            Alert.alert("Required", "Please enter project name.");
            return;
        }

        const targetNum = Number(target);
        if (!Number.isFinite(targetNum) || targetNum <= 0) {
            Alert.alert("Invalid", "Please enter a valid total target amount.");
            return;
        }

        const a = parseInt(wA, 10);
        const b = parseInt(wB, 10);
        if (!Number.isFinite(a) || !Number.isFinite(b) || a <= 0 || b <= 0) {
            Alert.alert("Invalid", "Weights must be positive integers.");
            return;
        }

        const targetCents = Math.round(targetNum * 100);

        setSaving(true);
        try {
            await addDoc(collection(db, "projects"), {
                name: projectName,
                targetCents,
                memberAUid: uid,
                memberBUid: null,
                memberAWeight: a,
                memberBWeight: b,
                status: "open",
                createdAt: serverTimestamp(),
            });

            Alert.alert("Created", "Project created successfully.");
            navigation.goBack(); // 回到 Project list
        } catch (e: any) {
            Alert.alert("Create failed", e?.message ?? "Unknown error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={{ padding: 24, gap: 12 }}>
            <Text style={{ fontSize: 20, fontWeight: "600" }}>Create a Project</Text>

            <Text>Project name</Text>
            <TextInput
                value={name}
                onChangeText={setName}
                style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
            />

            <Text>Contribution target (e.g. 10000)</Text>
            <TextInput
                value={target}
                onChangeText={setTarget}
                keyboardType="decimal-pad"
                style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
            />

            <Text>Contribution ratio (A : B)</Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                    <Text>A weight</Text>
                    <TextInput
                        value={wA}
                        onChangeText={setWA}
                        keyboardType="number-pad"
                        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text>B weight</Text>
                    <TextInput
                        value={wB}
                        onChangeText={setWB}
                        keyboardType="number-pad"
                        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
                    />
                </View>
            </View>

            <Button title={saving ? "Creating..." : "Create"} onPress={create} disabled={saving} />
        </View>
    );
}
