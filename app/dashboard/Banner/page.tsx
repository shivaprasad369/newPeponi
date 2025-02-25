"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { DataTable } from "../faq/data-tabel";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface Category {
  id: number;
  BannerTitle: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  BannerImage: string;
}

export default function BannerPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);

  const { data, isLoading,refetch } = useQuery({
    queryKey: ["banner"],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/banner`);
      return response.data.result;
    }
  });

  useEffect(() => {
    if (data && data.length > 0 && !isLoading) {
      setCategories(data);
    }
  }, [data, isLoading]);

  const columns: ColumnDef<Category>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(e.target.checked)}
          aria-label="Select row"
        />
      ),
      
    },
    {
      accessorKey: "Image",
      header: "Image",
      cell: ({ row }) => (
        <img src={process.env.NEXT_PUBLIC_API_URL + row.original.BannerImage} alt={row.original.BannerTitle} className="w-16 h-16 object-cover" />
      ),
    },
    {
      accessorKey: "BannerTitle",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      
    },
    // {
    //   accessorKey: 'Status',
    //   header: 'Status',
    //   cell: ({ row }) => {
    //     const queryClient = useQueryClient();
    //     const [isToggling, setIsToggling] = useState(false); // Prevents multiple toggles during a pending API request
    
    //     const handleToggle = async (id, currentStatus) => {
    //       setIsToggling(true);
    //       const newStatus = Number(currentStatus) !== 1 ? 1 : 0; // Toggle status
    
    //       try {
    //         const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/banner/status/${id}`, {
    //           status: newStatus
    //         });
    
    //         if (res.status === 200) {
    //           // Invalidate queries and update the UI
    //          refetch();
    //         }
    //       } catch (error) {
    //         console.error('Error toggling status:', error);
    //       } finally {
    //         setIsToggling(false);
    //       }
    //     };
    
    //     return (
    //       <div
    //         className="w-[3.5rem] h-[1.3rem] border-[1px] border-gray-300 flex cursor-pointer"
    //         onClick={() => !isToggling && handleToggle(row.original.BannerId , row.original.Status)} // Prevent toggling while the request is in progress
    //       >
    //         <div
    //           className={`w-[50%] h-[100%] ${row.original.Status === 1 ? 'bg-green-600' : 'bg-white'}`}
    //         />
    //         <div
    //           className={`w-[50%] h-[100%] ${row.original.Status === 0 ? 'bg-red-500' : 'bg-white'}`}
    //         />
    //       </div>
    //     );
    //   },
    // },
    {
      header:' '
    }
  ];

  const handleDelete = async (ids: any) => {
    console.log(ids);
    try {
       
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/banner/${ids.BannerId}`)
    
      queryClient.invalidateQueries({ queryKey: ["banner"] });
      toast.success("banner deleted successfully");
    } catch (error) {
      toast.error("Error deleting Banner");
    }
  };

  const handleEdit = async(id: any) => {
    console.log(id)
    const res= await axios.post(`/api/generate-id`,{
        id: id.BannerId,
        action: "mask",
      });
      // console.log(res.data.maskedID);
    //   router.push(`/dashboard/products/edit/${res.data.maskedID}`);
    router.push(`/dashboard/Banner/edit/${res.data.maskedID}`);
  };

  const handleDeleteEach = async (id: any) => {
    console.log(id);
    try {
        const confirm=window.confirm("Are you sure you want to delete this banner?");
        if(!confirm) return;
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/banner/${id.BannerId}`);
      toast.success("Banner deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["banner"] });
    } catch (error) {
      toast.error("Error deleting Banner");
    }
  };

  return (
    <div className="container mx-auto py-0">
      <div className="flex justify-between items-center mb-6">
      <div className='flex mt-2 justify-start px-4  gap-2 w-[100%] items-center'>
        <Toaster/>
            <h1 className='text-4xl font-normal'>  Manage Banner Images</h1>
        </div>
        {/* <Button onClick={() => router.push("/dashboard/Banner/new")}>
          Add New Banner Image
        </Button> */}
      </div>
      
      <DataTable 
        columns={columns}
        data={categories}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onDeleteEach={handleDeleteEach}
        edit={true}
        faq={false}
      />
    </div>
  );
}