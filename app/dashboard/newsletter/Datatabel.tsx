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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { FaRegEdit } from "react-icons/fa"
import { MdOutlineDelete } from "react-icons/md"
import { IoEyeOutline } from "react-icons/io5"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onDelete: (ids: number[]) => void
  onEdit: (id: number) => void
  onDeleteEach: (id: number) => void
  edit: boolean
}

export function DataTable<TData, TValue>({ columns, data, onDelete, onEdit, onDeleteEach, edit }: DataTableProps<TData, TValue>) {
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
    filterFns: {
      fuzzy: (row, columnId, value) => {
        const rowValue = String(row.getValue(columnId)).toLowerCase()
        return rowValue.includes(String(value).toLowerCase())
      }
    },
    globalFilterFn: (row, columnId, filterValue) => {
      const rowValue = String(row.getValue(columnId)).toLowerCase()
      return rowValue.includes(String(filterValue).toLowerCase())
    },
  })

  const handleDeleteSelected = () => {
    const confirm = window.confirm('Are you sure you want to delete');
    if (!confirm) return;
    const selectedRows = table.getFilteredSelectedRowModel().rows
    selectedRows.forEach(row => onDeleteEach((row.original as any)))
    setRowSelection({}) // Clear selection after delete
  }

  return (
    <div>
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Search all columns..."
          value={globalFilter}
          onChange={(event) => {
            setGlobalFilter(event.target.value)
            table.setGlobalFilter(event.target.value)
          }}
          className="max-w-sm"
        />
        
        {edit && <Button
          className="ml-auto"
          onClick={handleDeleteSelected}
          disabled={table.getFilteredSelectedRowModel().rows.length === 0}
          variant="destructive"
        >
          Delete Selected ({table.getFilteredSelectedRowModel().rows.length})
        </Button>}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className=" hover:bg-gray-100 ">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      {cell === row.getVisibleCells()[row.getVisibleCells().length - 1] && (
                        // <DropdownMenu>
                        //   <DropdownMenuTrigger asChild>
                        //     <Button variant="ghost" className="h-8 w-8 p-0 float-right">
                        //       <span className="sr-only">Open menu</span>
                        //       <MoreHorizontal className="h-4 w-4" />
                        //     </Button>
                        //   </DropdownMenuTrigger>
                        //   <DropdownMenuContent align="end">
                        //     <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        //     {edit && <DropdownMenuItem onClick={() => onEdit(row.original as any)}>
                        //       Edit
                        //     </DropdownMenuItem>}
                        //     <DropdownMenuItem onClick={() => onDeleteEach((row.original as any))}>
                        //       Delete
                        //     </DropdownMenuItem>
                        //   </DropdownMenuContent>
                        // </DropdownMenu>
                        <TableCell className="flex justify-end space-x-1">
                       {edit && <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(row.original as any)}
                        >
                       <FaRegEdit className="text-blue-500 text-xl" />
                        </Button>}
                        {/* <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(row.original as any)}
                        >
                          <IoEyeOutline className="text-blue-600 text-xl" />
                        </Button> */}
                        {/* <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteEach(row.original as any)}
                        > */}
                         <MdOutlineDelete className="text-red-500 text-2xl"  onClick={() => onDeleteEach(row.original as any)} />
                        {/* </Button> */}
                      </TableCell>
                      )}
                    </TableCell>
                  ))}
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
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
      
  <div className="space-x-2 flex items-center">
    <Button
      variant="outline"
      size="sm"
      onClick={() => table.previousPage()}
      disabled={!table.getCanPreviousPage()}
    >
      Previous
    </Button>

    <div className="flex gap-1">
      {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map((pageNum) => (
        <Button
          key={pageNum}
          variant={table.getState().pagination.pageIndex + 1 === pageNum ? "default" : "outline"}
          size="sm"
          onClick={() => table.setPageIndex(pageNum - 1)}
        >
          {pageNum}
        </Button>
      ))}
    </div>

    <Button
      variant="outline"
      size="sm"
      onClick={() => table.nextPage()}
      disabled={!table.getCanNextPage()}
    >
      Next
    </Button>
  </div>


      </div>
    </div>
  )
} 