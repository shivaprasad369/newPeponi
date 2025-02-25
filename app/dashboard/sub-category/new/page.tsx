"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { debounce } from "lodash";

interface Category {
  CategoryID: number;
  CategoryName: string;
}

interface FormData {
  name: string;
  categoryId: number;
  image: File | null;
}

export default function NewSubCategoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState("");
  const [checking, setChecking] = useState(false);
  const [exist, setExist] = useState(false)
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/category`);
      return response.data.result;
    }
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    setError,
    clearErrors,

    reset
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      categoryId: 0,
      image: null
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setImage(selectedFile);
      setPreviewImage(URL.createObjectURL(selectedFile));
      setValue("image", selectedFile); // Set the selected image in the form
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      if(exist){
        toast.error("Subcategory name already exists");
        setError("name", { type: "manual", message: "Subcategory name already exists" });
        return;
      }
      const formData = new FormData();
      formData.append("CategoryName", data.name);
      formData.append("ParentCategoryID", data.categoryId.toString());
      formData.append("SubCategoryLevel", "2");
      if (data.image) {
        formData.append("Image", data.image);
      }

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/category`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Subcategory created successfully");
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      router.push("/dashboard/sub-category");
    } catch (error) {
      toast.error("Error creating subcategory");
    }
  };
  const checkCategoryExists = async (name: string) => {
    if (!name.trim()) return;

    setChecking(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/home/check?name=${name}`);
      if (res.data.exists) {
        setError("name", { type: "manual", message: "Subcategory name already exists" });
        setExist(true);
      } else {
        clearErrors("name");
        setExist(false);
      }
    } catch (error) {
      console.error("Error checking category:", error);
    } finally {
      setChecking(false);
    }
  };

  // Debounce the check function
  const debouncedCheck = debounce((value) => checkCategoryExists(value), 500);

  return (
    <div className="container mx-auto">
      <div className='flex mt-2 justify-start pb-4 gap-2 w-[100%] items-center'>
        <h1 className='text-4xl font-normal'>Create New Subcategory</h1>
      </div>
      <Card className="py-6">
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Controller
                control={control}
                name="name"
                rules={{
                  required: "Name is required",
                  minLength: {
                    value: 3,
                    message: "Name must be at least 3 characters",
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter subcategory name"
                    className={errors.name ? "border-red-500" : ""}
                    onChange={(e) => {
                      field.onChange(e); // Updates the React Hook Form state
                      debouncedCheck(e.target.value); // Triggers the category existence check
                    }}
                  />
                )}
              />

              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Controller
                control={control}
                name="categoryId"
                rules={{
                  required: "Category is required",
                }}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value?.toString()}
                    onValueChange={(value: string) => setValue("categoryId", Number(value))}
                    className={errors.categoryId ? "border-red-500" : ""}
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
                )}
              />
              {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Image</label>
              <Controller
                control={control}
                name="image"
                rules={{
                  required: "Image is required",
                  validate: {
                    imageSize: (file) => {
                      if (file && file.size > 5 * 1024 * 1024) {
                        return "File size must be less than 5MB";
                      }
                      return true;
                    },
                    imageType: (file) => {
                      if (file && !file.type.startsWith("image/")) {
                        return "Only image files are allowed";
                      }
                      return true;
                    },
                  },
                }}
                render={({ field }) => (
                  <>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className={errors.image ? "border-red-500" : ""}
                    />
                    {errors.image && <p className="text-sm text-red-500">{errors.image.message}</p>}
                    {previewImage && (
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="mt-2 w-32 h-32 object-cover rounded"
                      />
                    )}
                  </>
                )}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "loading..." : "Create Subcategory"}
              </Button>
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
