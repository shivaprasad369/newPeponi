"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Category {
  CategoryID: number;
  CategoryName: string;
}

interface SubCategory {
  SubCategoryID: number;
  SubCategoryName: string;
  CategoryID: number;
  ParentCategoryID: number;
  CategoryName: string;
  Image: string;
}

export default function SubCategoryEditPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number>(0);
  const [subCategoryId, setSubCategoryId] = useState(0);
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState("");
  const [oldImage, setOldImage] = useState("");
  

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/category`);
      return response.data.result;
    }
  });

  const { data: subcategory } = useQuery<SubCategory>({
    queryKey: ["subcategory", params.id],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/category/update/get/${params.id}`);
      return response.data.result[0];
    }
  });

  useEffect(() => {
    if (subcategory) {
      setName(subcategory.CategoryName);
      setCategoryId(subcategory.ParentCategoryID);
      setSubCategoryId(subcategory.SubCategoryID);
      setOldImage(subcategory.Image);
      setPreviewImage(`${process.env.NEXT_PUBLIC_API_URL}/${subcategory.Image}`);
    }
  }, [subcategory]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setPreviewImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("CategoryName", name);
      formData.append("ParentCategoryID", Number(categoryId));
      formData.append("Image", oldImage);
      formData.append('SubCategoryLevel', "2");
      if (image) {
        formData.append("NewImage", image);
      }
      

      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/category/update/${params.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Subcategory updated successfully");
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      router.push("/dashboard/sub-category");
    } catch (error) {
      toast.error("Error updating subcategory");
    }
  };

  return (
    <div className="container mx-auto ">
      <div className='flex mt-2 justify-start pb-4  gap-2 w-[100%] items-center'>
            <h1 className='text-4xl font-normal'>Edit Subcategory</h1>
        </div>
      <Card className="py-6">
        {/* <CardHeader>
          <CardTitle>Edit Subcategory</CardTitle>
        </CardHeader> */}
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="Enter subcategory name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select 
                value={categoryId.toString()} 
                // disabled={true}
                onValueChange={(value: string) => setCategoryId(Number(value))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem 
                      key={category.CategoryID} 
                      value={category.CategoryID.toString()}
                    >
                      {category.CategoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {previewImage && (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="mt-2 w-32 h-32 object-cover rounded"
                />
              )}
            </div>

            <div className="flex gap-4">
              <Button type="submit">Update Subcategory</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/sub-category")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}