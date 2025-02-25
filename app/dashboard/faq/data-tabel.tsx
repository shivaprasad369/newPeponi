import { useState } from "react";
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
} from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaRegEdit } from "react-icons/fa";
import { MdOutlineDelete } from "react-icons/md";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onDelete: (ids: number[]) => void;
  onEdit: (id: number) => void;
  onDeleteEach: (id: number) => void;
  edit: boolean;
  faq:boolean;
  
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onDelete,
  onEdit,
  onDeleteEach,
  edit,
  faq
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set()); // Track expanded rows

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
        const rowValue = String(row.getValue(columnId)).toLowerCase();
        return rowValue.includes(String(value).toLowerCase());
      },
    },
    globalFilterFn: (row, columnId, filterValue) => {
      const rowValue = String(row.getValue(columnId)).toLowerCase();
      return rowValue.includes(String(filterValue).toLowerCase());
    },
  });

  const handleRowClick = (rowId: string) => {
    const updatedExpandedRows = new Set(expandedRows);
    if (updatedExpandedRows.has(rowId)) {
      updatedExpandedRows.delete(rowId); // If already expanded, collapse it
    } else {
      updatedExpandedRows.add(rowId); // Otherwise, expand the row
    }
    setExpandedRows(updatedExpandedRows);
  };

  const handleDeleteSelected = () => {
    const confirm = window.confirm("Are you sure you want to delete?");
    if (!confirm) return;
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    selectedRows.forEach((row) => onDelete(row.original as any));
    setRowSelection({}); // Clear selection after delete
  };

  return (
    <div>
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Search all columns..."
          value={globalFilter}
          onChange={(event) => {
            setGlobalFilter(event.target.value);
            table.setGlobalFilter(event.target.value);
          }}
          className="max-w-sm"
        />

        
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
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
              table.getRowModel().rows.map((row:any) => (
                <>
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => handleRowClick(row.id)} 
                    className="hover:bg-gray-100 cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell:any) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                    {edit && (
                      <TableCell className="flex justify-end space-x-6">
                        {/* <Button variant="ghost" size="sm" > */}
                          <FaRegEdit className="text-blue-500 text-xl " onClick={() => onEdit(row.original as any)} />
                        {/* </Button> */}
                        {/* <Button variant="ghost" size="sm" onClick={() => onDeleteEach(row.original as any)}> */}
                          <MdOutlineDelete className="text-red-500 text-2xl" onClick={() => onDeleteEach(row.original as any)} />
                        {/* </Button> */}
                      </TableCell>
                    )}
                  </TableRow>
                  {/* If the row is expanded, show the answer below it */}
                  {faq && expandedRows.has(row.id) && (
                    <TableRow key={`${row.id}-expanded`}>
                      <TableCell colSpan={columns.length} className="bg-gray-100 p-4">
                        {/* Display the answer or additional content here */}
                        <h1 className="font-semibold">Answer</h1>
                        <div>{row.original.answer}</div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
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
      <div className="flex items-end justify-end py-3">
      {edit && (
          <Button
            className="ml-auto"
            onClick={handleDeleteSelected}
            disabled={table.getFilteredSelectedRowModel().rows.length === 0}
            variant="destructive"
          >
            Delete Selected ({table.getFilteredSelectedRowModel().rows.length})
          </Button>
        )}
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
  <div className="flex-1 text-sm text-muted-foreground">
    {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
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
  );
}
