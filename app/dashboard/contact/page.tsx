"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { DataTables } from "./data-tabel";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowUpDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import toast, { Toaster } from "react-hot-toast";
import _ from "lodash";

interface Blog {
  id: number;
  title: string;
  shortdesc: string;
  description: string;
  author: string;
  image: string;
  created_at: string;
  Status:any
}

const columns: ColumnDef<Blog>[] = [
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
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "FullName",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "Email",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "CreatedAt",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.original.CreatedAt);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric', 
        year: 'numeric'
      });
    }
  },

  {
    header:' '
  }
  
];

export default function contactPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [page, setPage] = useState<any>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalProducts, setTotalProducts] = useState<number>(0);


  const { data, isLoading: isLoadingBlogs } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/contact`,{
        params: {
          page,
          pageSize,
          searchTerm: searchTerm
        },
      });
      return response;
    }
  });

  useEffect(() => {
    if (data && data.data.data.length > 0 && !isLoadingBlogs) {
      setBlogs(data.data.data);
      setTotalPages(Math.ceil(data.data.pagination.totalContacts / pageSize));
      setTotalProducts(data.data.pagination.totalContacts);
    }
  }, [data, isLoadingBlogs]);
  const fetchReviews = useCallback(
    _.debounce(async (filters: any) => {
      try {
        if (filters.search === "") return
        const query = new URLSearchParams(filters).toString()
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/contact?page=${page}&pageSize=${pageSize}&${query}`,

        )
        if (response.status === 200) {

          // setProducts(response.data.products)
          // setTotalPages(response.data.totalPages);
          // setTotalProducts(response.data.totalProducts);
          console.log(response.data.data)
          setBlogs(response.data.data)
          setTotalPages(Math.ceil(response.data.pagination.totalContacts / pageSize));
          setTotalProducts(response.data.pagination.totalContacts);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error)
      }
    }, 500),
    [page],
  )

  useEffect(() => {
    fetchReviews({ searchTerm })
  }, [searchTerm, fetchReviews,page])

  const handleDelete = async (ids: number[]) => {
    const confirm=window.confirm("Are you sure you want to delete this blog?");
    if(!confirm){
      return;
    }
    setBlogs(blogs.filter((blog) => !ids.includes(blog.id)));
  };

  
  const handleDeleteEach = async (id: any) => {
    try {
      
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/contact/${id.ContactID}`);
      if (response.status === 200) {
        toast.success("contact Deleted Successfully");
        queryClient.invalidateQueries({ queryKey: ["contacts"] });
        // setBlogs(blogs.filter((blog) => blog.ContactID !== ContactID));
      }
    } catch (error) {
      toast.error("Failed to delete blog");
    }
  };
  const handleView = (data: any) => {
    setSelectedBlog(data);
    setShowDialog(true);
  };

  return (
    <div className="space-y-6 bg-white">
      <div className="flex justify-between items-center">
        <Toaster/>
      <div className='flex mt-2 justify-start px-4  gap-2 w-[100%] items-center'>
            <h1 className='text-4xl font-normal'>  Manage Contact</h1>
        </div>
  
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact List</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTables 
            columns={columns} 
            data={blogs} 
            pagination={!isLoadingBlogs && data?.data}
            onDelete={handleDelete} 
            totalBlogs={totalProducts}
            totalPages={totalPages}
            page={page}
            setPage={setPage}

            term={searchTerm}
            onView={handleView}
            setSearchTerm={setSearchTerm}
            onDeleteEach={handleDeleteEach}
          />
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
  <DialogContent className="sm:max-w-[500px] p-6 rounded-lg">
    <DialogHeader>
      <DialogTitle className="text-xl font-semibold text-gray-900">Contact Details</DialogTitle>
    </DialogHeader>

    {selectedBlog ? (
      <div className="space-y-6 bg-gray-50 p-4 rounded-md shadow-sm">
        {/* ✅ Full Name */}
        <div className="border-b pb-3">
          <Label className="text-gray-600 font-medium">Full Name</Label>
          <p className="text-lg font-semibold text-gray-900">{selectedBlog.FullName || "N/A"}</p>
        </div>

        {/* ✅ Email */}
        <div className="border-b pb-3">
          <Label className="text-gray-600 font-medium">Email</Label>
          <p className="text-md text-blue-600">{selectedBlog.Email || "N/A"}</p>
        </div>

        {/* ✅ Message */}
        <div>
          <Label className="text-gray-600 font-medium">Message</Label>
          <p className="text-md text-gray-800">{selectedBlog.Message || "No message provided"}</p>
        </div>
      </div>
    ) : (
      <p className="text-center text-gray-500">No contact details available</p>
    )}
  </DialogContent>
</Dialog>

    </div>
  );
}
