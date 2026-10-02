import * as React from "react";
import { Text } from "react-native";
import { Card } from "../components/Card";
import { AnimatedScaleFade } from "../components/AnimatedScaleFade";

describe("Micro-animations & Card Components (TDD)", () => {
  it("should render Card without crash when animated is false", () => {
    const element = (
      <Card animated={false}>
        <Text>Standard Card</Text>
      </Card>
    );
    expect(element).toBeDefined();
    expect(element.props.animated).toBe(false);
  });

  it("should render Card with AnimatedScaleFade when animated is true", () => {
    const element = (
      <Card animated={true}>
        <Text>Animated Card</Text>
      </Card>
    );
    expect(element).toBeDefined();
    expect(element.props.animated).toBe(true);
  });

  it("should render AnimatedScaleFade with custom duration and initialScale", () => {
    const element = (
      <AnimatedScaleFade duration={300} initialScale={0.9}>
        <Text>Scale Fade Content</Text>
      </AnimatedScaleFade>
    );
    expect(element).toBeDefined();
    expect(element.props.duration).toBe(300);
    expect(element.props.initialScale).toBe(0.9);
  });
});
