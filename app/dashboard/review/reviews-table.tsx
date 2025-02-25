"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Eye, ChevronUp, ChevronDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import _ from "lodash"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AnyDataTag, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import toast, { Toaster } from "react-hot-toast"

interface Review {
  id: string
  ProductName: string
  userName: string
  emailAddress: string
  rating: number
  review_date: string
  status: 0 | 1
  review_text: string
}

type SortKey = keyof Omit<Review, "status" | "content">
type SortOrder = "asc" | "desc"

export default function ReviewsTable() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [entriesPerPage, setEntriesPerPage] = useState("10")
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; order: SortOrder }>({ key: "ProductName", order: "asc" })
  const [selectedReviews, setSelectedReviews] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<any>(0)
  const [viewReview, setViewReview] = useState<Review | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ["review"],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/review`,
        {
          params: {
            page: page,
            limit: limit,
            tab: Number(activeTab)
          },
        }
      )
      return response.data
    },
  })

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["review"] })
  }, [queryClient])

  const fetchReviews = useCallback(
    _.debounce(async (filters: AnyDataTag) => {
      try {
        if (filters.search === "") return
        const query = new URLSearchParams(filters).toString()
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/review/search?page=${page}&limit=${limit}&tab=${activeTab}&${query}`,

        )
        if (response.status === 200) {
          setReviews(response.data.result)
        }
      } catch (error) {
        console.error("Error fetching reviews:", error)
      }
    }, 500),
    [activeTab, page, limit],
  )

  useEffect(() => {
    fetchReviews({ searchTerm })
  }, [searchTerm, fetchReviews, activeTab])

  useEffect(() => {
    if (data && !isLoading) {
      setReviews(data.result)
    }
  }, [data, isLoading, activeTab])

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => review.status === Number(activeTab))
  }, [reviews, activeTab])

  const sortedReviews = useMemo(() => {
    const sortableReviews = [...filteredReviews]
    sortableReviews.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.order === "asc" ? -1 : 1
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.order === "asc" ? 1 : -1
      }
      return 0
    })
    return sortableReviews
  }, [filteredReviews, sortConfig])

  const handleSort = (key: SortKey) => {
    setSortConfig((prevConfig) => ({
      key,
      order: prevConfig.key === key && prevConfig.order === "asc" ? "desc" : "asc",
    }))
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReviews(sortedReviews.map((review) => review.id))
    } else {
      setSelectedReviews([])
    }
  }

  const handleSelectReview = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedReviews((prev) => [...prev, id])
    } else {
      setSelectedReviews((prev) => prev.filter((reviewId) => reviewId !== id))
    }
  }

  const handleApprove = async () => {
    try {
      const res = await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/review/${selectedReviews}`, {
        status: 1,
      })
      if (res.status === 200) {
        setReviews((prev) =>
          prev.map((review) => (selectedReviews.includes(review.id) ? { ...review, status: 1 } : review)),
        )
        queryClient.invalidateQueries({ queryKey: ["review"] })
        toast.success("Review Approved Successfully")
      }
      setSelectedReviews([])
    } catch (error) {
      toast.error("Error approving reviews")
    }
  }

  const handleDelete = async () => {
    try {
      const confirmDelete = window.confirm('Are you sure, you want to delete this review?')
      if (!confirmDelete) return;
      const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/review/${selectedReviews}`)
      if (res.status === 200) {
        setReviews((prev) => prev.filter((review) => !selectedReviews.includes(review.id)))
        queryClient.invalidateQueries({ queryKey: ["review"] })
        toast.success("Review Deleted Successfully")
      }
      setSelectedReviews([])
    } catch (error) {
      toast.error("Error deleting reviews")
    }
  }

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex">
        <Toaster />
        {[...Array(5)].map((_, index) => (
          <svg
            key={index}
            className={`w-4 h-4 ${index < rating ? "text-yellow-400" : "text-gray-300"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortConfig.key === column) {
      return sortConfig.order === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
    }
    return null
  }

  return (
    <>
      <div className="flex mt-0 justify-start px-4 gap-2 pb-5 w-[100%] items-center">
        <h1 className="text-4xl font-normal">Manage Received Review</h1>
      </div>
      <Card className="w-full">
        <CardContent>
          <Tabs value={activeTab.toString()} onValueChange={(value) => setActiveTab(value as 0 | 1)} className="w-full">
            {/* 
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value={'0'}>Received</TabsTrigger>
              <TabsTrigger value={'1'}>Approved</TabsTrigger>
            </TabsList> */}
            <div className="w-[100%] grid grid-col-2 gap-2 my-2 ">
              <div className="flex flex-col items-center sm:flex-row gap-4">
                <div
                  className={`w-[100%] cursor-pointer text-black py-2 justify-center flex bg-white ${activeTab === 0 && 'bg-slate-100 shadow duration-300'}`}

                  onClick={() => setActiveTab(0)}
                >
                  Received
                </div>
                <div
                  className={`w-[100%] cursor-pointer items-center py-2 justify-center flex text-black bg-white ${activeTab === 1 && 'bg-slate-100 shadow duration-300'}`}

                  onClick={() => setActiveTab(1)}
                >
                  Approved
                </div>
              </div></div>


            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <Select value={limit} onValueChange={setLimit}>
                  <SelectTrigger className="w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={10}>10</SelectItem>
                    <SelectItem value={25}>25</SelectItem>
                    <SelectItem value={50}>50</SelectItem>
                  </SelectContent>
                </Select>
                <span>entries</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Search className="w-4 h-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </div>
            <TabsContent value={'0'} className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <input
                          type="checkbox"
                          checked={selectedReviews.length === sortedReviews.length && sortedReviews.length > 0}
                          onChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("ProductName")}>
                        Product Name <SortIcon column="ProductName" />
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("userName")}>
                        User Name <SortIcon column="userName" />
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("emailAddress")}>
                        Email Address <SortIcon column="emailAddress" />
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("rating")}>
                        Rating <SortIcon column="rating" />
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("review_date")}>
                        Review Date <SortIcon column="reviewDate" />
                      </TableHead>
                      <TableHead>View</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedReviews.includes(review.id)}
                            onChange={(e) => handleSelectReview(review.id, e.target.checked)}
                          />

                        </TableCell>
                        <TableCell className="font-medium">
                          <a href="#" className="text-blue-600 hover:underline">
                            {review.ProductName}
                          </a>
                        </TableCell>
                        <TableCell>{review.userName}</TableCell>
                        <TableCell>{review.emailAddress}</TableCell>
                        <TableCell>
                          <StarRating rating={review.rating} />
                        </TableCell>
                        <TableCell>{review.review_date}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setViewReview(review)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Review Details</DialogTitle>
                                <DialogDescription>Full details of the selected review</DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <span className="font-bold">Product:</span>
                                  <span className="col-span-3">{viewReview?.ProductName}</span>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <span className="font-bold">User:</span>
                                  <span className="col-span-3">{viewReview?.userName}</span>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <span className="font-bold">Email:</span>
                                  <span className="col-span-3">{viewReview?.emailAddress}</span>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <span className="font-bold">Rating:</span>
                                  <span className="col-span-3">
                                    <StarRating rating={viewReview?.rating || 0} />
                                  </span>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <span className="font-bold">Date:</span>
                                  <span className="col-span-3">
                                    {new Date(viewReview?.review_date).toLocaleDateString("en-US", {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <span className="font-bold">Review:</span>
                                  <span className="col-span-3">{viewReview?.review_text}</span>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-500">
                  Showing {Math.min(Number.parseInt(entriesPerPage), sortedReviews.length)} of {sortedReviews.length}{" "}
                  entries
                </p>
                <div className="flex items-center gap-2">
  {/* Previous Button */}
  <Button
    variant="outline"
    size="sm"
    disabled={page <= 1}
    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
  >
    Previous
  </Button>

  {/* Dynamic Page Buttons */}
  {Array.from({ length: Math.ceil(data?.total / limit) || 1 }, (_, i) => i + 1).map((pageNum) => (
    <Button
      key={pageNum}
      variant="outline"
      size="sm"
      className={`${
        page === pageNum ? "bg-blue-500 text-white" : "bg-white text-blue-500 border border-blue-500"
      }`}
      onClick={() => setPage(pageNum)}
    >
      {pageNum}
    </Button>
  ))}

  {/* Next Button */}
  <Button
    variant="outline"
    size="sm"
    disabled={page >= Math.ceil(data?.total / limit)}
    onClick={() => setPage((prev) => prev + 1)}
  >
    Next
  </Button>
</div>

              </div>

              <div className="flex justify-end gap-2 mt-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={selectedReviews.length === 0}
                    >
                      Approve
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Approve Reviews</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to approve {selectedReviews.length} review(s)? This action cannot be
                        undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleApprove}>Approve</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button onClick={handleDelete} variant="destructive" disabled={selectedReviews.length === 0}>
                  Delete
                </Button>
                {/* <AlertDialog>
                  <AlertDialogTrigger asChild>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Reviews</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedReviews.length} review(s)? This action cannot be
                        undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog> */}
              </div>
            </TabsContent>
            <TabsContent value={'1'} className="space-y-4">
              {sortedReviews.length > 0 ? (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">
                            <input
                              type="checkbox"
                              checked={selectedReviews.length === sortedReviews.length && sortedReviews.length > 0}
                              onChange={(e) => handleSelectAll(e.target.checked)}
                            />

                          </TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSort("ProductName")}>
                            Product Name <SortIcon column="productName" />
                          </TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSort("userName")}>
                            User Name <SortIcon column="userName" />
                          </TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSort("emailAddress")}>
                            Email Address <SortIcon column="emailAddress" />
                          </TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSort("rating")}>
                            Rating <SortIcon column="rating" />
                          </TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSort("reviewDate")}>
                            Review Date <SortIcon column="reviewDate" />
                          </TableHead>
                          <TableHead>View</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedReviews.map((review) => (
                          <TableRow key={review.id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedReviews.includes(review.id)}
                                onChange={(e) => handleSelectReview(review.id, e.target.checked)}
                              />

                            </TableCell>
                            <TableCell className="font-medium">
                              <a href="#" className="text-blue-600 hover:underline">
                                {review.ProductName}
                              </a>
                            </TableCell>
                            <TableCell>{review.userName}</TableCell>
                            <TableCell>{review.emailAddress}</TableCell>
                            <TableCell>
                              <StarRating rating={review.rating} />
                            </TableCell>
                            <TableCell>{review.review_date}</TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={() => setViewReview(review)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                  <DialogHeader>
                                    <DialogTitle>Review Details</DialogTitle>
                                    <DialogDescription>Full details of the selected review</DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <span className="font-bold">Product:</span>
                                      <span className="col-span-3">{viewReview?.productName}</span>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <span className="font-bold">User:</span>
                                      <span className="col-span-3">{viewReview?.userName}</span>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <span className="font-bold">Email:</span>
                                      <span className="col-span-3">{viewReview?.emailAddress}</span>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <span className="font-bold">Rating:</span>
                                      <span className="col-span-3">
                                        <StarRating rating={viewReview?.rating || 0} />
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <span className="font-bold">Date:</span>
                                      <span className="col-span-3">{viewReview?.review_date}</span>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <span className="font-bold">Review:</span>
                                      <span className="col-span-3">{viewReview?.review_text}</span>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-500">
                  Showing {Math.min(Number.parseInt(entriesPerPage), sortedReviews.length)} of {sortedReviews.length}{" "}
                  entries
                </p>
                <div className="flex items-center gap-2">
  {/* Previous Button */}
  <Button
    variant="outline"
    size="sm"
    disabled={page <= 1}
    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
  >
    Previous
  </Button>

  {/* Dynamic Page Buttons */}
  {Array.from({ length: Math.ceil(data?.total / limit) || 1 }, (_, i) => i + 1).map((pageNum) => (
    <Button
      key={pageNum}
      variant="outline"
      size="sm"
      className={`${
        page === pageNum ? "bg-blue-500 text-white" : "bg-white text-blue-500 border border-blue-500"
      }`}
      
      onClick={() => setPage(pageNum)}
    >
      {pageNum}
    </Button>
  ))}

  {/* Next Button */}
  <Button
    variant="outline"
    size="sm"
    disabled={page >= Math.ceil(data?.total / limit)}
    onClick={() => setPage((prev) => prev + 1)}
  >
    Next
  </Button>
</div>

              </div>
                  <div className="flex items-end justify-end py-3">
                    <Button variant="destructive" onClick={handleDelete} disabled={selectedReviews.length === 0}>
                      Delete
                    </Button>
                    {/* <AlertDialog>
                      <AlertDialogTrigger asChild>
                      </AlertDialogTrigger> */}
                    {/* <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Reviews</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {selectedReviews.length} review(s)? This action cannot be
                            undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent> */}
                    {/* </AlertDialog> */}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">No approved reviews to display</div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  )
}

