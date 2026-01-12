import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  useWindowDimensions,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { usernameToEmail } from "../utils/username";
import { Ionicons } from "@expo/vector-icons";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const theme = {
  bg: "#F7F2EB",
  text: "#2F3A34",
  subtext: "#6B756F",
  primary: "#6FA96F",
  primaryActive: "#5E8F5E",
  inputBg: "rgba(255,255,255,0.55)",
  inputBorder: "rgba(111,169,111,0.35)",
};

export default function LoginScreen({ navigation }: Props) {
  const [username, setUsername] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const { height: screenHeight } = useWindowDimensions();


  const login = async () => {
    if (!username.trim() || !pw) {
      Alert.alert("Missing info", "Please enter User Name and Passcode.");
      return;
    }

    try {
      setLoading(true);
      const internalEmail = usernameToEmail(username.trim());
      await signInWithEmailAndPassword(auth, internalEmail, pw);
    } catch (e: any) {
      Alert.alert("Login failed", e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.container}>
            {/* 顶部插画：保留大视觉 */}
            <Image
              source={require("../../assets/auth-illustration.png")}
              style={[styles.hero, { height: screenHeight * 0.42 }]}
              resizeMode="contain"
            />

            {/* 中心 Logo + Quote */}
            <View style={styles.brandBlock}>
              <Text style={[styles.quote, { color: theme.subtext }]}>
                “Every goal is shared.”
              </Text>
            </View>

            {/* 表单区域：整体上移（关键） */}
            <View style={styles.formArea}>
              <View
                style={[
                  styles.inputRow,
                  { backgroundColor: theme.inputBg, borderColor: theme.inputBorder },
                ]}
              >
                <View style={[styles.iconBox, { backgroundColor: "rgba(111,169,111,0.18)" }]}>
                  <Ionicons name="person" size={18} color={theme.primaryActive} />
                </View>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="User Name"
                  placeholderTextColor="#8B948F"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[styles.input, { color: theme.text }]}
                  returnKeyType="next"
                />
              </View>

              <View
                style={[
                  styles.inputRow,
                  { backgroundColor: theme.inputBg, borderColor: theme.inputBorder },
                ]}
              >
                <View style={[styles.iconBox, { backgroundColor: "rgba(111,169,111,0.18)" }]}>
                  <Ionicons name="lock-closed" size={18} color={theme.primaryActive} />
                </View>
                <TextInput
                  value={pw}
                  onChangeText={setPw}
                  placeholder="Passcode"
                  placeholderTextColor="#8B948F"
                  secureTextEntry
                  style={[styles.input, { color: theme.text }]}
                  returnKeyType="done"
                  onSubmitEditing={login}
                />
              </View>

              <Pressable
                onPress={login}
                disabled={loading}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  {
                    backgroundColor: loading ? "#B8C1BC" : theme.primary,
                    opacity: pressed ? 0.92 : 1,
                  },
                ]}
              >
                <Text style={styles.primaryBtnText}>
                  {loading ? "Logging in..." : "Login"}
                </Text>
              </Pressable>

              <View style={styles.bottomRow}>
                <Text style={[styles.bottomText, { color: theme.subtext }]}>New User?</Text>
                <Pressable onPress={() => navigation.navigate("Register")}>
                  <Text style={[styles.registerText, { color: theme.primaryActive }]}>Register</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  kav: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // 插画：仍然够大，但给 logo 留空间
  hero: {
    width: "135%",
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 4,
  },

  // 中心品牌块
  brandBlock: {
    alignItems: "center",
    marginTop: -6,
    marginBottom: 10,
  },
  quote: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // 表单整体上移：不贴底
  formArea: {
    marginTop: 10,     // ✅ 上移（关键）
    paddingBottom: 10,
  },

  inputRow: {
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },

  primaryBtn: {
    height: 56,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    gap: 8,
  },
  bottomText: { fontSize: 14 },
  registerText: { fontSize: 14, fontWeight: "800" },
});
