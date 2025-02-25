"use client"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useRouter } from "next/navigation"
import { DataTable } from "./data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import _ from "lodash"

interface Category {
  id: number
  name: string
  meta_title: string
  meta_description: string
  meta_keywords: string
  image: string
}

export default function CategoryPage() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [isTogglingMap, setIsTogglingMap] = useState<Record<number, boolean>>({})


  const columns: ColumnDef<Category>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(!!e.target.checked)}
          aria-label="Select row"
        />
      ),
    },
    {
      accessorKey: "Image",
      header: "Image",
      cell: ({ row }) => (
        <img
          src={process.env.NEXT_PUBLIC_API_URL + "/" + row.original.Image || "/placeholder.svg"}
          alt={row.original.Name}
          className="w-16 h-16 object-cover"
        />
      ),
    },
    {
      accessorKey: "CategoryName",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "Status",
      header: "Status",
      cell: ({ row }) => {
        const categoryId = row.original.CategoryID
        const currentStatus = row.original.Status
        const isToggling = isTogglingMap[categoryId] || false

        return (
          <div
            className="w-[3.5rem] h-[1.3rem] border-[1px] border-gray-300 flex cursor-pointer"
            onClick={() => !isToggling && handleToggle(categoryId, currentStatus)}
          >
            <div className={`w-[50%] h-[100%] ${currentStatus === 1 ? "bg-green-600" : "bg-white"}`} />
            <div className={`w-[50%] h-[100%] ${currentStatus === 0 ? "bg-red-500" : "bg-white"}`} />
          </div>
        )
      },
    },
    {
      header: " ",
    },
  ]

  const { data, isLoading,refetch } = useQuery({
    queryKey: ["categories", page, pageSize, searchTerm],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/category/pagination?page=${page}&pageSize=${pageSize}&search=${searchTerm} `)
      return response.data
    },
    gcTime: 0
  })

  useEffect(() => {
    if (data?.categories?.length > 0 && !isLoading) {
      setCategories(data.categories)
      setTotalPages(data?.totalPages || 1)
    }
  }, [data, isLoading])
  const fetchReviews = useCallback(
    _.debounce(async (filters: any) => {
      try {
        if (filters.search === "") return
        const query = new URLSearchParams(filters).toString()
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/category/pagination?page=${page}&pageSize=${pageSize}&${query}`,

        )
        if (response.status === 200) {

          // setProducts(response.data.products)
          setTotalPages(response.data.totalPages);
          // setTotalProducts(response.data.totalProducts);
          // setCategories(data.categories);
          // setTotalPages(data.totalPages)
          setCategories(response.data.categories)
       
        }
      } catch (error) {
        console.error("Error fetching reviews:", error)
      }
    }, 500),
    [],
  )
  useEffect(() => {
    if (data?.categories?.length > 0 && !isLoading) {
      setCategories(data.categories);
      setTotalPages(data?.totalPages || 1); // Ensure it's not undefined
    }
  }, [data, isLoading]);
  useEffect(() => {
    fetchReviews({ search: searchTerm });
  }, [searchTerm, page, pageSize, fetchReviews]);

  const handleToggle = useCallback(
    async (id: number, currentStatus: number) => {
      setIsTogglingMap((prev) => ({ ...prev, [id]: true }))
      const newStatus = currentStatus !== 1 ? 1 : 0

      try {
        const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/category/update/status/${id}`, {
          Status: newStatus,
        })

        if (res.status === 200) {
          queryClient.invalidateQueries({ queryKey: ["categories"],exact:false })
        }
      } catch (error) {
        console.error("Error toggling status:", error)
      } finally {
        setIsTogglingMap((prev) => ({ ...prev, [id]: false }))
      }
    },
    [queryClient],
  )
  const handleDelete = async (ids: any[]) => {
    console.log(ids)
    try {
      axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/category/${ids.CategoryID}`)
      toast.success("Categories deleted successfully")
      refetch()
    } catch (error) {
      toast.error("Error deleting categories")
    }
  }

  const handleEdit = (id: any) => {
    router.push(`/dashboard/category/edit/${id.CategoryID}`)
  }

  const handleDeleteEach = async (id: any) => {
    console.log(id)
    try {
      const confirm = window.confirm("Are you sure you want to delete this category?")
      if (!confirm) {
        return
      }
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/category/${id.CategoryID}`)
      toast.success("Category deleted successfully")
      refetch()
    } catch (error) {
      toast.error("Error deleting category")
    }
  }

  return (
    <div className="container mx-auto py-0">
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <div className="flex mt-2 justify-start px-4 gap-2 w-[100%] items-center">
          <h1 className="text-4xl font-normal">Manage Categories</h1>
        </div>
        <Button onClick={() => router.push("/dashboard/category/new")}>Add New Category</Button>
      </div>

      <DataTable
        columns={columns}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setPage={setPage}
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        data={categories}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onDeleteEach={handleDeleteEach}
        edit={true}
        faq={false}
      />
    </div>
  )
}

