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
import { IoEyeOutline } from "react-icons/io5"
import { MdOutlineDelete } from "react-icons/md"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onDelete: (ids: number[]) => void
  onEdit: (id: number) => void
  onDeleteEach: (id: number) => void
  edit: boolean
  onView: (data: Array<string>) => void
  pagination:any,
  setSearchTerm:(searchTerm:any)=>void
  term:any
  totalBlogs:number,
  totalPages:number
  page:number,
  setPage: (page: number) => void,
}

export function DataTables<TData, TValue>({ columns,pagination,setSearchTerm,term, data,page,setPage, totalBlogs,totalPages ,onDelete, onEdit, onDeleteEach, edit, onView }: DataTableProps<TData, TValue>) {
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

    const selectedRows = table.getFilteredSelectedRowModel().rows
    selectedRows.forEach(row => onDeleteEach((row.original as any)))
    setRowSelection({}) // Clear selection after delete
  }

  return (
    <div>
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Search all columns..."
          value={term}
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
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                <TableRow key={row.id}
                
                className="cursor-pointer hover:bg-gray-100 "
                data-state={row.getIsSelected() && "selected"}>
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
                        //     <DropdownMenuItem onClick={() => onView(row.original as any)}>
                        //       View
                        //     </DropdownMenuItem>
                        //     <DropdownMenuItem onClick={() => onDeleteEach((row.original as any))}>
                        //       Delete
                        //     </DropdownMenuItem>
                        //   </DropdownMenuContent>
                        // </DropdownMenu>
                        <TableCell className="flex justify-end space-x-6">
                        {/* <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(row.original as any)}
                        > */}
                       <FaRegEdit className="text-blue-500 text-xl"  onClick={() => onEdit(row.original as any)}/>
                        <IoEyeOutline className="text-blue-600 text-xl"  onClick={() => onView(row.original as any)} />
                        {/* </Button> */}
                        {/* <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(row.original as any)}
                        >
                        </Button> */}
                       
                         {/* <MdOutlineDelete  onClick={() => onDeleteEach(row.original as any)} className="text-red-500 text-2xl" /> */}
                       
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
      {edit && 
      <div className=" w-[100%] flex items-end justify-end space-x-2 py-4"> 
        <Button
          className="ml-auto"
          onClick={handleDeleteSelected}
          disabled={table.getFilteredSelectedRowModel().rows.length === 0}
          variant="destructive"
        >
          Delete Selected ({table.getFilteredSelectedRowModel().rows.length})
        </Button>
      </div>
      // <Button
      //     className="ml-auto"
      //     onClick={handleDeleteSelected}
      //     disabled={table.getFilteredSelectedRowModel().rows.length === 0}
      //     variant="destructive"
      //   >
      //     Delete Selected ({table.getFilteredSelectedRowModel().rows.length})
      //   </Button>
        }
      <div className="flex items-center justify-end space-x-2 py-4">
      <div className="flex-1 text-sm text-muted-foreground">
  Page {page} of {totalPages}
</div>

<div className="space-x-2 flex items-center">
  <Button
    variant="outline"
    size="sm"
    onClick={() => setPage((prevPage:number) => Math.max(prevPage - 1, 1))} 
    disabled={page === 1}
  >
    Previous
  </Button>

  <div className="flex gap-1">
    {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map((pageNum) => (
      <Button
        key={pageNum}
        variant={page === pageNum ? "default" : "outline"}
        size="sm"
        onClick={() => setPage(pageNum)}
      >
        {pageNum}
      </Button>
    ))}
  </div>

  <Button
    variant="outline"
    size="sm"
    onClick={() => setPage((prevPage:number) => Math.min(prevPage + 1, totalPages))}
    disabled={page >= totalPages}
  >
    Next
  </Button>
</div>


</div>

    </div>
  )
}
