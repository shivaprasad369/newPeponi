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

interface SubCategory {
  SubCategoryID: number;
  SubCategoryName: string;
  CategoryID: number;
  CategoryName: string;
  Image: string;
}

export default function SubCategoryPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["subcategories"],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/category/update/2`);
      return response.data.result;
    }
  });

  useEffect(() => {
    if (data && data.length > 0 && !isLoading) {
      setSubCategories(data);
    }
  }, [data, isLoading]);

  const columns: ColumnDef<SubCategory>[] = [
    {
      id: "select",
      header: ({ table }) => (
        // <Checkbox
        //   checked={table.getIsAllPageRowsSelected()}
        //   onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        //   aria-label="Select all"
        // />
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
    },
    {
      accessorKey: "Image",
      header: "Image",
      cell: ({ row }) => (
        <img src={process.env.NEXT_PUBLIC_API_URL + "/" + row.original.Image} alt={row.original.SubCategoryName} className="w-16 h-16 object-cover" />
      ),
    },
    {
      accessorKey: "CategoryName",
      // header: "",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Subcategory Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "ParentCategoryName",
      // header: "Category Name",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Category Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },{
      header:' '
    }
  ];

  const handleDelete = async (ids: SubCategory[]) => {
    console.log(ids);
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/category/${ids.CategoryID}`)
      // toast.success("Subcategory deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      toast.success("Subcategories deleted successfully");
    } catch (error) {
      toast.error("Error deleting subcategories");
    }
  };

  const handleEdit = (subcategory: any) => {
    router.push(`/dashboard/sub-category/edit/${subcategory.CategoryID}`);
  };

  const handleDeleteEach = async (subcategory: SubCategory) => {
    try {
      const confirm = window.confirm('Are you sure you want to delete this subcategory?');
      if (!confirm) return;
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/category/${subcategory.CategoryID}`);
      toast.success("Subcategory deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
    } catch (error) {
      toast.error("Error deleting subcategory");
    }
  };

  return (
    <div className="container mx-auto py-0">
      <Toaster/>
      <div className="flex justify-between items-center mb-6">
      <div className='flex mt-2 justify-start px-4  gap-2 w-[100%] items-center'>
            <h1 className='text-4xl font-normal'>  Manage SubCategory</h1>
        </div>
        <Button onClick={() => router.push("/dashboard/sub-category/new")}>
          Add New Subcategory
        </Button>
      </div>
      
      <DataTable 
        columns={columns}
        data={subCategories}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onDeleteEach={handleDeleteEach}
        edit={true}
      />
    </div>
  );
}
