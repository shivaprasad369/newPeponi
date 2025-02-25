"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { ArrowUpDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductDataTable } from "./data-tabel";
import _ from "lodash"
interface Product {
  id: number;
  name: string;
  Image: string;
  category: string;
  created_at: string;
  AttributeValueID: number;
  ProductID:number;
  Status:any
}
interface ProductView {
    id: number;
    ProductName: string;
    Image: string;
    AttributeValueID: number;
    CategoryName: string;
    Description: string;
    AttributeValues: string[];
    created_at: string;
    ProductPrice:any
    ProductID:any
    SellingPrice:any
    DiscountPercentage:any
    Stock:any
  }

const columns: ColumnDef<Product>[] = [
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
          src={`${process.env.NEXT_PUBLIC_API_URL}/${row.original.Image}`}
          alt={row.original.name}
          fill
          className="object-cover rounded-md"
        />
      </div>
    )
  },
  {
    accessorKey: "ProductName",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Product Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "CategoryName",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey:'SellingPrice',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          SellingPrice
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey:'Stock',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Stock
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
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
          const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/paginate-product/${id}`, {
            Status: newStatus
          });
  
          if (res.status === 200) {
            // Invalidate queries and update the UI
            queryClient.invalidateQueries({queryKey:['products']});
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
          onClick={() => !isToggling && handleToggle(row.original.ProductID, row.original.Status)} // Prevent toggling while the request is in progress
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

export default function ProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductView | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["products", page, pageSize],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/paginate-product?page=${page}&pageSize=${pageSize}`);
      setTotalPages(response.data.totalPages);
      setTotalProducts(response.data.totalProducts);
      return response.data.products;
    }
  });
 


  useEffect(() => {
    if (data && data.length > 0 && !isLoading) {
      setProducts(data);
    }
  }, [data, isLoading]);
  const fetchReviews = useCallback(
    _.debounce(async (filters: any) => {
      try {
        if (filters.search === "") return
        const query = new URLSearchParams(filters).toString()
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/paginate-product?page=${page}&pageSize=${pageSize}&${query}`,

        )
        if (response.status === 200) {
          setProducts(response.data.products)
          setTotalPages(response.data.totalPages);
          setTotalProducts(response.data.totalProducts);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error)
      }
    }, 500),
    [ page, pageSize],
  )

  useEffect(() => {
    fetchReviews({ searchTerm })
  }, [searchTerm, fetchReviews])


  const handleDelete = async (id: any) => {
    console.log(id);
    try {
     
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/product/${id.ProductID }`);
      if (response.status === 200) {
        toast.success("Product Deleted Successfully");
        refetch();
        setProducts(products.filter((product) => product.id !== id.ProductID));
      }
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleEdit = async (product: any) => {
    const res= await axios.post(`/api/generate-id`,{
      id: product.ProductID,
      action: "mask",
    });
    // console.log(res.data.maskedID);
    router.push(`/dashboard/products/edit/${res.data.maskedID}`);
  };

  const handleDeleteEach = async (id: any) => {
    console.log(id);
    try {
      const confirm=window.confirm('Are you sure, want to delete product')
      if(!confirm)return
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/product/${id.ProductID }`);
      if (response.status === 200) {
        toast.success("Product Deleted Successfully");
        refetch();
        setProducts(products.filter((product) => product.id !== id.ProductID));
      }
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleView = (data: any) => {
    setSelectedProduct(data);
    setShowDialog(true);
  };
console.log(selectedProduct)
  return (
    <div className="space-y-6 bg-white">
      <div className="flex justify-between items-center">
      <div className='flex mt-2 justify-start px-4  gap-2 w-[100%] items-center'>
            <h1 className='text-4xl font-normal'>  Manage Products</h1>
        </div>
        <Button onClick={() => router.push("/dashboard/products/new")}>
          Add New Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductDataTable 
            columns={columns} 
            data={products} 
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            onDelete={handleDelete} 
            onView={handleView}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onEdit={handleEdit}     
            totalPages={totalPages}
            totalProducts={totalProducts}
            edit={true}
            onDeleteEach={handleDeleteEach}
          />
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4 overflow-y-auto pr-6">
              <div className="relative w-full h-72">
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}/${selectedProduct.Image}`}
                  alt={selectedProduct.ProductName}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-xl">Attributes</h3>
                {selectedProduct.AttributeValues
                  .filter((value) => value !== null)
                  .reduce((acc: any[], curr:any) => {
                    // Check if we already have this attribute_name
                    const exists = acc.find(item => item.AttributeValueID === curr?.AttributeValueID);
                    if (!exists) {
                      acc.push(curr);
                    }
                    return acc;
                  }, [])
                  .map((value, index) => (
                    <div key={index}>
                      <span className="font-medium">{value.AttributeName}: </span>
                      <span>{value.Value}</span>
                    </div>
                  ))}
              </div>
              <div className="flex flex-col gap-3">

                <h1 className="text-xl font-semibold">Product Details</h1>
             
              <div className="flex items-center gap-3">
                <h3 className="font-semibold">Product Name:</h3>
                <p>{selectedProduct.ProductName}</p>
              </div>
              <div className="flex items-center gap-3">
                <h3 className="font-semibold">Category:</h3>
                <p>{selectedProduct.CategoryName}</p>
              </div>
              <div className="flex items-center gap-3">
                <h3 className="font-semibold">Cost Price: </h3>
                <p>{selectedProduct.ProductPrice}</p>
              </div>
              <div className="flex items-center gap-3">
                <h3 className="font-semibold">Discounted Price: </h3>
                <p>{selectedProduct.SellingPrice}</p>
              </div>
            
              <div className="flex items-center gap-3">
                <h3 className="font-semibold">DiscountPercentage: </h3>
                <p>{selectedProduct.DiscountPercentage}</p>
                </div>
                <div  className="flex items-center gap-3">
                <h3 className="font-semibold">Quantity: </h3>
                <p>{selectedProduct.Stock}</p>
              </div>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-xl">Description</h3>
                <p dangerouslySetInnerHTML={{ __html:selectedProduct.Description}} className='flex tracking-wider flex-col gap-2' />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
