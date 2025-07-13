"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Navbar from "@/components/navbar"
import OrdersPage from "@/components/orders-page"

export default function OrdersRoute() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [productFilter, setProductFilter] = useState<string | null>(null)

  useEffect(() => {
    // Get product filter from URL parameters
    const productParam = searchParams.get('product')
    setProductFilter(productParam)
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab="orders" />
      <main className="container mx-auto px-4 py-8">
        <OrdersPage productFilter={productFilter} />
      </main>
    </div>
  )
} 