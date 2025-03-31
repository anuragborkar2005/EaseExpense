"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Expense } from "@/types/expense";

export default function AnalyticsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setLoading(false);
      } else {
        setLoading(false);
        router.push("/login");
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "expenses"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const expensesData: Expense[] = [];
      querySnapshot.forEach((doc) => {
        expensesData.push({
          id: doc.id,
          ...doc.data(),
        } as Expense);
      });
      setExpenses(expensesData);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Calculate category totals
  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Sort categories by total amount
  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([category, total]) => ({ category, total }));

  // Calculate monthly totals
  const monthlyTotals = expenses.reduce((acc, expense) => {
    const date = new Date(expense.date.toDate());
    const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
    if (!acc[monthYear]) {
      acc[monthYear] = 0;
    }
    acc[monthYear] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Sort months chronologically
  const sortedMonths = Object.entries(monthlyTotals)
    .sort((a, b) => {
      const [yearA, monthA] = a[0].split("-").map(Number);
      const [yearB, monthB] = b[0].split("-").map(Number);
      return yearA !== yearB ? yearA - yearB : monthA - monthB;
    })
    .map(([monthYear, total]) => {
      const [year, month] = monthYear.split("-").map(Number);
      const date = new Date(year, month - 1);
      const monthName = date.toLocaleString("default", { month: "long" });
      return { month: `${monthName} ${year}`, total };
    });

  return (
    <div className="flex min-h-screen flex-col">
      {user ? <DashboardHeader user={user} /> : null}
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">
              Visualize and analyze your spending patterns
            </p>
          </div>

          <Tabs defaultValue="categories">
            <TabsList className="mb-4">
              <TabsTrigger value="categories">By Category</TabsTrigger>
              <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
            </TabsList>
            <TabsContent value="categories">
              <Card>
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                  <CardDescription>
                    See how your expenses are distributed across different
                    categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {sortedCategories.length === 0 ? (
                    <div className="flex h-40 items-center justify-center">
                      <p className="text-muted-foreground">
                        No expense data available
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sortedCategories.map(({ category, total }) => (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{category}</span>
                            <span>₹{total.toFixed(2)}</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-primary"
                              style={{
                                width: `${
                                  (total / sortedCategories[0].total) * 100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="monthly">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Spending Trends</CardTitle>
                  <CardDescription>
                    Track how your spending changes month over month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {sortedMonths.length === 0 ? (
                    <div className="flex h-40 items-center justify-center">
                      <p className="text-muted-foreground">
                        No expense data available
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="relative h-60">
                        <div className="absolute inset-0 flex items-end justify-between">
                          {sortedMonths.map(({ month, total }) => {
                            const maxTotal = Math.max(
                              ...sortedMonths.map((m) => m.total)
                            );
                            const height = `${(total / maxTotal) * 100}%`;

                            return (
                              <div
                                key={month}
                                className="flex h-full flex-col items-center justify-end"
                              >
                                <div
                                  className="w-12 bg-primary rounded-t-md"
                                  style={{ height }}
                                ></div>
                                <div className="mt-2 text-xs text-muted-foreground whitespace-nowrap">
                                  {month.split(" ")[0].substring(0, 3)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="space-y-4">
                        {sortedMonths.map(({ month, total }) => (
                          <div
                            key={month}
                            className="flex items-center justify-between"
                          >
                            <span className="font-medium">{month}</span>
                            <span>₹{total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
