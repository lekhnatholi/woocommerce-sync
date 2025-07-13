"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import ProductsPage from "@/components/products-page"

export default function ProductsRoute() {
  const router = useRouter()

  const handleProductOrdersClick = (productId: string) => {
    // Navigate to orders page with product filter
    router.push(`/orders?product=${productId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab="products" />
      <main className="container mx-auto px-4 py-8">
        <ProductsPage onProductOrdersClick={handleProductOrdersClick} />
      </main>
    </div>
  )
} 