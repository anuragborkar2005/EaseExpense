"use client";

import { useMemo } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  IndianRupee,
  CreditCard,
  Tag,
  Calendar,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Expense } from "@/types/expense";

interface ExpenseSummaryProps {
  expenses: Expense[];
}

export function ExpenseSummary({ expenses }: ExpenseSummaryProps) {
  const totalExpenses = useMemo(() => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }, [expenses]);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const thisMonthExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date.toDate());
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    });
  }, [expenses, currentMonth, currentYear]);

  const thisMonthTotal = useMemo(() => {
    return thisMonthExpenses.reduce(
      (total, expense) => total + expense.amount,
      0
    );
  }, [thisMonthExpenses]);

  const lastMonthExpenses = useMemo(() => {
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date.toDate());
      return (
        expenseDate.getMonth() === lastMonth &&
        expenseDate.getFullYear() === lastMonthYear
      );
    });
  }, [expenses, currentMonth, currentYear]);

  const lastMonthTotal = useMemo(() => {
    return lastMonthExpenses.reduce(
      (total, expense) => total + expense.amount,
      0
    );
  }, [lastMonthExpenses]);

  const percentageChange = useMemo(() => {
    if (lastMonthTotal === 0) return 100;
    return ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
  }, [thisMonthTotal, lastMonthTotal]);

  const topCategory = useMemo(() => {
    const categories: Record<string, number> = {};

    expenses.forEach((expense) => {
      if (categories[expense.category]) {
        categories[expense.category] += expense.amount;
      } else {
        categories[expense.category] = expense.amount;
      }
    });

    let maxCategory = "";
    let maxAmount = 0;

    Object.entries(categories).forEach(([category, amount]) => {
      if (amount > maxAmount) {
        maxCategory = category;
        maxAmount = amount;
      }
    });

    return { category: maxCategory, amount: maxAmount };
  }, [expenses]);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <IndianRupee className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Lifetime total expenses
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${thisMonthTotal.toFixed(2)}</div>
          <div className="flex items-center pt-1">
            {percentageChange > 0 ? (
              <ArrowUpIcon className="mr-1 h-3 w-3 text-destructive" />
            ) : (
              <ArrowDownIcon className="mr-1 h-3 w-3 text-green-500" />
            )}
            <span
              className={`text-xs ${
                percentageChange > 0 ? "text-destructive" : "text-green-500"
              }`}
            >
              {Math.abs(percentageChange).toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              from last month
            </span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Category</CardTitle>
          <Tag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {topCategory.category || "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            ${topCategory.amount.toFixed(2)} total spent
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            $
            {expenses.length
              ? (totalExpenses / expenses.length).toFixed(2)
              : "0.00"}
          </div>
          <p className="text-xs text-muted-foreground">
            {expenses.length} total expenses
          </p>
        </CardContent>
      </Card>
    </>
  );
}
