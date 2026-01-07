import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");

    const login = async () => {
        try {
            await signInWithEmailAndPassword(auth, email.trim(), pw);
            navigation.replace("Success"); // 登录成功 -> 成功页（占位）
        } catch (e: any) {
            Alert.alert("Login failed", e?.message ?? "Unknown error");
        }
    };

    return (
        <View style={{ padding: 24, gap: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: "600" }}>Login</Text>

            <Text>Email</Text>
            <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
            />

            <Text>Password</Text>
            <TextInput
                value={pw}
                onChangeText={setPw}
                secureTextEntry
                style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
            />

            <Button title="Login" onPress={login} />
            <Button title="Go to Register" onPress={() => navigation.navigate("Register")} />
        </View>
    );
}
