"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import ActiveUsersList from "./active-users-list"
import BlockedUsersList from "./blocked-users-list"
import type { User } from "./types"
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import toast, { Toaster } from "react-hot-toast"
import InCompleteUsersList from './incomplete-user-list'

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState("active")
  const [users, setUsers] = useState<User[]>([])
  const [page,setPage]=useState(1)
  const [limit,setLimit]=useState(10)
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user?page=${page}&limit=${limit}`);
      return response.data;
    },
    keepPreviousData: true,

  });
  console.log(data  )
useEffect(()=>{
if(data && !isLoading){
  setUsers(data.users)
}
},[data,isLoading])

const inComplete = users.filter((user) => user.status === 0)
  const activeUsers = users.filter((user) => user.status === 1)
  const blockedUsers = users.filter((user) => user.status ===2)

  const handleBlock = async(userId: number) => {
    try {
      const confirm=window.confirm('Are you sure you want to add to block list')
      if(!confirm){return}
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`, {
        status:2
      })
      if(response.status===200){
        toast.success("Added successfully")
        queryClient.invalidateQueries(["user"])
        setUsers(users.map((user) => (user.id === userId ? { ...user, status: 2 } : user)))
      }
  
      
    } catch (error) {
      toast.error("something went wrong")
    }
  }

  const handleUnblock = async(userId: number) => {
    try {
      const confirm=window.confirm('Are you sure you want to Unblock ')
      if(!confirm){return}
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`, {
        status:1
      })
      if(response.status===200){
        toast.success("Added successfully")
        queryClient.invalidateQueries(["user"])
        setUsers(users.map((user) => (user.id === userId ? { ...user, status: 1} : user)))
      }
  
      
    } catch (error) {
      toast.error("something went wrong")
    }
    
  }

  const handleDelete = async(userId: number) => {
    try {
      const confirm=window.confirm('Are you sure you want to Unblock ')
      if(!confirm){return}
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`)
      if(response.status===200){
        toast.success("Deleted successfully")
        queryClient.invalidateQueries(["user"])
        setUsers(users.filter((user) => user.id !== userId))
      }
    } catch (error) {
      toast.error("something went wrong")
    }
  }

  return (
    <Card className="w-full">
      <Toaster/>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="incomplete">Incomplete Users</TabsTrigger>
            <TabsTrigger value="active">Active Users</TabsTrigger>
            <TabsTrigger value="blocked">Blocked Users</TabsTrigger>
          </TabsList>
          <TabsContent value="incomplete">
            <Card>
              <CardContent className="p-4">
             {inComplete.length>0 ? <InCompleteUsersList users={inComplete}  onDelete={handleDelete} page={page} total={data?.totalPages} limit={limit} setPage={setPage} setLimit={setLimit} />
                : <span className="text-red-600 font-semibold">No Data Found</span>}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="active">
           {activeUsers.length>0 ? <ActiveUsersList users={activeUsers} onBlock={handleBlock} onDelete={handleDelete} page={page} total={data?.totalPages} limit={limit} setPage={setPage} setLimit={setLimit} />
  : <span className="text-red-600 font-semibold">No Data Found</span> }        </TabsContent>
          <TabsContent value="blocked">
           {blockedUsers.length>0? <BlockedUsersList users={blockedUsers} onUnblock={handleUnblock} onDelete={handleDelete} page={page} limit={limit} setPage={setPage} setLimit={setLimit} />
          : <span className="text-red-600 font-semibold">No Data Found</span> }</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

