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
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import TextEditor from "@/components/ui/Editor";
import toast, { Toaster } from "react-hot-toast";
import { useForm } from "react-hook-form";

interface Blog {
  id: number;
  title: string;
  shortDesc: string;
  content: string;
  author: string;
  image: string;
}

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      title: "",
      shortDesc: "",
      content: "",
      author: "",
      image: null as File | null,
    }
  });

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/blog/${params.id}`);
        const blogData = response.data.result[0];
        
        setValue("title", blogData.title || "");
        setValue("shortDesc", blogData.shortdesc || "");
        setValue("content", blogData.description || "");
        setValue("author", blogData.author || "");
        setImage(blogData.image);
      } catch (error) {
        toast.error("Failed to fetch blog");
      }
    };

    if (params.id) {
      fetchBlog();
    }
  }, [params.id, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setValue("image", e.target.files[0]);
    }
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", data.title);
      formDataToSend.append("shortdesc", data.shortDesc);
      formDataToSend.append("description", data.content);
      formDataToSend.append("author", data.author);
      if (data.image) {
        formDataToSend.append("Image", data.image);
      }

      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/blog/${params.id}`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Blog updated successfully");
      router.push("/dashboard/blogs");
    } catch (error) {
      toast.error("Failed to update blog");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster />
      <h2 className="text-3xl font-bold tracking-tight">Update Blog</h2>
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
                disabled={isLoading}
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDesc">Short Description</Label>
              <Textarea
                id="shortDesc"
                placeholder="Enter short description"
                disabled={isLoading}
                {...register("shortDesc", {
                  required: "Short description is required",
                  maxLength: { value: 1000, message: "Short description cannot exceed 1000 characters" }
                })}
              />
              {errors.shortDesc && <p className="text-red-500 text-sm">{errors.shortDesc.message}</p>}
            </div>

            <div className="space-y-2 border-[1px] border-gray-300 p-2 rounded-md w-fit">
              <Label>Old Image</Label>
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}/${image}`}
                alt="Old Blog Image"
                width={150}
                height={100}
                className="rounded-md object-cover"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">New Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                disabled={isLoading}
                {...register("image")}
                onChange={handleImageChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Blog Content</Label>
              <TextEditor value={watch("content")} onChange={(value) => setValue("content", value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                placeholder="Enter author name"
                disabled={isLoading}
                {...register("author", { required: "Author is required" })}
              />
              {errors.author && <p className="text-red-500 text-sm">{errors.author.message}</p>}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                Update Blog
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
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
