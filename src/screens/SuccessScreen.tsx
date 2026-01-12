import React from "react";
import { View, Text, Button } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Success">;

export default function SuccessScreen({ navigation }: Props) {
  const logout = async () => {
    await signOut(auth);
    navigation.replace("Login");
  };

  return (
    <View style={{ padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "600" }}>Success (Placeholder)</Text>
      <Text>You are logged in.</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
