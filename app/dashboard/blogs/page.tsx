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
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => (
      <div className="relative w-12 h-12">
        <Image 
          src={`${process.env.NEXT_PUBLIC_API_URL}/${row.original.image}`}
          alt={row.original.title}
          fill
          className="object-cover rounded-md"
        />
      </div>
    )
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric', 
        year: 'numeric'
      });
    }
  },
  {
    accessorKey: 'Status',
    header: 'Status',
    cell: ({ row }) => {
      const queryClient = useQueryClient();
      const [isToggling, setIsToggling] = useState(false); // Prevents multiple toggles during a pending API request
  
      const handleToggle = async (id:any, currentStatus:any) => {
        setIsToggling(true);
        const newStatus = currentStatus !== 1 ? 1 : 0; // Toggle status
  
        try {
          const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/blog/status/${id}`, {
            Status: newStatus
          });
  
          if (res.status === 200) {
            // Invalidate queries and update the UI
            queryClient.invalidateQueries({queryKey:['blogs']});
          }
        } catch (error) {
          console.error('Error toggling status:', error);
        } finally {
          setIsToggling(false);
        }
      };
  
      return (
        <div
          className="w-[3.5rem] h-[1.3rem] border-[1px] border-gray-300 flex cursor-pointer"
          onClick={() => !isToggling && handleToggle(row.original.id , row.original.Status)} // Prevent toggling while the request is in progress
        >
          <div
            className={`w-[50%] h-[100%] ${row.original.Status === 1 ? 'bg-green-600' : 'bg-white'}`}
          />
          <div
            className={`w-[50%] h-[100%] ${row.original.Status === 0 ? 'bg-red-500' : 'bg-white'}`}
          />
        </div>
      );
    },
  },
  {
    header:' '
  }
  
];

export default function BlogsPage() {
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
    queryKey: ["blogs"],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/blog`,{
        params: {
          page,
          pageSize,
        },
      });
      return response;
    }
  });

  useEffect(() => {
    if (data && data.data.blogs.length > 0 && !isLoadingBlogs) {
      setBlogs(data.data.blogs);
      setTotalPages(Math.ceil(data.data.totalBlogs / pageSize));
      setTotalProducts(data.data.totalBlogs);
    }
  }, [data, isLoadingBlogs]);
  const fetchReviews = useCallback(
    _.debounce(async (filters: any) => {
      try {
        if (filters.search === "") return
        const query = new URLSearchParams(filters).toString()
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/blog?page=${page}&pageSize=${pageSize}&${query}`,

        )
        if (response.status === 200) {

          // setProducts(response.data.products)
          // setTotalPages(response.data.totalPages);
          // setTotalProducts(response.data.totalProducts);
          setBlogs(response.data.blogs)
          setTotalPages(Math.ceil(response.data.totalBlogs / pageSize));
          setTotalProducts(response.data.totalBlogs);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error)
      }
    }, 500),
    [],
  )

  useEffect(() => {
    fetchReviews({ searchTerm })
  }, [searchTerm, fetchReviews])

  const handleDelete = async (ids: number[]) => {
    const confirm=window.confirm("Are you sure you want to delete this blog?");
    if(!confirm){
      return;
    }
    setBlogs(blogs.filter((blog) => !ids.includes(blog.id)));
  };

  const handleEdit = (arr: any) => {
    console.log(arr);
    router.push(`/dashboard/blogs/edit/${arr.id}`);
    
  };
  const handleDeleteEach = async (id: any) => {
    try {
      const confirm=window.confirm("Are you sure you want to delete this blog?");
      if(!confirm){
        return;
      }
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/blog/${id.id}`);
      if (response.status === 200) {
        toast.success("Blog Deleted Successfully");
        queryClient.invalidateQueries({ queryKey: ["blogs"] });
        setBlogs(blogs.filter((blog) => blog.id !== id));
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
            <h1 className='text-4xl font-normal'>  Manage Blogs</h1>
        </div>
        <Button onClick={() => router.push("/dashboard/blogs/new")}>
          Create New Blog
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blog List</CardTitle>
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
            onEdit={handleEdit} 
            setSearchTerm={setSearchTerm}
            edit={true}
            onDeleteEach={handleDeleteEach}
          />
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[800px] h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Blog Details</DialogTitle>
          </DialogHeader>
          {selectedBlog && (
            <div className="space-y-4">
              <div className="relative w-full h-72">
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}/${selectedBlog.image}`}
                  alt={selectedBlog.title}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <div>
                <Label>Title</Label>
                <p className="text-sm">{selectedBlog.title}</p>
              </div>
              <div>
                <Label>Short Description</Label>
                <p className="text-sm">{selectedBlog.shortdesc}</p>
              </div>
              <div>
                <Label>Content</Label>
                <p className="text-sm"><p dangerouslySetInnerHTML={{ __html:selectedBlog.description}} className='flex tracking-wider flex-col gap-2' /></p>
              </div>
              <div>
                <Label>Author</Label>
                <p className="text-sm">{selectedBlog.author}</p>
              </div>
              <div>
                <Label>Date</Label>
                <p className="text-sm">
                  {new Date(selectedBlog.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
