"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Package, ShoppingCart } from "lucide-react"

interface NavbarProps {
  activeTab?: string
}

export default function Navbar({ activeTab }: NavbarProps) {
  const pathname = usePathname()
  
  // Determine active tab based on current pathname
  const currentTab = activeTab || (pathname === "/orders" ? "orders" : "products")

  return (
    <nav className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-secondary" />
            <span className="text-xl font-bold">WooCommerce Sync</span>
          </div>

          <div className="flex space-x-1">
            <Link
              href="/orders"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentTab === "orders" ? "bg-secondary text-primary font-semibold" : "hover:bg-primary-dark"
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Orders</span>
            </Link>

            <Link
              href="/products"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentTab === "products" ? "bg-secondary text-primary font-semibold" : "hover:bg-primary-dark"
              }`}
            >
              <Package className="h-5 w-5" />
              <span>Products</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
