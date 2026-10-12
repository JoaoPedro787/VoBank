import * as React from "react";
import { MonthSelector } from "../components/MonthSelector";

describe("MonthSelector Component (TDD & Unit)", () => {
  it("should instantiate MonthSelector with month, year and navigation handlers", () => {
    const handlePrev = jest.fn();
    const handleNext = jest.fn();
    const handleSelect = jest.fn();

    const element = (
      <MonthSelector
        month={10}
        year={2026}
        onPrevMonth={handlePrev}
        onNextMonth={handleNext}
        onSelectMonthYear={handleSelect}
      />
    );

    expect(element).toBeDefined();
    expect(element.props.month).toBe(10);
    expect(element.props.year).toBe(2026);
    expect(element.props.onPrevMonth).toBe(handlePrev);
    expect(element.props.onNextMonth).toBe(handleNext);
    expect(element.props.onSelectMonthYear).toBe(handleSelect);
  });
});
