"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, Eye, Calendar, DollarSign, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import OrderModal from "@/components/order-modal"
import { orderService, Order, OrdersResponse } from "@/services/api"

interface OrdersPageProps {
  productFilter?: string | null
}

export default function OrdersPage({ productFilter }: OrdersPageProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date_desc")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
    hasNextPage: false,
    hasPrevPage: false
  })

  // Fetch orders from API
  const fetchOrders = async (page: number = 1, searchQuery?: string, status?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      let response: OrdersResponse
      if (searchQuery) {
        response = await orderService.searchOrders(searchQuery, page, 20, status)
      } else {
        response = await orderService.getOrders(page, 20, undefined, status, productFilter || undefined)
      }
      
      setOrders(response.orders)
      setPagination(response.pagination)
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError('Failed to load orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchOrders(1, undefined, statusFilter !== 'all' ? statusFilter : undefined)
  }, [productFilter])

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        fetchOrders(1, searchTerm, statusFilter !== 'all' ? statusFilter : undefined)
      } else {
        fetchOrders(1, undefined, statusFilter !== 'all' ? statusFilter : undefined)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, statusFilter])

  const filteredAndSortedOrders = useMemo(() => {
    // If we have a search term or status filter, the API should handle filtering
    // So we only need to sort the results
    const sorted = [...orders].sort((a, b) => {
      switch (sortBy) {
        case "date_desc":
          return new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
        case "date_asc":
          return new Date(a.date_created).getTime() - new Date(b.date_created).getTime()
        case "total_desc":
          return Number.parseFloat(b.total) - Number.parseFloat(a.total)
        case "total_asc":
          return Number.parseFloat(a.total) - Number.parseFloat(b.total)
        default:
          return 0
      }
    })

    return sorted
  }, [orders, sortBy])

  const handlePageChange = (newPage: number) => {
    if (searchTerm) {
      fetchOrders(newPage, searchTerm, statusFilter !== 'all' ? statusFilter : undefined)
    } else {
      fetchOrders(newPage, undefined, statusFilter !== 'all' ? statusFilter : undefined)
    }
  }

  const handleClearProductFilter = () => {
    router.push("/orders")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading && orders.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-primary">Orders</h1>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-600">Loading orders...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-primary">Orders</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <Button onClick={() => fetchOrders(1, undefined, statusFilter !== 'all' ? statusFilter : undefined)}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Orders</h1>
        {productFilter && (
          <Button
            variant="outline"
            onClick={handleClearProductFilter}
            className="border-primary text-primary hover:bg-primary hover:text-white"
          >
            Clear Product Filter
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 focus:outline-none focus:ring-0 focus:border-primary"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Date (Newest)
                  </div>
                </SelectItem>
                <SelectItem value="date_asc">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Date (Oldest)
                  </div>
                </SelectItem>
                <SelectItem value="total_desc">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Total (High to Low)
                  </div>
                </SelectItem>
                <SelectItem value="total_asc">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Total (Low to High)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-600 flex items-center">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {pagination.totalItems} orders found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="grid gap-4">
        {filteredAndSortedOrders.map((order) => (
          <Card key={order._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <div className="font-semibold text-primary">#{order.number}</div>
                    <div className="text-sm text-gray-600">ID: {order.wooCommerceId}</div>
                  </div>

                  <div>
                    <div className="font-medium">
                      {order.billing.first_name} {order.billing.last_name}
                    </div>
                    <div className="text-sm text-gray-600">{order.billing.email}</div>
                  </div>

                  <div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <div className="text-sm text-gray-600 mt-1">
                      {new Date(order.date_created).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-lg text-primary">${order.total}</div>
                    <div className="text-sm text-gray-600">
                      {order.line_items.length} item{order.line_items.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrder(order)}
                  className="ml-4 border-primary text-primary hover:bg-primary hover:text-white"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredAndSortedOrders.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-500">No orders found matching your criteria.</div>
          </CardContent>
        </Card>
      )}

      {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  )
}
