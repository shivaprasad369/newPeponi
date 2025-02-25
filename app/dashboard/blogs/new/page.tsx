"use client";

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
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";
import TextEditor from "@/components/ui/Editor";

interface BlogFormData {
  title: string;
  shortDesc: string;
  content: string;
  author: string;
  image: File | null;
}

export default function NewBlogPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<BlogFormData>({
    defaultValues: {
      title: "",
      shortDesc: "",
      content: "",
      author: "",
      image: null,
    },
  });
 
const shortDesc = watch("shortDesc", ""); // Watching the shortDesc input

  const onSubmit = async (data: BlogFormData) => {
    if (!data.image) {
      setError("image", { type: "required", message: "Blog image is required" });
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", data.title);
      formDataToSend.append("shortdesc", data.shortDesc);
      formDataToSend.append("description", data.content);
      formDataToSend.append("author", data.author);
      if (data.image) {
        formDataToSend.append("Image", data.image);
      }

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/blog`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Blog created successfully");
      router.push("/dashboard/blogs");
    } catch (error) {   
      toast.error("Failed to create blog");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Create New Blog</h2>
      <Card>
        <CardHeader>
          <CardTitle>Blog Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Blog Title</Label>
              <Input
                id="title"
                placeholder="Enter blog title"
                disabled={isSubmitting}
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
            </div>
          



<div className="space-y-2">
  <Label htmlFor="shortDesc">Short Description</Label>
  <Textarea
    id="shortDesc"
    placeholder="Enter short description"
    disabled={isSubmitting}
    maxLength={1000} // Prevents typing beyond 200 characters
    {...register("shortDesc", { 
      required: "Short description is required",
      maxLength: {
        value: 1000,
        message: "Short description cannot exceed 1000 characters"
      }
    })}
  />
  
  {/* Show an error message when length reaches the limit */}
  {shortDesc.length >= 1000 && (
    <p className="text-red-500 text-sm">Short description cannot exceed 1000 characters</p>
  )}

  {errors.shortDesc && <p className="text-red-500 text-sm">{errors.shortDesc.message}</p>}
</div>

            <div className="space-y-2">
              <Label htmlFor="image">Blog Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                disabled={isSubmitting}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setValue("image", file);
                  if (!file) {
                    setError("image", { type: "required", message: "Blog image is required" });
                  } else {
                    clearErrors("image");
                  }
                }}
              />
              {errors.image && <p className="text-red-500 text-sm">{errors.image.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Blog Content</Label>
              <Controller
                name="content"
                control={control}
                rules={{ required: "Blog content is required" }}
                render={({ field }) => (
                  <TextEditor
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      if (!value.trim()) {
                        setError("content", { type: "required", message: "Blog content is required" });
                      } else {
                        clearErrors("content");
                      }
                    }}
                  />
                )}
              />
              {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                placeholder="Enter author name"
                disabled={isSubmitting}
                {...register("author", { required: "Author name is required" })}
              />
              {errors.author && <p className="text-red-500 text-sm">{errors.author.message}</p>}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Create Blog"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
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
