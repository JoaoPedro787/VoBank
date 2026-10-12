import * as React from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
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
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { Logo } from "@/shared/components/Logo";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleLogin = async () => {
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("Por favor, insira o seu e-mail.");
      return;
    }
    if (!password) {
      setErrorMessage("Por favor, insira a sua senha.");
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ email: email.trim(), password });
      router.replace("/(tabs)");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao efetuar login";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        className="px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-8 items-center">
          <Logo className="mb-3.5" />
          <Text className="text-3xl font-extrabold tracking-tight text-foreground">VóBank</Text>
          <Text className="mt-1 text-sm text-muted-foreground text-center">
            Gerencie suas contas, cartões e divisões com facilidade
          </Text>
        </View>

        <Card className="w-full border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Entrar na conta</CardTitle>
            <CardDescription>
              Informe seu e-mail e senha cadastrados para acessar o sistema.
            </CardDescription>
          </CardHeader>

          <CardContent className="gap-4">
            {errorMessage ? (
              <View className="rounded-xl border border-[#FF3B30]/20 bg-[#FF3B30]/10 p-3">
                <Text className="text-sm font-medium text-[#FF3B30]">{errorMessage}</Text>
              </View>
            ) : null}

            <Input
              label="E-mail"
              placeholder="seu.email@exemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMessage) setErrorMessage(null);
              }}
            />

            <Input
              label="Senha"
              placeholder="Sua senha secreta"
              showPasswordToggle
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errorMessage) setErrorMessage(null);
              }}
            />
          </CardContent>

          <CardFooter className="flex-col gap-3 pt-4">
            <Button
              className="w-full"
              label="Entrar"
              loading={isSubmitting}
              onPress={handleLogin}
            />

            <Button
              variant="ghost"
              className="w-full"
              label="Não tem uma conta? Cadastre-se"
              onPress={() => router.push("/(auth)/register")}
            />
          </CardFooter>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
