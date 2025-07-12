"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import OrdersPage from "@/components/orders-page"
import ProductsPage from "@/components/products-page"

export default function Component() {
  const [activeTab, setActiveTab] = useState("orders")
  const [productFilter, setProductFilter] = useState<string | null>(null)

  const handleProductOrdersClick = (productId: string) => {
    setProductFilter(productId)
    setActiveTab("orders")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="container mx-auto px-4 py-8">
        {activeTab === "orders" ? (
          <OrdersPage productFilter={productFilter} />
        ) : (
          <ProductsPage onProductOrdersClick={handleProductOrdersClick} />
        )}
      </main>
    </div>
  )
}
