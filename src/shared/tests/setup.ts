/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */

// Mock @expo/ui universal components
jest.mock("@expo/ui", () => {
  const ReactMod = require("react");
  const { View, Text, TextInput, Switch, Pressable } = require("react-native");

  const Host = ({ children, ...props }: any) =>
    ReactMod.createElement(View, { testID: "expo-ui-host", ...props }, children);

  const Button = ({ label, children, onPress, disabled, ...props }: any) =>
    ReactMod.createElement(
      Pressable,
      {
        onPress: disabled ? undefined : onPress,
        disabled,
        accessibilityRole: "button",
        ...props,
      },
      label ? ReactMod.createElement(Text, null, label) : children,
    );

  const BottomSheet = ({ isPresented, children, ...props }: any) =>
    isPresented
      ? ReactMod.createElement(View, { testID: "expo-ui-bottom-sheet", ...props }, children)
      : null;

  const Column = ({ children, ...props }: any) =>
    ReactMod.createElement(View, { style: { flexDirection: "column" }, ...props }, children);

  const Row = ({ children, ...props }: any) =>
    ReactMod.createElement(View, { style: { flexDirection: "row" }, ...props }, children);

  const List = ({ children, ...props }: any) =>
    ReactMod.createElement(View, { testID: "expo-ui-list", ...props }, children);

  const ListItem = ({ children, ...props }: any) =>
    ReactMod.createElement(View, { testID: "expo-ui-list-item", ...props }, children);

  const FieldGroup = ({ children, ...props }: any) =>
    ReactMod.createElement(View, { testID: "expo-ui-field-group", ...props }, children);

  const Collapsible = ({ children, ...props }: any) =>
    ReactMod.createElement(View, { testID: "expo-ui-collapsible", ...props }, children);

  const Spacer = (props: any) =>
    ReactMod.createElement(View, { testID: "expo-ui-spacer", ...props });

  const Slider = (props: any) =>
    ReactMod.createElement(View, { testID: "expo-ui-slider", ...props });

  const Picker = ({ children, ...props }: any) =>
    ReactMod.createElement(View, { testID: "expo-ui-picker", ...props }, children);

  const Icon = (props: any) => ReactMod.createElement(View, { testID: "expo-ui-icon", ...props });

  return {
    Host,
    Button,
    TextInput,
    Switch,
    BottomSheet,
    Column,
    Row,
    Text,
    List,
    ListItem,
    FieldGroup,
    Collapsible,
    Spacer,
    Slider,
    Picker,
    Icon,
  };
});

// Mock @expo/ui/community/datetime-picker
jest.mock("@expo/ui/community/datetime-picker", () => {
  const ReactMod = require("react");
  const { View } = require("react-native");

  const DateTimePicker = (props: any) =>
    ReactMod.createElement(View, {
      testID: "expo-ui-datetime-picker",
      ...props,
    });

  return {
    __esModule: true,
    default: DateTimePicker,
    DateTimePicker,
  };
});

// Mock platform-specific subpaths
jest.mock("@expo/ui/swift-ui", () => {
  const ReactMod = require("react");
  const { View, Text, Pressable } = require("react-native");

  const Alert = ({ title, children, isPresented, ...props }: any) =>
    isPresented
      ? ReactMod.createElement(
          View,
          { testID: "expo-ui-swiftui-alert", accessibilityLabel: title, ...props },
          children,
        )
      : null;

  Alert.Trigger = ({ children }: any) =>
    ReactMod.createElement(View, { testID: "alert-trigger" }, children);
  Alert.Actions = ({ children }: any) =>
    ReactMod.createElement(View, { testID: "alert-actions" }, children);
  Alert.Message = ({ children }: any) =>
    ReactMod.createElement(View, { testID: "alert-message" }, children);

  const Button = ({ label, onPress, children, ...props }: any) =>
    ReactMod.createElement(
      Pressable,
      { onPress, accessibilityRole: "button", ...props },
      label ? ReactMod.createElement(Text, null, label) : children,
    );

  const Spacer = (props: any) => ReactMod.createElement(View, { testID: "spacer", ...props });

  return {
    Alert,
    Button,
    Text,
    Spacer,
  };
});

jest.mock("@expo/ui/jetpack-compose", () => {
  const ReactMod = require("react");
  const { View, Text, Pressable } = require("react-native");

  const AlertDialog = ({ children, _onDismissRequest, ...props }: any) =>
    ReactMod.createElement(View, { testID: "expo-ui-compose-alert-dialog", ...props }, children);

  AlertDialog.Title = ({ children }: any) =>
    ReactMod.createElement(View, { testID: "alert-dialog-title" }, children);
  AlertDialog.Text = ({ children }: any) =>
    ReactMod.createElement(View, { testID: "alert-dialog-text" }, children);
  AlertDialog.ConfirmButton = ({ children }: any) =>
    ReactMod.createElement(View, { testID: "alert-dialog-confirm" }, children);
  AlertDialog.DismissButton = ({ children }: any) =>
    ReactMod.createElement(View, { testID: "alert-dialog-dismiss" }, children);
  AlertDialog.Icon = ({ children }: any) =>
    ReactMod.createElement(View, { testID: "alert-dialog-icon" }, children);

  const Button = ({ onClick, children, ...props }: any) =>
    ReactMod.createElement(
      Pressable,
      { onPress: onClick, accessibilityRole: "button", ...props },
      children,
    );

  const TextButton = ({ onClick, children, ...props }: any) =>
    ReactMod.createElement(
      Pressable,
      { onPress: onClick, accessibilityRole: "button", ...props },
      children,
    );

  return {
    AlertDialog,
    Button,
    TextButton,
    Text,
  };
});

// Mock sonner-native
jest.mock("sonner-native", () => {
  const ReactMod = require("react");
  const { View } = require("react-native");

  const Toaster = (props: any) =>
    ReactMod.createElement(View, { testID: "sonner-native-toaster", ...props });

  const toastMock = jest.fn((_message?: string, _options?: any) => "toast-id-default");
  (toastMock as any).success = jest.fn((_message?: string, _options?: any) => "toast-id-success");
  (toastMock as any).error = jest.fn((_message?: string, _options?: any) => "toast-id-error");
  (toastMock as any).info = jest.fn((_message?: string, _options?: any) => "toast-id-info");
  (toastMock as any).warning = jest.fn((_message?: string, _options?: any) => "toast-id-warning");
  (toastMock as any).dismiss = jest.fn((id?: string | number) => id);
  (toastMock as any).custom = jest.fn(() => "toast-id-custom");
  (toastMock as any).promise = jest.fn(() => "toast-id-promise");
  (toastMock as any).loading = jest.fn(() => "toast-id-loading");
  (toastMock as any).wiggle = jest.fn();

  return {
    Toaster,
    toast: toastMock,
  };
});

// Mock expo-secure-store in-memory
jest.mock("expo-secure-store", () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
    isAvailableAsync: jest.fn(async () => true),
  };
});
