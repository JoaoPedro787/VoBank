import { cn } from "../lib/utils";

describe("cn helper", () => {
  it("should merge tailwind classes properly", () => {
    const result = cn("px-2 py-1", "bg-primary", { "text-white": true, "opacity-50": false });
    expect(result).toBe("px-2 py-1 bg-primary text-white");
  });

  it("should handle class conflicts by keeping the last one", () => {
    const result = cn("p-4", "p-2");
    expect(result).toBe("p-2");
  });
});
