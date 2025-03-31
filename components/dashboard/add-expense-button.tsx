"use client";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { AddExpenseDialog } from "./add-expense-dialog";
import React, { useState } from "react";

export const AddExpenseButton = () => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <>
      <Button
        className="fixed bottom-6 right-6 h-14-w-14 rounded-full shadow-lg"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">Add Expense</span>
      </Button>
      <AddExpenseDialog open={open} onOpenChange={setOpen} />
    </>
  );
};
