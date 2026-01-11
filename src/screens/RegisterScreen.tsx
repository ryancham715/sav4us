import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { usernameToEmail, normalizeUsername } from "../utils/username";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
    const [username, setUsername] = useState("");
    const [pw, setPw] = useState("");

    const register = async () => {
        try {
            const uname = normalizeUsername(username);
            const internalEmail = usernameToEmail(uname);

            const cred = await createUserWithEmailAndPassword(auth, internalEmail, pw);
            const u = cred.user;

            await setDoc(
                doc(db, "users", u.uid),
                {
                    uid: u.uid,
                    username: uname,
                    createdAt: serverTimestamp(),
                },
                { merge: true }
            );

            await signOut(auth);

            Alert.alert("Registered", "Please login");
            navigation.popToTop(); // 回到 Login
        } catch (e: any) {
            Alert.alert("Register failed", e?.message ?? "Unknown error");
        }
    };


    return (
        <View style={{ padding: 24, gap: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: "600" }}>Register</Text>

            <Text>Username</Text>
            <TextInput
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
            />

            <Text>Password</Text>
            <TextInput
                value={pw}
                onChangeText={setPw}
                secureTextEntry
                style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
            />

            <Button title="Create account" onPress={register} />
        </View>
    );
}
