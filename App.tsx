import React, { useEffect, useMemo, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "./src/services/firebase";
import { doc, onSnapshot } from "firebase/firestore";

import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import PairingScreen from "./src/screens/PairingScreen";
import DashboardScreen from "./src/screens/DashboardScreen";

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

type MainStackParamList = {
  Pairing: undefined;
  Dashboard: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

function Loading() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
    </View>
  );
}

export default function App() {
  const [fbUser, setFbUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [pairedWithUid, setPairedWithUid] = useState<string | null>(null);
  const [userDocLoading, setUserDocLoading] = useState(false);

  // 1) Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFbUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // 2) User doc listener (only when logged in)
  useEffect(() => {
    if (!fbUser) {
      setPairedWithUid(null);
      setUserDocLoading(false);
      return;
    }

    setUserDocLoading(true);
    const ref = doc(db, "users", fbUser.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const data = snap.data() as any;
        setPairedWithUid(data?.pairedWithUid ?? null);
        setUserDocLoading(false);
      },
      () => {
        // 如果读不到（rules问题），也会卡在这里；你可以后面再加错误提示
        setPairedWithUid(null);
        setUserDocLoading(false);
      }
    );

    return unsub;
  }, [fbUser]);

  const initialMainRoute = useMemo(() => {
    return pairedWithUid ? "Dashboard" : "Pairing";
  }, [pairedWithUid]);

  if (authLoading || (fbUser && userDocLoading)) return <Loading />;

  return (
    <NavigationContainer>
      {!fbUser ? (
        <AuthStack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
      ) : (
        <MainStack.Navigator
          initialRouteName={initialMainRoute}
          key={initialMainRoute}
          screenOptions={{ headerShown: false }}
        >
          <MainStack.Screen name="Pairing" component={PairingScreen} />
          <MainStack.Screen name="Dashboard" component={DashboardScreen} />
        </MainStack.Navigator>
      )}
    </NavigationContainer>
  );
}
