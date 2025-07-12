"use client"

import { User, MapPin, Package, CreditCard } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Order } from "@/services/api"

interface OrderModalProps {
  order: Order
  onClose: () => void
}

export default function OrderModal({ order, onClose }: OrderModalProps) {
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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:p-3 [&>button]:hover:bg-gray-100 [&>button]:rounded-full [&>button]:transition-colors">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between mt-8">
            <span className="text-primary">Order #{order.number}</span>
            <Badge className={getStatusColor(order.status)}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-600">Order ID</div>
              <div className="font-semibold">{order.wooCommerceId}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Date Created</div>
              <div className="font-semibold">{new Date(order.date_created).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total</div>
              <div className="font-bold text-lg text-primary">${order.total}</div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Billing Information</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="font-medium">
                  {order.billing.first_name} {order.billing.last_name}
                </div>
                <div>{order.billing.email}</div>
                <div>{order.billing.phone}</div>
                <div className="text-gray-600">
                  {order.billing.address_1}
                  <br />
                  {order.billing.city}, {order.billing.state} {order.billing.postcode}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Shipping Information</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="font-medium">
                  {order.shipping.first_name} {order.shipping.last_name}
                </div>
                <div className="text-gray-600">
                  {order.shipping.address_1}
                  <br />
                  {order.shipping.city}, {order.shipping.state} {order.shipping.postcode}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Order Items</h3>
            </div>

            <div className="space-y-3">
              {order.line_items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">Product ID: {item.product_id}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Quantity</div>
                    <div className="font-semibold">{item.quantity}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Price</div>
                    <div className="font-semibold">${item.price}</div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm text-gray-600">Total</div>
                    <div className="font-bold text-primary">
                      ${(Number.parseFloat(item.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Note */}
          {order.customer_note && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-lg flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span>Customer Note</span>
                </h3>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm">{order.customer_note}</p>
                </div>
              </div>
            </>
          )}

          {/* Order Key */}
          <div className="text-xs text-gray-500 border-t pt-4">Order Key: {order.order_key}</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
