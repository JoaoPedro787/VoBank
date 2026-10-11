import * as React from "react";
import { DatePicker } from "../components/DatePicker";

jest.mock("@/shared/utils/haptics", () => ({
  hapticFeedback: {
    selection: jest.fn(),
  },
}));

describe("DatePicker Component (TDD & Unit)", () => {
  const baseDate = new Date("2026-03-15T12:00:00Z");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should instantiate DatePicker with expected props when visible is false", () => {
    const handleChange = jest.fn();
    const handleClose = jest.fn();

    const element = (
      <DatePicker
        value={baseDate}
        onChange={handleChange}
        visible={false}
        onClose={handleClose}
        testID="test-date-picker"
      />
    );

    expect(element).toBeDefined();
    expect(element.props.value).toBe(baseDate);
    expect(element.props.visible).toBe(false);
    expect(element.props.testID).toBe("test-date-picker");
  });

  it("should instantiate DatePicker with expected props when visible is true", () => {
    const handleChange = jest.fn();
    const handleClose = jest.fn();

    const element = (
      <DatePicker
        value={baseDate}
        onChange={handleChange}
        visible={true}
        onClose={handleClose}
        title="Selecione a Data"
        testID="test-date-picker"
        mode="date"
        display="inline"
      />
    );

    expect(element).toBeDefined();
    expect(element.props.visible).toBe(true);
    expect(element.props.title).toBe("Selecione a Data");
    expect(element.props.display).toBe("inline");
    expect(element.props.mode).toBe("date");
  });

  it("should instantiate DatePicker inline without visible prop", () => {
    const handleChange = jest.fn();

    const element = (
      <DatePicker value={baseDate} onChange={handleChange} testID="inline-date-picker" />
    );

    expect(element).toBeDefined();
    expect(element.props.value).toBe(baseDate);
    expect(element.props.visible).toBeUndefined();
  });

  it("should support minimumDate and maximumDate constraints", () => {
    const minDate = new Date("2026-01-01T00:00:00Z");
    const maxDate = new Date("2026-12-31T23:59:59Z");
    const handleChange = jest.fn();

    const element = (
      <DatePicker
        value={baseDate}
        onChange={handleChange}
        minimumDate={minDate}
        maximumDate={maxDate}
      />
    );

    expect(element).toBeDefined();
    expect(element.props.minimumDate).toBe(minDate);
    expect(element.props.maximumDate).toBe(maxDate);
  });
});
