import {
  calculatePurchaseSplitsAndInstallments,
  CalculatedInstallment,
  CalculatedInstallmentSplit,
} from "../utils/purchase-split";

describe("Purchase Split & Installment Calculation (TDD)", () => {
  const dummyPersonId = "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e";
  const dummyPersonId2 = "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f";

  const sampleDates = [
    {
      installmentNumber: 1,
      dueDate: new Date(Date.UTC(2025, 3, 5)),
      billingMonth: 4,
      billingYear: 2025,
    },
    {
      installmentNumber: 2,
      dueDate: new Date(Date.UTC(2025, 4, 5)),
      billingMonth: 5,
      billingYear: 2025,
    },
    {
      installmentNumber: 3,
      dueDate: new Date(Date.UTC(2025, 5, 5)),
      billingMonth: 6,
      billingYear: 2025,
    },
  ];

  describe("Without splits (default to 100% owner)", () => {
    it("should assign 100% of each installment to the owner (personId: null)", () => {
      const result = calculatePurchaseSplitsAndInstallments({
        totalAmount: 600,
        totalInstallments: 3,
        installmentDates: sampleDates,
      });

      expect(result).toHaveLength(3);
      expect(result[0].amount).toBe(200);
      expect(result[1].amount).toBe(200);
      expect(result[2].amount).toBe(200);

      result.forEach((inst: CalculatedInstallment, idx: number) => {
        expect(inst.installmentNumber).toBe(idx + 1);
        expect(inst.splits).toHaveLength(1);
        expect(inst.splits[0].personId).toBeNull();
        expect(inst.splits[0].amount).toBe(200);
        expect(inst.splits[0].percentage).toBe(100);
      });
    });

    it("should handle odd amounts with centavo rounding on first installment", () => {
      const result = calculatePurchaseSplitsAndInstallments({
        totalAmount: 100,
        totalInstallments: 3,
        installmentDates: sampleDates,
      });

      // 100 / 3 = 33.33 each, remainder 0.01 added to first
      expect(result[0].amount).toBe(33.34);
      expect(result[1].amount).toBe(33.33);
      expect(result[2].amount).toBe(33.33);

      const totalCalculated = result.reduce(
        (acc: number, curr: CalculatedInstallment) => acc + curr.amount,
        0,
      );
      expect(Number(totalCalculated.toFixed(2))).toBe(100);
    });
  });

  describe("Splitting by Percentage", () => {
    it("Scenario: 50% split between owner and a registered person", () => {
      const result = calculatePurchaseSplitsAndInstallments({
        totalAmount: 300,
        totalInstallments: 3,
        installmentDates: sampleDates,
        splits: [
          { personId: null, percentage: 50 },
          { personId: dummyPersonId, percentage: 50 },
        ],
      });

      expect(result).toHaveLength(3);

      let ownerTotal = 0;
      let friendTotal = 0;

      result.forEach((inst: CalculatedInstallment) => {
        expect(inst.amount).toBe(100);
        expect(inst.splits).toHaveLength(2);

        const ownerSplit = inst.splits.find((s: CalculatedInstallmentSplit) => s.personId === null);
        const friendSplit = inst.splits.find(
          (s: CalculatedInstallmentSplit) => s.personId === dummyPersonId,
        );

        expect(ownerSplit?.amount).toBe(50);
        expect(friendSplit?.amount).toBe(50);

        ownerTotal += ownerSplit?.amount ?? 0;
        friendTotal += friendSplit?.amount ?? 0;
      });

      expect(ownerTotal).toBe(150);
      expect(friendTotal).toBe(150);
    });

    it("should handle percentage splits with centavos rounding accurately", () => {
      // R$ 100 divided into 3 equal 33.33% splits for 3 people in 2 installments
      const twoMonthDates = sampleDates.slice(0, 2);
      const result = calculatePurchaseSplitsAndInstallments({
        totalAmount: 100,
        totalInstallments: 2,
        installmentDates: twoMonthDates,
        splits: [
          { personId: null, percentage: 33.34 },
          { personId: dummyPersonId, percentage: 33.33 },
          { personId: dummyPersonId2, percentage: 33.33 },
        ],
      });

      // Total installments sum
      const totalSum = result.reduce(
        (acc: number, inst: CalculatedInstallment) => acc + inst.amount,
        0,
      );
      expect(Number(totalSum.toFixed(2))).toBe(100);

      // Total per split across all installments sum
      let totalOwner = 0;
      let totalFriend1 = 0;
      let totalFriend2 = 0;

      result.forEach((inst: CalculatedInstallment) => {
        const splitSum = inst.splits.reduce(
          (acc: number, s: CalculatedInstallmentSplit) => acc + s.amount,
          0,
        );
        expect(Number(splitSum.toFixed(2))).toBe(inst.amount);

        totalOwner += inst.splits.find(
          (s: CalculatedInstallmentSplit) => s.personId === null,
        )!.amount;
        totalFriend1 += inst.splits.find(
          (s: CalculatedInstallmentSplit) => s.personId === dummyPersonId,
        )!.amount;
        totalFriend2 += inst.splits.find(
          (s: CalculatedInstallmentSplit) => s.personId === dummyPersonId2,
        )!.amount;
      });

      expect(Number((totalOwner + totalFriend1 + totalFriend2).toFixed(2))).toBe(100);
    });
  });

  describe("Splitting by Fixed Amount", () => {
    it("Scenario: Person owes fixed R$ 150 of a R$ 300 purchase in 3 installments", () => {
      const result = calculatePurchaseSplitsAndInstallments({
        totalAmount: 300,
        totalInstallments: 3,
        installmentDates: sampleDates,
        splits: [
          { personId: dummyPersonId, amount: 150 },
          { personId: null, amount: 150 },
        ],
      });

      let friendTotal = 0;
      let ownerTotal = 0;

      result.forEach((inst: CalculatedInstallment) => {
        expect(inst.amount).toBe(100);
        const friend = inst.splits.find(
          (s: CalculatedInstallmentSplit) => s.personId === dummyPersonId,
        );
        const owner = inst.splits.find((s: CalculatedInstallmentSplit) => s.personId === null);
        expect(friend?.amount).toBe(50);
        expect(owner?.amount).toBe(50);
        friendTotal += friend?.amount ?? 0;
        ownerTotal += owner?.amount ?? 0;
      });

      expect(friendTotal).toBe(150);
      expect(ownerTotal).toBe(150);
    });

    it("should auto-fill owner portion if only friend fixed amount is provided", () => {
      const result = calculatePurchaseSplitsAndInstallments({
        totalAmount: 500,
        totalInstallments: 2,
        installmentDates: sampleDates.slice(0, 2),
        splits: [{ personId: dummyPersonId, amount: 200 }],
      });

      // Friend has 200 (40%), Owner gets remaining 300 (60%)
      let friendTotal = 0;
      let ownerTotal = 0;

      result.forEach((inst: CalculatedInstallment) => {
        expect(inst.amount).toBe(250);
        const friend = inst.splits.find(
          (s: CalculatedInstallmentSplit) => s.personId === dummyPersonId,
        );
        const owner = inst.splits.find((s: CalculatedInstallmentSplit) => s.personId === null);
        expect(friend?.amount).toBe(100);
        expect(owner?.amount).toBe(150);
        friendTotal += friend!.amount;
        ownerTotal += owner!.amount;
      });

      expect(friendTotal).toBe(200);
      expect(ownerTotal).toBe(300);
    });
  });

  describe("Validation & Edge Cases", () => {
    it("should throw error if fixed split amounts sum to more than totalAmount", () => {
      expect(() => {
        calculatePurchaseSplitsAndInstallments({
          totalAmount: 100,
          totalInstallments: 1,
          installmentDates: sampleDates.slice(0, 1),
          splits: [{ personId: dummyPersonId, amount: 150 }],
        });
      }).toThrow();
    });

    it("should throw error if percentages sum to more than 100", () => {
      expect(() => {
        calculatePurchaseSplitsAndInstallments({
          totalAmount: 100,
          totalInstallments: 1,
          installmentDates: sampleDates.slice(0, 1),
          splits: [
            { personId: null, percentage: 60 },
            { personId: dummyPersonId, percentage: 50 },
          ],
        });
      }).toThrow();
    });
  });
});
