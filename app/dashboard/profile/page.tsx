"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { format } from "date-fns";
import {
  Calendar,
  CreditCard,
  IndianRupee,
  Mail,
  Tag,
  User as UserIcon,
} from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Expense } from "@/types/expense";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  interface UserData {
    name?: string;
    createdAt?: string;
  }

  const [userData, setUserData] = useState<UserData | null>(null);
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalAmount: 0,
    avgAmount: 0,
    categories: 0,
    paymentMethods: 0,
    firstExpenseDate: null as Date | null,
    lastExpenseDate: null as Date | null,
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchUserData(user.uid);
        fetchUserStats(user.uid);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  const fetchUserData = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchUserStats = async (userId: string) => {
    try {
      // Fetch expenses
      const expensesQuery = query(
        collection(db, "expenses"),
        where("userId", "==", userId)
      );
      const expensesSnapshot = await getDocs(expensesQuery);
      const expenses: Expense[] = [];
      expensesSnapshot.forEach((doc) => {
        expenses.push({ id: doc.id, ...doc.data() } as Expense);
      });

      // Fetch categories
      const categoriesQuery = query(
        collection(db, "categories"),
        where("userId", "==", userId)
      );
      const categoriesSnapshot = await getDocs(categoriesQuery);
      const categoriesCount = categoriesSnapshot.size;

      // Fetch payment methods
      const paymentMethodsQuery = query(
        collection(db, "paymentMethods"),
        where("userId", "==", userId)
      );
      const paymentMethodsSnapshot = await getDocs(paymentMethodsQuery);
      const paymentMethodsCount = paymentMethodsSnapshot.size;

      // Calculate stats
      const totalAmount = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );
      const avgAmount = expenses.length > 0 ? totalAmount / expenses.length : 0;

      // Find first and last expense dates
      let firstExpenseDate: Date | null = null;
      let lastExpenseDate: Date | null = null;

      if (expenses.length > 0) {
        const sortedExpenses = [...expenses].sort(
          (a, b) =>
            new Date(a.date.toDate()).getTime() -
            new Date(b.date.toDate()).getTime()
        );
        firstExpenseDate = new Date(sortedExpenses[0].date.toDate());
        lastExpenseDate = new Date(
          sortedExpenses[sortedExpenses.length - 1].date.toDate()
        );
      }

      setStats({
        totalExpenses: expenses.length,
        totalAmount,
        avgAmount,
        categories: categoriesCount,
        paymentMethods: paymentMethodsCount,
        firstExpenseDate,
        lastExpenseDate,
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {user ? <DashboardHeader user={user} /> : null}
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">
              View your profile information and expense statistics
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
                <CardDescription>Your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="text-2xl">
                      {userData?.name ? getInitials(userData.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-bold">
                    {userData?.name || "User"}
                  </h2>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Account Created</p>
                      <p className="text-sm text-muted-foreground">
                        {userData?.createdAt
                          ? format(new Date(userData.createdAt), "MMMM d, yyyy")
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/dashboard/settings")}
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Statistics</CardTitle>
                <CardDescription>
                  Summary of your expense tracking activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Total Expenses</p>
                    </div>
                    <p className="text-2xl font-bold">{stats.totalExpenses}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Total Amount</p>
                    </div>
                    <p className="text-2xl font-bold">
                      ₹{stats.totalAmount.toFixed(2)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Categories</p>
                    </div>
                    <p className="text-2xl font-bold">{stats.categories}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Payment Methods</p>
                    </div>
                    <p className="text-2xl font-bold">{stats.paymentMethods}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <IndianRupee className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Average Expense</p>
                      <p className="text-sm text-muted-foreground">
                        ${stats.avgAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {stats.firstExpenseDate && (
                    <div className="flex items-center space-x-4">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">First Expense</p>
                        <p className="text-sm text-muted-foreground">
                          {format(stats.firstExpenseDate, "MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  )}

                  {stats.lastExpenseDate && (
                    <div className="flex items-center space-x-4">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Latest Expense</p>
                        <p className="text-sm text-muted-foreground">
                          {format(stats.lastExpenseDate, "MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/dashboard/analytics")}
                >
                  View Detailed Analytics
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => router.push("/dashboard/settings")}
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() =>
                    router.push("/dashboard/settings?tab=password")
                  }
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() =>
                    router.push("/dashboard/settings?tab=notifications")
                  }
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
