import { Timestamp } from "firebase/firestore";

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Timestamp;
  notes?: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
}
