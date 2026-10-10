import * as React from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { ModalSheet, Button, Input, Card, Badge } from "@/shared/components";

export default function ExampleModalScreen() {
  const [name, setName] = React.useState("Demonstração ModalSheet");
  const [description, setDescription] = React.useState("Testando folha modal nativa com formSheet");

  return (
    <ModalSheet>
      <ModalSheet.Header
        title="Exemplo de Folha Modal"
        subtitle="Validação visual do componente padronizado ModalSheet"
      />

      <ModalSheet.Body>
        <Card className="gap-2 bg-primary/5 border-primary/20">
          <View className="flex-row items-center gap-2">
            <Badge variant="default">Nativo</Badge>
            <Text className="text-xs font-semibold text-primary">Expo Router formSheet</Text>
          </View>
          <Text className="text-xs text-muted-foreground leading-relaxed">
            Esta folha modal utiliza a apresentação nativa do sistema operacional (iOS Detents e
            transição nativa no Android), com fechamento nativo por gesto ou botão superior.
          </Text>
        </Card>

        <Input
          label="Título de Teste"
          placeholder="Digite um título..."
          value={name}
          onChangeText={setName}
        />

        <Input
          label="Descrição de Teste"
          placeholder="Digite uma descrição..."
          value={description}
          onChangeText={setDescription}
        />
      </ModalSheet.Body>

      <ModalSheet.Footer>
        <Button variant="outline" label="Cancelar" onPress={() => router.back()} />
        <Button variant="default" label="Confirmar" onPress={() => router.back()} />
      </ModalSheet.Footer>
    </ModalSheet>
  );
}
