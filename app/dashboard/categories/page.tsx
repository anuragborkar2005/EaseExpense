"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, onAuthStateChanged } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import {
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Edit, Plus, Trash2 } from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Expense } from "@/types/expense";
import { Category } from "@/types/category";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
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

    // Fetch categories
    const categoriesQuery = query(
      collection(db, "categories"),
      where("userId", "==", user.uid)
    );

    const unsubscribeCategories = onSnapshot(
      categoriesQuery,
      (querySnapshot) => {
        const categoriesData: Category[] = [];
        querySnapshot.forEach((doc) => {
          categoriesData.push({
            id: doc.id,
            ...doc.data(),
          } as Category);
        });
        setCategories(categoriesData);
      }
    );

    // Fetch expenses to count usage
    const expensesQuery = query(
      collection(db, "expenses"),
      where("userId", "==", user.uid)
    );

    const unsubscribeExpenses = onSnapshot(expensesQuery, (querySnapshot) => {
      const expensesData: Expense[] = [];
      querySnapshot.forEach((doc) => {
        expensesData.push({
          id: doc.id,
          ...doc.data(),
        } as Expense);
      });
      setExpenses(expensesData);
    });

    return () => {
      unsubscribeCategories();
      unsubscribeExpenses();
    };
  }, [user]);

  const handleAddCategory = async () => {
    if (!user) return;
    if (!newCategory.trim()) return;

    try {
      // Check if category already exists
      const exists = categories.some(
        (cat) => cat.name.toLowerCase() === newCategory.toLowerCase()
      );

      if (exists) {
        toast("Category already exists", {
          description: "Please use a different name.",
        });
        return;
      }

      await addDoc(collection(db, "categories"), {
        name: newCategory,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      });

      setNewCategory("");
      toast("Category added", {
        description: "Your category has been added successfully.",
      });
    } catch (error) {
      toast("Error", {
        description:
          (error as FirebaseError).message || "Failed to add category.",
      });
    }
  };

  const handleUpdateCategory = async () => {
    if (!editCategory || !editCategory.name.trim()) return;

    try {
      // Check if category already exists
      const exists = categories.some(
        (cat) =>
          cat.id !== editCategory.id &&
          cat.name.toLowerCase() === editCategory.name.toLowerCase()
      );

      if (exists) {
        toast("Category already exists", {
          description: "Please use a different name.",
        });
        return;
      }

      await updateDoc(doc(db, "categories", editCategory.id), {
        name: editCategory.name,
        updatedAt: new Date().toISOString(),
      });

      setEditCategory(null);
      toast("Category updated", {
        description: "Your category has been updated successfully.",
      });
    } catch (error) {
      toast("Error", {
        description:
          (error as FirebaseError).message || "Failed to update category.",
      });
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      // Check if category is in use
      const categoryInUse = expenses.some(
        (expense) => expense.category === categoryToDelete.name
      );

      if (categoryInUse) {
        toast("Category in use", {
          description:
            "This category is being used by expenses. Please reassign those expenses first.",
        });
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
        return;
      }

      await deleteDoc(doc(db, "categories", categoryToDelete.id));

      toast("Category deleted", {
        description: "Your category has been deleted successfully.",
      });
    } catch (error) {
      toast("Error", {
        description:
          (error as FirebaseError).message || "Failed to delete category.",
      });
    } finally {
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const getCategoryUsageCount = (categoryName: string) => {
    return expenses.filter((expense) => expense.category === categoryName)
      .length;
  };

  // Initialize default categories if none exist
  useEffect(() => {
    const initializeDefaultCategories = async () => {
      if (!user) return;

      // Only initialize if no categories exist
      if (categories.length === 0) {
        const defaultCategories = [
          "Food",
          "Transportation",
          "Housing",
          "Entertainment",
          "Shopping",
          "Utilities",
          "Healthcare",
          "Other",
        ];

        for (const category of defaultCategories) {
          await addDoc(collection(db, "categories"), {
            name: category,
            userId: user.uid,
            createdAt: new Date().toISOString(),
          });
        }
      }
    };

    if (!loading && user) {
      initializeDefaultCategories();
    }
  }, [categories.length, user]);

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
            <h1 className="text-3xl font-bold">Categories</h1>
            <p className="text-muted-foreground">
              Manage your expense categories
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Category</CardTitle>
              <CardDescription>
                Create a new category for your expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="max-w-sm"
                />
                <Button onClick={handleAddCategory}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Categories</CardTitle>
              <CardDescription>
                Manage and organize your expense categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                  <h3 className="mb-2 text-lg font-semibold">
                    No categories yet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Add your first category to organize your expenses.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category Name</TableHead>
                        <TableHead>Usage Count</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">
                            {category.name}
                          </TableCell>
                          <TableCell>
                            {getCategoryUsageCount(category.name)} expenses
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditCategory(category)}
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Category</DialogTitle>
                                    <DialogDescription>
                                      Update the name of your category.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="py-4">
                                    <Input
                                      placeholder="Category name"
                                      value={editCategory?.name || ""}
                                      onChange={(e) =>
                                        setEditCategory(
                                          editCategory
                                            ? {
                                                ...editCategory,
                                                name: e.target.value,
                                              }
                                            : null
                                        )
                                      }
                                    />
                                  </div>
                                  <DialogFooter>
                                    <Button onClick={handleUpdateCategory}>
                                      Save Changes
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setCategoryToDelete(category);
                                  setDeleteDialogOpen(true);
                                }}
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
                </div>
              )}
            </CardContent>
          </Card>

          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  category from your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteCategory}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </div>
  );
}
