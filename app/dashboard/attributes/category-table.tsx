import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2 } from "lucide-react"
import { EditCategoryDialog } from "./edit-category-dialog"
import { useRouter } from "next/navigation"
import { AiOutlineDelete } from "react-icons/ai";
import toast from "react-hot-toast"
import axios from "axios"
import { useQueryClient } from "@tanstack/react-query"
// Updated Type Definition
interface Attribute {
  attribute_id: number
  attributeName: string
  values: { id: number; value: string }[]
}

export default function CategoryTable({
  data,
  onEdit,
  isLoading = false,
  isError
}: {
  data: Attribute[]
  onEdit: (attribute: Attribute) => void
  isLoading?: boolean
  isError: boolean
}) {
  const [searchTerm, setSearchTerm] = useState("") // Search state
  const [currentPage, setCurrentPage] = useState(1) // Pagination state
  const [rowsPerPage, setRowsPerPage] = useState(5) // Rows per page
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()

  // Filtered Data
  const filteredData = data?.filter((attribute) =>
    attribute.attributeName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage
  const indexOfFirstRow = indexOfLastRow - rowsPerPage
  const currentRows = filteredData?.slice(indexOfFirstRow, indexOfLastRow) || []
  const totalPages = Math.ceil((filteredData?.length || 0) / rowsPerPage)
  const queryClient = useQueryClient();

  // Reset page when data changes
  useEffect(() => {
    setCurrentPage(1)
  }, [data])

  const handleEdit = (attribute: Attribute) => {
    setEditingAttribute(attribute)
    setDialogOpen(true)
  }
  const removeAttribute = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this attribute?");
    if (!confirmDelete) return;
    console.log(id)
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/attribute/${id}`);
   
      queryClient.invalidateQueries({ queryKey: ["attribute"] });
    } catch (error) {
      console.error("Delete attribute error:", error);
      toast.error("Failed to delete attribute. Please try again.");
    }
  };

  console.log(editingAttribute)

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">List of Attributes</h2>
        <Button onClick={() => router.push('/dashboard/attributes/new')}>+ Add New Attribute</Button>
      </div>

      {/* Search and Rows Per Page */}
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search attributes..."
          className="max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={rowsPerPage.toString()} onValueChange={(value) => setRowsPerPage(Number(value))}>
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
              <TableHead>Attribute Name</TableHead>
              <TableHead>Values</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRows.length > 0 ? (
              currentRows.map((attribute) => (
                <TableRow key={attribute.attribute_id}>
                  <TableCell>
                    <span className="font-medium">{attribute.attributeName}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 mt-1">
                      {attribute.values.map((value) => (
                        <Badge key={value.id} variant="secondary">
                          {value.value}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(attribute)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => removeAttribute(attribute.attribute_id)}>
                        <AiOutlineDelete  className="h-4 w-4 text-red-500" />
                        
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-gray-500 py-4">
                  No attributes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-200">
          <div className="text-sm text-muted-foreground">
            Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredData.length)} of {filteredData.length} entries
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
      )}

      {/* Edit Attribute Dialog */}
      <EditCategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        data={editingAttribute}
      />
    </div>
  )
}
