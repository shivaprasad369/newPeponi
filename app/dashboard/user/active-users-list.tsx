"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { MoreHorizontal, Trash, Lock, Eye, ArrowUpDown } from "lucide-react"
import type { User } from "./types"
import UserDetailsDialog from "./user-details-dialog"
import { FaRegEdit } from "react-icons/fa"
import { MdOutlineDelete } from "react-icons/md"
import { IoEyeOutline } from "react-icons/io5"

interface ActiveUsersListProps {
  users: User[]
  onBlock: (userId: number) => void
  onDelete: (userId: number) => void
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  page: number
  limit: number
  total: number
}

export default function ActiveUsersList({ users, onBlock, onDelete, setPage, setLimit, page, limit, total }: ActiveUsersListProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null)

  const itemsPerPage = limit
  const totalPages = Math.ceil(users.length / itemsPerPage)

  const sortedUsers = [...users].sort((a, b) => {
    if (sortConfig !== null) {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
    }
    return 0
  })

  const paginatedUsers = sortedUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  const handleView = async (user: User) => {
    setSelectedUser(user)
  }

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold cursor-pointer items-center" onClick={() => requestSort('name')}>
                <div className="flex items-center">
                  <div>Name</div>
                  <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
                </TableHead>
              <TableHead className="font-semibold cursor-pointer items-center " onClick={() => requestSort('email')}>
              <div className="flex items-center">Email <ArrowUpDown className="ml-2 h-4 w-4" /></div>
              </TableHead>
              <TableHead className="font-semibold cursor-pointer " >Phone Number </TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell className="text-right flex items-center justify-end gap-2">
                  <div className="mr-3" onClick={() => handleView(user)}>
                    <IoEyeOutline className="text-blue-600 text-xl" />
                  </div>
                  <div onClick={() => onBlock(user.id)}>
                    <Lock className="mr-2 h-4 w-4" />
                  </div>
                  <div onClick={() => onDelete(user.id)}>
                    <MdOutlineDelete className="text-red-500 text-xl" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardContent className="flex justify-between items-center p-4 border-t">
        <div className="flex justify-between w-[100%] items-center mt-4">
          <div className="flex">
            <span>
              Page {page} of {total}
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <Button onClick={() => setPage(page - 1)} disabled={page === 1}>
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === page ? "default" : "outline"}
                className="w-8 h-8 p-0"
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </Button>
            ))}
            <Button onClick={() => setPage(page + 1)} disabled={page === totalPages}>
              Next
            </Button>
          </div>
        </div>
      </CardContent>
      {selectedUser && <UserDetailsDialog user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </Card>
  )
}