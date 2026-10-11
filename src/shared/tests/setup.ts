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
jest.mock("@expo/ui/swift-ui", () => ({}));
jest.mock("@expo/ui/jetpack-compose", () => ({}));
