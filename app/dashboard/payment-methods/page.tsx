"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  Firestore,
  DocumentReference,
  DocumentData,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { CreditCard, Edit, Plus, Trash2 } from "lucide-react";

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
import { PaymentMethod } from "@/types/payment-method";

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [newPaymentMethod, setNewPaymentMethod] = useState("");
  const [editPaymentMethod, setEditPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentMethodToDelete, setPaymentMethodToDelete] =
    useState<PaymentMethod | null>(null);
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

    // Fetch payment methods
    const paymentMethodsQuery = query(
      collection(db, "paymentMethods"),
      where("userId", "==", user.uid)
    );

    const unsubscribePaymentMethods = onSnapshot(
      paymentMethodsQuery,
      (querySnapshot) => {
        const paymentMethodsData: PaymentMethod[] = [];
        querySnapshot.forEach((doc) => {
          paymentMethodsData.push({
            id: doc.id,
            ...doc.data(),
          } as PaymentMethod);
        });
        setPaymentMethods(paymentMethodsData);
      }
    );

    return () => {
      unsubscribePaymentMethods();
    };
  }, [user]);

  const handleAddPaymentMethod = async () => {
    if (!newPaymentMethod.trim() || !user) return;

    try {
      // Check if payment method already exists
      const exists = paymentMethods.some(
        (method) => method.name.toLowerCase() === newPaymentMethod.toLowerCase()
      );

      if (exists) {
        toast("Payment method already exists", {
          description: "Please use a different name.",
        });
        return;
      }

      await addDoc(collection(db, "paymentMethods"), {
        name: newPaymentMethod,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      });

      setNewPaymentMethod("");
      toast("Payment method added", {
        description: "Your payment method has been added successfully.",
      });
    } catch (error) {
      toast("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to add payment method.",
      });
    }
  };

  const handleUpdatePaymentMethod = async () => {
    if (!editPaymentMethod || !editPaymentMethod.name.trim()) return;

    try {
      // Check if payment method already exists
      const exists = paymentMethods.some(
        (method) =>
          method.id !== editPaymentMethod.id &&
          method.name.toLowerCase() === editPaymentMethod.name.toLowerCase()
      );

      if (exists) {
        toast("Payment method already exists", {
          description: "Please use a different name.",
        });
        return;
      }

      await updateDoc(doc(db, "paymentMethods", editPaymentMethod.id), {
        name: editPaymentMethod.name,
        updatedAt: new Date().toISOString(),
      });

      setEditPaymentMethod(null);
      toast("Payment method updated", {
        description: "Your payment method has been updated successfully.",
      });
    } catch (error) {
      toast("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to update payment method.",
      });
    }
  };

  const handleDeletePaymentMethod = async () => {
    if (!paymentMethodToDelete) return;

    try {
      await deleteDoc(doc(db, "paymentMethods", paymentMethodToDelete.id));

      toast("Payment method deleted", {
        description: "Your payment method has been deleted successfully.",
      });
    } catch (error) {
      toast("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete payment method.",
      });
    } finally {
      setDeleteDialogOpen(false);
      setPaymentMethodToDelete(null);
    }
  };

  // Initialize default payment methods if none exist

  interface DefaultPaymentMethodsProps {
    user: User;
    db: Firestore;
  }

  const initializeDefaultPaymentMethods = async ({
    user,
    db,
  }: DefaultPaymentMethodsProps) => {
    if (!user) return;

    const defaultPaymentMethods: string[] = [
      "Cash",
      "Credit Card",
      "Debit Card",
      "Bank Transfer",
      "PayPal",
      "Mobile Payment",
    ];

    try {
      // Check if payment methods already exist for the user
      const methodsQuery = query(
        collection(db, "paymentMethods"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(methodsQuery);

      if (querySnapshot.empty) {
        // Add default payment methods if none exist
        const batch: Promise<DocumentReference<DocumentData>>[] =
          defaultPaymentMethods.map((method) =>
            addDoc(collection(db, "paymentMethods"), {
              name: method,
              userId: user.uid,
              createdAt: new Date().toISOString(),
            })
          );

        await Promise.all(batch); // Handle all Firestore writes efficiently
        console.log("Default payment methods initialized");
      } else {
        console.log("Payment methods already exist");
      }
    } catch (error) {
      console.error("Error initializing default payment methods: ", error);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      initializeDefaultPaymentMethods({ user, db });
    }
  }, [loading, user, db]);

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
            <h1 className="text-3xl font-bold">Payment Methods</h1>
            <p className="text-muted-foreground">
              Manage your payment methods for expenses
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Payment Method</CardTitle>
              <CardDescription>
                Create a new payment method for your expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Payment method name"
                  value={newPaymentMethod}
                  onChange={(e) => setNewPaymentMethod(e.target.value)}
                  className="max-w-sm"
                />
                <Button onClick={handleAddPaymentMethod}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Payment Methods</CardTitle>
              <CardDescription>
                Manage and organize your payment methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentMethods.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                  <h3 className="mb-2 text-lg font-semibold">
                    No payment methods yet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Add your first payment method to organize your expenses.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payment Method</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentMethods.map((method) => (
                        <TableRow key={method.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                              {method.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditPaymentMethod(method)}
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>
                                      Edit Payment Method
                                    </DialogTitle>
                                    <DialogDescription>
                                      Update the name of your payment method.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="py-4">
                                    <Input
                                      placeholder="Payment method name"
                                      value={editPaymentMethod?.name || ""}
                                      onChange={(e) =>
                                        setEditPaymentMethod(
                                          editPaymentMethod
                                            ? {
                                                ...editPaymentMethod,
                                                name: e.target.value,
                                              }
                                            : null
                                        )
                                      }
                                    />
                                  </div>
                                  <DialogFooter>
                                    <Button onClick={handleUpdatePaymentMethod}>
                                      Save Changes
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setPaymentMethodToDelete(method);
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
                  payment method from your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeletePaymentMethod}>
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
