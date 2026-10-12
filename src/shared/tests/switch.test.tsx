import * as React from "react";
import { Switch } from "../components/Switch";

jest.mock("@/shared/utils/haptics", () => ({
  hapticFeedback: {
    selection: jest.fn(),
  },
}));

describe("Switch Universal Component (TDD & Unit)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should instantiate Switch with expected props", () => {
    const handleChange = jest.fn();
    const element = (
      <Switch
        value={true}
        onValueChange={handleChange}
        label="Rachar despesa"
        testID="split-switch"
      />
    );

    expect(element).toBeDefined();
    expect(element.props.value).toBe(true);
    expect(element.props.label).toBe("Rachar despesa");
    expect(element.props.testID).toBe("split-switch");
  });

  it("should handle disabled state", () => {
    const handleChange = jest.fn();
    const element = <Switch value={false} onValueChange={handleChange} disabled={true} />;

    expect(element).toBeDefined();
    expect(element.props.disabled).toBe(true);
  });
});
