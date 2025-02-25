"use client"

import { useState, useEffect } from "react"
import { Eye } from "lucide-react"
import Link from "next/link"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Order {
  OrderDate: string
  OrderNumber: string
  ItemTotal: string
  BillingFirstname: string
  UserEmail: string
}

export default function OrderDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [status, setStatus] = useState(0)
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [ordersPerPage, setOrdersPerPage] = useState(10)

  // Fetch orders from API
  useEffect(() => {
    const getOrders = async () => {
      try {
        const res = await axios.get(`http://localhost:9000/order/${status}`)
        setOrders(res.data.result)
        setFilteredOrders(res.data.result) // ✅ Store separate copy for filtering
      } catch (error) {
        console.log(error)
        setOrders([])
        setFilteredOrders([])
      }
    }
    getOrders()
  }, [status])

  // Search filter
  useEffect(() => {
    const results = orders.filter((order) =>
      Object.values(order).some((value) =>
        typeof value === "string" && value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    setFilteredOrders(results) // ✅ Only update filtered results
    setCurrentPage(1)
  }, [searchTerm, orders])

  // Pagination calculations
  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="placed" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger onClick={()=>setStatus(0)} value="placed">Orders Placed</TabsTrigger>
          <TabsTrigger onClick={()=>setStatus(1)}  value="received">Product Received</TabsTrigger>
          <TabsTrigger onClick={()=>setStatus(2)} value="accepted">Accepted Orders</TabsTrigger>
          <TabsTrigger onClick={()=>setStatus(4)} value="rejected">Rejected Orders</TabsTrigger>
        </TabsList>

        {/* Orders Placed Tab */}
        <TabsContent value="placed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Orders Placed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span>Show</span>
                  <Select
                    value={ordersPerPage.toString()}
                    onValueChange={(value) => {
                      setOrdersPerPage(Number(value))
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>entries</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Search:</span>
                  <Input
                    type="search"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Order No.</TableHead>
                      <TableHead>Order Amount ($)</TableHead>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Customer Email</TableHead>
                      <TableHead>View</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentOrders.length > 0 ? (
                      currentOrders.map((order) => (
                        <TableRow key={order.OrderNumber}>
                          <TableCell>{new Date(order.OrderDate).toLocaleDateString()}</TableCell>
                          <TableCell>{order.OrderNumber}</TableCell>
                          <TableCell>{order.ItemTotal}</TableCell>
                          <TableCell>{order.BillingFirstname}</TableCell>
                          <TableCell>{order.UserEmail}</TableCell>
                          <TableCell>
                            <Link href={`order/${order.OrderNumber}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No orders found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of{" "}
                  {filteredOrders.length} entries
                </div>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                    Previous
                  </Button>
                  {Array.from({ length: Math.ceil(filteredOrders.length / ordersPerPage) }).map((_, index) => (
                    <Button
                      key={index}
                      variant={currentPage === index + 1 ? "default" : "outline"}
                      onClick={() => paginate(index + 1)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === Math.ceil(filteredOrders.length / ordersPerPage)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs */}
        <TabsContent value="received">
          <Card>
            <CardHeader><CardTitle>Product Received</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span>Show</span>
                  <Select
                    value={ordersPerPage.toString()}
                    onValueChange={(value) => {
                      setOrdersPerPage(Number(value))
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>entries</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Search:</span>
                  <Input
                    type="search"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Order No.</TableHead>
                      <TableHead>Order Amount (£)</TableHead>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Customer Email</TableHead>
                      <TableHead>View</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentOrders.length > 0 ? (
                      currentOrders.map((order) => (
                        <TableRow key={order.OrderNumber}>
                          <TableCell>{new Date(order.OrderDate).toLocaleDateString()}</TableCell>
                          <TableCell>{order.OrderNumber}</TableCell>
                          <TableCell>{order.ItemTotal}</TableCell>
                          <TableCell>{order.BillingFirstname}</TableCell>
                          <TableCell>{order.UserEmail}</TableCell>
                          <TableCell>
                            <Link href={`order/${order.OrderNumber}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No orders found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of{" "}
                  {filteredOrders.length} entries
                </div>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                    Previous
                  </Button>
                  {Array.from({ length: Math.ceil(filteredOrders.length / ordersPerPage) }).map((_, index) => (
                    <Button
                      key={index}
                      variant={currentPage === index + 1 ? "default" : "outline"}
                      onClick={() => paginate(index + 1)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === Math.ceil(filteredOrders.length / ordersPerPage)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accepted">
          <Card>
            <CardHeader><CardTitle>Accepted Orders</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span>Show</span>
                  <Select
                    value={ordersPerPage.toString()}
                    onValueChange={(value) => {
                      setOrdersPerPage(Number(value))
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>entries</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Search:</span>
                  <Input
                    type="search"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Order No.</TableHead>
                      <TableHead>Order Amount (£)</TableHead>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Customer Email</TableHead>
                      <TableHead>View</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentOrders.length > 0 ? (
                      currentOrders.map((order) => (
                        <TableRow key={order.OrderNumber}>
                          <TableCell>{new Date(order.OrderDate).toLocaleDateString()}</TableCell>
                          <TableCell>{order.OrderNumber}</TableCell>
                          <TableCell>{order.ItemTotal}</TableCell>
                          <TableCell>{order.BillingFirstname}</TableCell>
                          <TableCell>{order.UserEmail}</TableCell>
                          <TableCell>
                            <Link href={`order/${order.OrderNumber}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No orders found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of{" "}
                  {filteredOrders.length} entries
                </div>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                    Previous
                  </Button>
                  {Array.from({ length: Math.ceil(filteredOrders.length / ordersPerPage) }).map((_, index) => (
                    <Button
                      key={index}
                      variant={currentPage === index + 1 ? "default" : "outline"}
                      onClick={() => paginate(index + 1)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === Math.ceil(filteredOrders.length / ordersPerPage)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardHeader><CardTitle>Rejected Orders</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span>Show</span>
                  <Select
                    value={ordersPerPage.toString()}
                    onValueChange={(value) => {
                      setOrdersPerPage(Number(value))
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>entries</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Search:</span>
                  <Input
                    type="search"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Order No.</TableHead>
                      <TableHead>Order Amount (£)</TableHead>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Customer Email</TableHead>
                      <TableHead>View</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentOrders.length > 0 ? (
                      currentOrders.map((order) => (
                        <TableRow key={order.OrderNumber}>
                          <TableCell>{new Date(order.OrderDate).toLocaleDateString()}</TableCell>
                          <TableCell>{order.OrderNumber}</TableCell>
                          <TableCell>{order.ItemTotal}</TableCell>
                          <TableCell>{order.BillingFirstname}</TableCell>
                          <TableCell>{order.UserEmail}</TableCell>
                          <TableCell>
                            <Link href={`order/${order.OrderNumber}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No orders found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of{" "}
                  {filteredOrders.length} entries
                </div>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                    Previous
                  </Button>
                  {Array.from({ length: Math.ceil(filteredOrders.length / ordersPerPage) }).map((_, index) => (
                    <Button
                      key={index}
                      variant={currentPage === index + 1 ? "default" : "outline"}
                      onClick={() => paginate(index + 1)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === Math.ceil(filteredOrders.length / ordersPerPage)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
