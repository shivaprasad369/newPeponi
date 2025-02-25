"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Category {
  id: number;
  name: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  image: string;
}

export default function BannerPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");

  

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setPreviewImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const clearForm = () => {
    setName("");
    setMetaTitle("");
    setMetaDescription("");
    setMetaKeywords("");
    setImage(null);
    setPreviewImage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    // formData.append("CategoryName", name);
    formData.append("bannerTitle", name);
    // formData.append("bannerText", metaDescription);
    formData.append("description", metaDescription);
    formData.append("bannerText", metaKeywords);

    if (image) {
      formData.append("bannerImage", image);
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/banner`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        toast.success("Banner Added Successfully");
        queryClient.invalidateQueries({ queryKey: ["banner"] });
        router.push("/dashboard/Banner");
        clearForm();
      }
    } catch (error) {
      toast.error("Failed to add Banner Image");
    }
  };

  return (
    <div className="container mx-auto px-6 space-y-6 bg-white">
      
      <div className='flex justify-start   gap-2 w-[100%] items-center'>
            <h1 className='text-4xl font-normal'>Add New Banner Image</h1>
        </div><Card>
        {/* <CardHeader>
          <CardTitle></CardTitle>
        </CardHeader> */}
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input 
                placeholder="Enter name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Meta Title</label>
              <Input 
                placeholder="Enter meta title"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Meta Description</label>
              <Textarea
                placeholder="Enter meta description"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                required
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Meta Keywords</label>
              <Input
                placeholder="Enter meta keywords (comma separated)"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Banner Image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
              {previewImage && (
                <div className="mt-2">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="max-w-[200px] h-auto"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button type="submit">Add Image</Button>
              <Button type="button" variant="outline" onClick={clearForm}>Clear</Button>
              <Button type="button" variant="ghost" onClick={() => router.push("/dashboard/Banner")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}