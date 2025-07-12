"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Package, ShoppingCart, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { productService, Product, ProductsResponse } from "@/services/api"

interface ProductsPageProps {
  onProductOrdersClick: (productId: string) => void
}

export default function ProductsPage({ onProductOrdersClick }: ProductsPageProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name_asc")
  const [products, setProducts] = useState<Product[]>([])
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

  // Fetch products from API
  const fetchProducts = async (page: number = 1, searchQuery?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      let response: ProductsResponse
      if (searchQuery) {
        response = await productService.searchProducts(searchQuery, page)
      } else {
        response = await productService.getProducts(page)
      }
      
      setProducts(response.products)
      setPagination(response.pagination)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('Failed to load products. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchProducts()
  }, [])

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        fetchProducts(1, searchTerm)
      } else {
        fetchProducts(1)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const filteredAndSortedProducts = useMemo(() => {
    // If we have a search term, the API should handle filtering
    // So we only need to sort the results
    const sorted = [...products].sort((a, b) => {
      switch (sortBy) {
        case "name_asc":
          return a.name.localeCompare(b.name)
        case "name_desc":
          return b.name.localeCompare(a.name)
        case "price_asc":
          return Number.parseFloat(a.price) - Number.parseFloat(b.price)
        case "price_desc":
          return Number.parseFloat(b.price) - Number.parseFloat(a.price)
        default:
          return 0
      }
    })

    return sorted
  }, [products, sortBy])

  const handlePageChange = (newPage: number) => {
    if (searchTerm) {
      fetchProducts(newPage, searchTerm)
    } else {
      fetchProducts(newPage)
    }
  }

  if (loading && products.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-primary">Products</h1>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-600">Loading products...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-primary">Products</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <Button onClick={() => fetchProducts()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Products</h1>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 focus:outline-none focus:ring-0 focus:border-primary"
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                <SelectItem value="price_asc">Price (Low to High)</SelectItem>
                <SelectItem value="price_desc">Price (High to Low)</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-600 flex items-center">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {pagination.totalItems} products found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAndSortedProducts.map((product) => (
          <Card key={product._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-4">
              <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={product.images?.[0]?.src || "/placeholder.svg"}
                  alt={product.images?.[0]?.alt || product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
                {product.on_sale && (
                  <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                    Sale
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-primary line-clamp-2">{product.name}</h3>

                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    SKU: {product.sku}
                  </Badge>
                  <div className="text-right">
                    {product.on_sale ? (
                      <div>
                        <div className="font-bold text-lg text-primary">${product.price}</div>
                        <div className="text-sm text-gray-500 line-through">${product.regular_price}</div>
                      </div>
                    ) : (
                      <div className="font-bold text-lg text-primary">${product.price}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="h-4 w-4 mr-1" />
                    ID: {product.wooCommerceId}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onProductOrdersClick(product._id)}
                    className="border-secondary text-secondary hover:bg-secondary hover:text-primary"
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    {product.total_sales} Orders
                  </Button>
                </div>

                {product.categories && product.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {product.categories.map((category) => (
                      <Badge key={category._id} variant="secondary" className="text-xs">
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                )}
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

      {filteredAndSortedProducts.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-500">No products found matching your criteria.</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
