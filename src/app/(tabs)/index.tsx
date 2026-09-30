import * as React from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/auth/hooks/use-auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";

export default function HomeScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <View className="flex-1 justify-center bg-background px-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Painel Principal</CardTitle>
          <CardDescription>Bem-vindo ao aplicativo de Finanças</CardDescription>
        </CardHeader>
        <CardContent className="gap-2">
          <Text className="text-base text-foreground">
            Logado como:{" "}
            <Text className="font-semibold text-primary">{user?.name || "Usuário"}</Text>
          </Text>
          <Text className="text-sm text-muted-foreground">{user?.email}</Text>
        </CardContent>
        <CardFooter className="pt-4">
          <Button
            variant="destructive"
            className="w-full"
            label="Sair da Conta (Logout)"
            onPress={handleLogout}
          />
        </CardFooter>
      </Card>
    </View>
  );
}
