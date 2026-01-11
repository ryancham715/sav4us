import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ProjectsScreen from "../screens/ProjectsScreen";
import CreateProjectScreen from "../screens/CreateProjectScreen";

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Projects: undefined;
    CreateProject: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Login" }} />
                <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Register" }} />
                <Stack.Screen name="Projects" component={ProjectsScreen} options={{ title: "Projects" }} />
                <Stack.Screen name="CreateProject" component={CreateProjectScreen} options={{ title: "Create Project" }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
