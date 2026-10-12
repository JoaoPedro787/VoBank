import * as React from "react";
import { Logo } from "../components/Logo";

describe("Logo Component (Unit)", () => {
  it("renders with default props", () => {
    const logo = <Logo testID="app-logo" />;
    expect(logo).toBeDefined();
    expect(logo.props.testID).toBe("app-logo");
    expect(logo.type).toBe(Logo);
  });

  it("renders with custom size and className", () => {
    const logo = <Logo size={80} className="mb-4" />;
    expect(logo).toBeDefined();
    expect(logo.props.size).toBe(80);
    expect(logo.props.className).toBe("mb-4");
  });
});
