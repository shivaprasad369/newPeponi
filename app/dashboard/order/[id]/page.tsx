"use client"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"

export default function OrderDetails() {
  const params = useParams()
  const orderId = params?.id as string
  const [orderData, setOrderData] = useState<any>(null)
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null) // State for selected status
  const [comments, setComments] = useState("") // State for comments
  const [statusUpdated, setStatusUpdated] = useState(false) // Track if the status has been updated

  const { data, isLoading } = useQuery({
    queryKey: ['ordersssss', orderId],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/home/dashboard/products/${orderId}`)
      return await response.json()
    },
    enabled: !!orderId,
  })

  useEffect(() => {
    if (data && data.result.length > 0) {
      setOrderData({ ...data.result[0] })
      setSelectedStatus(data.result[0].OrderStatus) // Set the initial order status
    }
  }, [data])

  if (isLoading || !orderData) {
    return <div>Loading...</div>
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(parseInt(e.target.value)) // Update selected status
  }

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComments(e.target.value) // Update comments
  }

  const handleSubmit = async () => {
    // Here, you would submit the updated order status to the server
    console.log("Updated Status:", selectedStatus, "Comments:", comments)
    setStatusUpdated(true) // Mark the status as updated
  }

  // Dynamically generate dropdown options based on current status
  const getStatusOptions = (id) => {
    if (id === 0) {
      return (
        <>
          <option value={0}>Order Placed</option>
          <option value={1}>Accept Order</option>
        </>
      )
    } else if (id === 1) {
      return (
        <>
          <option value={1}>Order Accepted</option>
          <option value={3}>Deliver Order</option>
        </>
      )
    } else if (id === 3) {
      return (
        <>
          <option value={3}>Order Delivered</option>
          <option value={4}>Return Order</option>
        </>
      )
    } else if (id === 4) {
      return (
        <option value={4}>Return Order</option>
      )
    }
    return <option value="">Select Status</option>
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/order">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Order Details</h1>
        </div>
        <Link href="/dashboard/order">
          <Button variant="default">ORDERS LIST</Button>
        </Link>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {orderId} (Order Placed)
              <span className="float-right text-sm">{new Date(orderData.OrderDate).toLocaleDateString()}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Customer Details</h3>
                <p>{orderData.BillingFirstname} {orderData.BillingLastname}</p>
                <p>Email ID: {orderData.BillingEmailID}</p>
                <p>Phone: {orderData.BillingPhone}</p>
                <p>Address: {orderData.BillingAddress}, {orderData.BillingCity}, {orderData.BillingPostalcode}, {orderData.BillingCountry}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Order Details</h3>
                <p>Order Total: ₹{orderData.GrandTotal}</p>
                <p>Order Number: {orderData.OrderNumber}</p>
                <p>Order Date: {new Date(orderData.OrderDate).toLocaleDateString()}</p>
                <p>Payment: Stripe({orderData.stripeid})</p>
                <p>Shipping Price: ₹{orderData.ShippingPrice}</p>
                <p>Grand Total: ₹{orderData.GrandTotal}</p>
              </div>
            </div>

            <div className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price (₹)</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Item Total (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderData.Products.map((product: any) => (
                    <TableRow key={product.ProductID}>
                      <TableCell className="flex items-center gap-2">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}/`+product.ProductImages || "/placeholder.svg"}
                          alt={product.ProductName}
                          width={40}
                          height={40}
                          className="rounded-md"
                        />
                        <span>{product.ProductName}</span>
                      </TableCell>
                      <TableCell>{product.Price}</TableCell>
                      <TableCell>{product.Quantities}</TableCell>
                      <TableCell className="text-right">{product.ItemTotal}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-semibold">
                      Total:
                    </TableCell>
                    <TableCell className="text-right font-semibold">₹{orderData.GrandTotal}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
    {/* Order Tracking History Section */}
    <div className="mt-6">
              <h3 className="font-semibold mb-2">Order Tracking History</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>Date & Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Example tracking history, replace this with real tracking data */}
                  {orderData?.TrackingHistory?.map((tracking: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{tracking.Status}</TableCell>
                      <TableCell>{tracking.Remarks}</TableCell>
                      <TableCell>{new Date(tracking.Date).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-6">
              <h3 className="font-semibold mb-4">Manage Order Status</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Order Status *</label>
                  <select
                    value={selectedStatus ?? ''}
                    onChange={handleStatusChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    {getStatusOptions(orderData.OrderStatus)}
                  </select>
                </div>
                <div>
                  <label className="block mb-2">Order Comments</label>
                  <Textarea 
                    placeholder="Enter comments..." 
                    className="h-24"
                    value={comments}
                    onChange={handleCommentChange}
                  />
                </div>
              </div>
              <Button className="mt-4" onClick={handleSubmit}>Update Order Status</Button>
            </div>

        
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
