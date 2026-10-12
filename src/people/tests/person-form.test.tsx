import * as React from "react";
import { PersonForm } from "../components/PersonForm";
import { Person } from "../types/people.types";

describe("PersonForm (TDD & Unit)", () => {
  const mockPerson: Person = {
    id: "person-1",
    userId: "user-1",
    name: "Lucas Mendes",
    color: "#007AFF",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("should instantiate PersonForm in create mode", () => {
    const handleSave = jest.fn();
    const handleCancel = jest.fn();

    const element = <PersonForm onSave={handleSave} onCancel={handleCancel} />;

    expect(element).toBeDefined();
    expect(element.props.personToEdit).toBeUndefined();
  });

  it("should instantiate PersonForm in edit mode with existing person", () => {
    const handleSave = jest.fn();
    const handleCancel = jest.fn();

    const element = (
      <PersonForm personToEdit={mockPerson} onSave={handleSave} onCancel={handleCancel} />
    );

    expect(element).toBeDefined();
    expect(element.props.personToEdit?.name).toBe("Lucas Mendes");
    expect(element.props.personToEdit?.color).toBe("#007AFF");
  });
});
