"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { EditExpenseDialog } from "@/components/dashboard/edit-expense-dialog";
import type { Expense } from "@/types/expense";

interface ExpenseListProps {
  expenses: Expense[];
}

export const ExpenseList = ({ expenses }: ExpenseListProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const handleDelete = async () => {
    if (!selectedExpense) return;

    try {
      await deleteDoc(doc(db, "expenses", selectedExpense.id));
      toast("Expense deleted", {
        description: "The expense has been successfully deleted.",
      });
    } catch (error: unknown) {
      console.error("Failed to delete expense:", error);
      toast("Error", {
        description: "Failed to delete the expense. Please try again.",
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const openDeleteDialog = (expense: Expense) => {
    setSelectedExpense(expense);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (expense: Expense) => {
    setSelectedExpense(expense);
    setEditDialogOpen(true);
  };
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
  return (
    <Card className="w-full sm:max-w-md lg:max-w-lg">
      <CardHeader>
        <CardTitle>Recent Expenses</CardTitle>
        <CardDescription>Manage and track your recent expenses</CardDescription>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
            <h3 className="mb-2 text-lg font-semibold">No expenses yet</h3>
            <p className="text-sm text-muted-foreground">
              Add your first expense to start tracking your spending.
            </p>
          </div>
        ) : (
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium text-truncate">
                    {expense.description}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-truncate ${getCategoryColor(
                        expense.category
                      )}`}
                    >
                      {expense.category}
                    </span>
                  </TableCell>
                  <TableCell>₹{expense.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {format(new Date(expense.date.toDate()), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(expense)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(expense)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              expense from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedExpense && (
        <EditExpenseDialog
          expense={selectedExpense}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </Card>
  );
};
