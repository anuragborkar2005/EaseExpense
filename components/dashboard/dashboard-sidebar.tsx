"use client";

import React, { useState } from "react";
import {
  Home,
  PieChart,
  Clock,
  Tag,
  CreditCard,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const DashboardSidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Analytics",
      icon: PieChart,
      href: "/dashboard/analytics",
      active: pathname === "/dashboard/analytics",
    },
    {
      label: "History",
      icon: Clock,
      href: "/dashboard/history",
      active: pathname === "/dashboard/history",
    },
    {
      label: "Categories",
      icon: Tag,
      href: "/dashboard/categories",
      active: pathname === "/dashboard/categories",
    },
    {
      label: "Payment Methods",
      icon: CreditCard,
      href: "/dashboard/payment-methods",
      active: pathname === "/dashboard/payment-methods",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      active: pathname === "/dashboard/settings",
    },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-2 p-4">
      <div className="pt-10">
        <h2 className="px-4 text-lg font-semibold tracking-tighter">Menu</h2>
      </div>
      <div className="flex flex-1 flex-col gap-1">
        {routes.map((route) => (
          <Button
            key={route.href}
            variant={route.active ? "secondary" : "ghost"}
            className={cn("justify-start gap-2", route.active && "bg-muted")}
            asChild
            onClick={() => setIsMobileOpen(false)}
          >
            <Link href={route.href}>
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        className="fixed top-4 left-4 z-50 md:hidden"
        variant="outline"
        size="icon"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="h-4 w-4" />
        ) : (
          <Menu className="h-4 w-4" />
        )}
      </Button>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden">
          <div className="fixed inset-y-0 left-0 w-64 bg-background border-r">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/10 md:block">
        <SidebarContent />
      </div>
    </>
  );
};
