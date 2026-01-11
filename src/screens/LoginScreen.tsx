import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { usernameToEmail } from "../utils/username";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
    const [username, setUsername] = useState("");
    const [pw, setPw] = useState("");

    const login = async () => {
        try {
            const internalEmail = usernameToEmail(username);
            await signInWithEmailAndPassword(auth, internalEmail, pw);
            navigation.replace("Projects"); // 登录成功 -> 項目列表頁
        } catch (e: any) {
            Alert.alert("Login failed", e?.message ?? "Unknown error");
        }
    };

    return (
        <View style={{ padding: 24, gap: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: "600" }}>Login</Text>

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

            <Button title="Login" onPress={login} />
            <Button title="Go to Register" onPress={() => navigation.navigate("Register")} />
        </View>
    );
}
