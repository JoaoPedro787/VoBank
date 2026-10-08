import * as React from "react";
import { PersonModal } from "../components/PersonModal";
import { Person } from "../types/people.types";

describe("PersonModal Bottom Sheet (TDD & Unit)", () => {
  const mockPerson: Person = {
    id: "person-1",
    userId: "user-1",
    name: "Lucas Mendes",
    color: "#007AFF",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("should instantiate PersonModal in create mode", () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const element = <PersonModal visible={true} onClose={handleClose} onSave={handleSave} />;

    expect(element).toBeDefined();
    expect(element.props.visible).toBe(true);
    expect(element.props.personToEdit).toBeUndefined();
  });

  it("should instantiate PersonModal in edit mode with existing person", () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const element = (
      <PersonModal
        visible={true}
        onClose={handleClose}
        onSave={handleSave}
        personToEdit={mockPerson}
      />
    );

    expect(element).toBeDefined();
    expect(element.props.visible).toBe(true);
    expect(element.props.personToEdit?.name).toBe("Lucas Mendes");
    expect(element.props.personToEdit?.color).toBe("#007AFF");
  });
});
