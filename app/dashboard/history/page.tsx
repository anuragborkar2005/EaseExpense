"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { format } from "date-fns";
import { Calendar, Filter, Search } from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Expense } from "@/types/expense";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<import("firebase/auth").User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setLoading(false);
      } else {
        setLoading(false);
        // router.push("/login");
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "expenses"),
      where("userId", "==", user.uid),
      orderBy("date", "desc")
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
      setFilteredExpenses(expensesData);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    let result = expenses;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (expense) =>
          expense.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          expense.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter) {
      result = result.filter((expense) => expense.category === categoryFilter);
    }

    // Apply date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      result = result.filter((expense) => {
        const expenseDate = new Date(expense.date.toDate());
        return (
          expenseDate.getDate() === filterDate.getDate() &&
          expenseDate.getMonth() === filterDate.getMonth() &&
          expenseDate.getFullYear() === filterDate.getFullYear()
        );
      });
    }

    setFilteredExpenses(result);
  }, [expenses, searchTerm, categoryFilter, dateFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setDateFilter(undefined);
  };

  const categories = Array.from(
    new Set(expenses.map((expense) => expense.category))
  );

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Food: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Transportation:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      Housing:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      Entertainment:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      Shopping: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      Utilities:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      Healthcare: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      Other: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    };

    return colors[category] || colors.Other;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const getSize = (category: string) => {
    if (category.length > 7) {
      return "sm:text-[8px]";
    }
    return "text-xs";
  };

  return (
    <div className="flex min-h-screen flex-col">
      {user ? <DashboardHeader user={user} /> : null}
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Expense History</h1>
            <p className="text-muted-foreground">
              View and search your complete expense history
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>
                Filter your expenses by keyword, category, or date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search expenses..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !dateFilter && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateFilter ? format(dateFilter, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={dateFilter}
                      onSelect={setDateFilter}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Button variant="outline" onClick={clearFilters}>
                  <Filter className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense History</CardTitle>
              <CardDescription>
                {filteredExpenses.length} expenses found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredExpenses.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                  <h3 className="mb-2 text-lg font-semibold">
                    No expenses found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters or add new expenses.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border overflow">
                  <Table className="min-w-full table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">
                          Description
                        </TableHead>
                        <TableHead className="min-w-[120px] ">
                          Category
                        </TableHead>
                        <TableHead className="min-w-[100px]">Amount</TableHead>
                        <TableHead className="min-w-[120px] hidden md:table-cell">
                          Date
                        </TableHead>
                        <TableHead className="min-w-[120px] text-right hidden md:table-cell">
                          Notes
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell className="font-medium text-xs break-words truncate sm:w-[24px]">
                            {expense.description}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 ${getSize(
                                expense.category
                              )}  font-medium ${getCategoryColor(
                                expense.category
                              )}`}
                            >
                              {expense.category}
                            </span>
                          </TableCell>
                          <TableCell>₹{expense.amount.toFixed(2)}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {format(
                              new Date(expense.date.toDate()),
                              "MMM d, yyyy"
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs truncate hidden md:table-cell">
                            {expense.notes || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
