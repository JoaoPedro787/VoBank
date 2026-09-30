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

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleRegister = async () => {
    setErrorMessage(null);

    if (name.trim().length < 2) {
      setErrorMessage("O nome deve ter no mínimo 2 caracteres.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Por favor, insira um e-mail válido.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("As senhas não coincidem.");
      return;
    }

    try {
      setIsSubmitting(true);
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      router.replace("/(tabs)");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao cadastrar conta";
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
        <View className="mb-6 items-center">
          <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Text className="text-2xl font-bold text-primary-foreground">$</Text>
          </View>
          <Text className="text-3xl font-extrabold tracking-tight text-foreground">
            Criar Conta
          </Text>
          <Text className="mt-1 text-sm text-muted-foreground">
            Comece a organizar suas finanças em poucos segundos
          </Text>
        </View>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Cadastro</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para criar sua conta gratuita.
            </CardDescription>
          </CardHeader>

          <CardContent className="gap-4">
            {errorMessage ? (
              <View className="rounded-xl border border-destructive/20 bg-destructive/10 p-3">
                <Text className="text-sm font-medium text-destructive">{errorMessage}</Text>
              </View>
            ) : null}

            <Input
              label="Nome Completo"
              placeholder="Ex: João Silva"
              autoCapitalize="words"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errorMessage) setErrorMessage(null);
              }}
            />

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
              placeholder="Mínimo de 6 caracteres"
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errorMessage) setErrorMessage(null);
              }}
            />

            <Input
              label="Confirmar Senha"
              placeholder="Digite a senha novamente"
              secureTextEntry
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errorMessage) setErrorMessage(null);
              }}
            />
          </CardContent>

          <CardFooter className="flex-col gap-3 pt-4">
            <Button
              className="w-full"
              label="Cadastrar"
              loading={isSubmitting}
              onPress={handleRegister}
            />

            <Button
              variant="ghost"
              className="w-full"
              label="Já tem uma conta? Entrar"
              onPress={() => router.replace("/(auth)/login")}
            />
          </CardFooter>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
