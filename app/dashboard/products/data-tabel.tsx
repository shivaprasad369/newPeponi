"use client"

import { useState } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { IoEyeOutline } from "react-icons/io5"
import { FaRegEdit } from "react-icons/fa"
import { MdOutlineDelete } from "react-icons/md"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onDelete: (ids: number[]) => void
  onEdit: (id: number) => void
  onDeleteEach: (id: number) => void
  edit: boolean
  onView: (data: Array<string>) => void
  totalPages: number
  totalProducts: number
  page: number
  pageSize: number
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void,
  setSearchTerm:(serchTerm:string)=>void,
  searchTerm:string
}

export function ProductDataTable<TData, TValue>({
  columns,
  data,
  onDelete,
  onEdit,
  onDeleteEach,
  searchTerm,
  edit,
  onView,
  totalPages,
  totalProducts,
  page,
  pageSize,
  setPage,
  setPageSize,
  setSearchTerm
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  const handleDeleteSelected = () => {
    const confirm = window.confirm('Are you sure you want to delete')
    if (!confirm) return
    const selectedRows = table.getFilteredSelectedRowModel().rows
    selectedRows.forEach(row => onDelete(row.original as any))
    setRowSelection({}) // Clear selection after delete
  }

  // Handle toggle status
  const handleStatusToggle = (rowId: string, currentStatus: boolean) => {
    // You can update the row's status here by calling an API or setting state
    // Example of updating the status:
    // onUpdateStatus(rowId, currentStatus ? 'inactive' : 'active')
  }

  return (
    <div>
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Search all columns..."
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value)
            // setGlobalFilter(event.target.value)
            // table.setGlobalFilter(event.target.value)
          }}
          className="max-w-sm"
        />

      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => ( 
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-gray-100 cursor-pointer">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}

                  {/* Status Column with Toggle */}
                  {/* <TableCell>
                    <div
                      className="w-[3.5rem] h-[1.3rem] border-[1px] border-gray-300 flex cursor-pointer"
                      onClick={() => handleStatusToggle(row.id, row.original.Status === 1)}
                    >
                      <div className={`w-[50%] h-[100%] ${row.original.Status === 1 ? 'bg-green-600' : 'bg-gray-500'}`} />
                      <div className={`w-[50%] h-[100%] ${row.original.Status !== 0 ? 'bg-white' : 'bg-red-500'}`} />
                    </div>
                  </TableCell> */}

                  {/* Edit, View, and Delete Actions */}
                  {edit && (
                    <>
                    <TableCell className="flex justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(row.original as any)}
                      >
                        <FaRegEdit className="text-blue-500 text-xl" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(row.original as any)}
                      >
                        <IoEyeOutline className="text-blue-600 text-xl" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteEach(row.original as any)}
                      >
                        <MdOutlineDelete className="text-red-500 text-2xl" />
                      </Button>
                    </TableCell>
                    </>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
<div className=" flex w-[100%] items-end justify-end py-3">
  
{edit && <Button
          className="ml-auto"
          onClick={handleDeleteSelected}
          disabled={table.getFilteredSelectedRowModel().rows.length === 0}
          variant="destructive"
        >
          Delete Selected ({table.getFilteredSelectedRowModel().rows.length})
        </Button>}
</div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {page} of {totalPages} page(s)
        </div>
        <div className="space-x-2 flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              table.previousPage()
              setPage(page - 1)
            }}
            disabled={page === 1}
          >
            Previous
          </Button>
           <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pages) => (
                          <Button
                            key={pages}
                            variant={page === pages ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(pages)}
                          >
                            {pages}
                          </Button>
                        ))}
                      </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              table.nextPage()
              setPage(page + 1)
            }}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
