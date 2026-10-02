export interface ScheduleSplitNotificationInput {
  splitId: string;
  installmentId: string;
  purchaseDescription: string;
  amount: number;
  dueDate: string | Date;
  isPaid?: boolean;
}

export interface NotificationDateSchedule {
  triggerDate: Date;
  identifier: string;
  title: string;
  body: string;
  data: {
    splitId: string;
    installmentId: string;
    type: "due_d1" | "due_d0";
  };
}
