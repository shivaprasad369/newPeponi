"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { debounce } from "lodash";
import toast, { Toaster } from "react-hot-toast";
const categorySchema = z.object({
  name: z.string().min(3, "Category Name must be at least 3 characters"),
  metaTitle: z.string().min(5, "Meta Title must be at least 5 characters"),
  metaDescription: z.string().min(10, "Meta Description must be at least 10 characters"),
  metaKeywords: z.string().min(5, "Enter at least 5 characters"),
  image: z
    .any()
    .refine((file) => file.length > 0, "Image is required")
    .refine((file) => file[0]?.size <= 2 * 1024 * 1024, "Image must be less than 2MB"),
});

export default function CategoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [previewImage, setPreviewImage] = useState<string>("");
  const [checking, setChecking] = useState(false); 
  const [exist,setExist]=useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(categorySchema),
  });

  const imageFile = watch("image");

  useEffect(() => {
    if (imageFile?.length > 0) {
      const file = imageFile[0];
      setPreviewImage(URL.createObjectURL(file));
    }
  }, [imageFile]); // Runs only when `imageFile` changes
  

  const onSubmit = async (data: any) => {
    if (exist) {
      toast.error("Category name already exists");
      setError("name", { type: "manual", message: "Category name already exists" });
      return;
    }

    const formData = new FormData();
    formData.append("CategoryName", data.name);
    formData.append("Title", data.metaTitle);
    formData.append("KeyWord", data.metaDescription);
    formData.append("Description", data.metaKeywords);
    formData.append("Image", data.image[0]);

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/category`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Category Added Successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      router.push("/dashboard/category");
      reset();
      setPreviewImage("");
    } catch (error) {
      toast.error("Failed to add category");
    }
  };


  // API Call to Check if Category Exists
  const checkCategoryExists = async (name:any) => {
    if (!name.trim()) return;
    
    setChecking(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/home/check?name=${name}`);
      if (res.data.exists) {
        setError("name", { type: "manual", message: "Category name already exists" });
        setExist(true)
      } else {
        clearErrors("name");
        setExist(false)
      }
    } catch (error) {
      console.error("Error checking category:", error);

    } finally {
      setChecking(false);
    }
  };
  const debouncedCheck = debounce((value) => checkCategoryExists(value), 500);
  return (
    <div className="container mx-auto px-6 space-y-6 bg-white">
      <h1 className="text-4xl font-normal">Add New Category</h1>
<Toaster/>
      <Card>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category Name</label>
              <Input {...register("name")} placeholder="Enter category name" onChange={(e) => debouncedCheck(e.target.value)}/>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Meta Title</label>
              <Input {...register("metaTitle")} placeholder="Enter meta title" />
              {errors.metaTitle && <p className="text-red-500 text-xs mt-1">{errors.metaTitle.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Meta Description</label>
              <Textarea {...register("metaDescription")} placeholder="Enter meta description" rows={4} />
              {errors.metaDescription && <p className="text-red-500 text-xs mt-1">{errors.metaDescription.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Meta Keywords</label>
              <Input {...register("metaKeywords")} placeholder="Enter meta keywords (comma separated)" />
              {errors.metaKeywords && <p className="text-red-500 text-xs mt-1">{errors.metaKeywords.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category Image</label>
              <Input type="file" accept="image/*" {...register("image")} />
              {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>}
              {previewImage && <img src={previewImage} alt="Preview" className="max-w-[200px] h-auto mt-2" />}
            </div>

            <div className="flex gap-4">
              <Button type="submit">Add Category</Button>
              <Button type="button" variant="outline" onClick={() => reset()}>
                Clear
              </Button>
              <Button type="button" variant="ghost" onClick={() => router.push("/dashboard/category")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
