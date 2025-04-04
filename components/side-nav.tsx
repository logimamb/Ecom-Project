"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Package,
  Truck,
  ClipboardList,
  Box,
  ShoppingCart,
  Users,
  Calculator,
  BarChart3,
  Bell,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const routes = [
  {
    label: "Suppliers",
    icon: Package,
    href: "/suppliers",
  },
  {
    label: "Freight Forwarders",
    icon: Truck,
    href: "/forwarders",
  },
  {
    label: "Orders",
    icon: ClipboardList,
    href: "/orders",
  },
  {
    label: "Inventory",
    icon: Box,
    href: "/inventory",
  },
  {
    label: "Sales",
    icon: ShoppingCart,
    href: "/sales",
  },
  {
    label: "Customers",
    icon: Users,
    href: "/customers",
  },
  {
    label: "Costing",
    icon: Calculator,
    href: "/costing",
  },
  {
    label: "Reports",
    icon: BarChart3,
    href: "/reports",
  },
  {
    label: "Notifications",
    icon: Bell,
    href: "/notifications",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
]

export function SideNav() {
  const pathname = usePathname()

  return (
    <div className="border-r bg-card w-64 hidden md:block">
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="space-y-1">
              {routes.map((route) => (
                <Link key={route.href} href={route.href}>
                  <Button
                    variant={pathname === route.href ? "secondary" : "ghost"}
                    className={cn("w-full justify-start", {
                      "bg-muted": pathname === route.href,
                    })}
                  >
                    <route.icon className="mr-2 h-4 w-4" />
                    {route.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}