import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2 } from "lucide-react"
import { EditCategoryDialog } from "../attributes/edit-category-dialog"
import { useRouter } from "next/navigation"

// Types for our data
interface Category {
  CategoryID: number
  CategoryName: string
  subcategory: number
  subcategoryName: string
  attributes: {
    attributeName: string
    attribute_id: number
    values: { id: number; value: string }[]
  }[]
}

export default function CategoryTable({
  data,
  onDelete,
  onEdit,
  isLoading = false,
  setIsCancel,
}: {
  data: Category[]
  onDelete: (category: Category) => void
  onEdit: (category: Category) => void
  isLoading?: boolean
  setIsCancel: (cancel: boolean) => void
}) {
  const [searchTerm, setSearchTerm] = useState("") // State for search term
  const [currentPage, setCurrentPage] = useState(1) // Current page for pagination
  const [rowsPerPage, setRowsPerPage] = useState(5) // Rows per page
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [categoryData, setCategoryData] = useState<Category[]>(data)
  // Handle search filtering
  const filteredData = data?.filter((category) => {
    const matchesCategory = category.CategoryName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubCategory = category.subcategoryName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory || matchesSubCategory
  })

  const router = useRouter()
  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage
  const indexOfFirstRow = indexOfLastRow - rowsPerPage
  const currentRows = filteredData?.slice(indexOfFirstRow, indexOfLastRow)
  const totalPages = Math.ceil(filteredData?.length / rowsPerPage)

  useEffect(() => {
    // Reset to first page when data changes
    setCurrentPage(1)
  }, [data])

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setCategoryData(category)
    setDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-6">
      {/* Add New Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">List of Attributes</h2>
        <Button onClick={() =>router.push('/dashboard/demo/new')}>+ Add New Attribute</Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search..."
          className="max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select defaultValue="5">
          <SelectTrigger className="w-20">
            <SelectValue placeholder="5" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>SubCategory</TableHead>
              <TableHead>Attributes</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRows?.map((category) => (
              <TableRow key={category.CategoryID}>
                <TableCell>{category.CategoryName}</TableCell>
                <TableCell>{category.subcategoryName}</TableCell>
                <TableCell>
                  <div className="space-y-2">
                    {category.attributes?.map((attribute) => (
                      <div key={attribute.attribute_id} className="py-1 border-b flex flex-wrap items-center last:border-0 text-sm">
                        <span className="font-medium">{attribute.attributeName}:</span>
                        <div className="flex gap-2 mt-1">
                          {attribute.values?.map((value) => (
                            <Badge key={value.id} variant="secondary">
                              {value.value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {/* <Button variant="ghost" size="icon" onClick={() => onDelete(category)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button> */}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-200">
        <div className="text-sm text-muted-foreground">
          Showing {indexOfFirstRow + 1} to {Math.min(indexOfFirstRow + rowsPerPage, filteredData?.length)} of {filteredData?.length} entries
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Edit Category Dialog */}
      <EditCategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        data={categoryData}
        category={editingCategory}
      />
    </div>
  )
}
