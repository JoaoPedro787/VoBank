import React from "react";
import { Host, Button, Switch, BottomSheet, TextInput } from "@expo/ui";
import DateTimePicker from "@expo/ui/community/datetime-picker";

describe("Expo UI Mocks in Test Environment", () => {
  it("should instantiate Host and universal components without throwing", () => {
    const hostElement = (
      <Host>
        <Button label="Clique aqui" />
        <Switch value={true} onValueChange={jest.fn()} />
        <TextInput placeholder="Digite algo" />
      </Host>
    );

    expect(hostElement).toBeDefined();
    expect(hostElement.props.children).toBeDefined();
  });

  it("should instantiate BottomSheet correctly", () => {
    const sheetElement = (
      <BottomSheet isPresented={true} onDismiss={jest.fn()}>
        <Button label="Fechar" />
      </BottomSheet>
    );

    expect(sheetElement).toBeDefined();
    expect(sheetElement.props.isPresented).toBe(true);
  });

  it("should instantiate DateTimePicker community drop-in correctly", () => {
    const pickerElement = <DateTimePicker value={new Date()} mode="date" />;

    expect(pickerElement).toBeDefined();
    expect(pickerElement.props.mode).toBe("date");
  });
});
