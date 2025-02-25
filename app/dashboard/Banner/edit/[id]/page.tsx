"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";


export default function BannerEditPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [originalImage, setOriginalImage] = useState<string>("");
  const [oldImage, setOldImage] = useState<string>("");
  const [id, setId] = useState(0);

  useEffect(() => {
    const generateId = async () => {
        const res = await axios.post(`/api/generate-id`, {
            id: decodeURIComponent(params.id),
            action: "unmask",
        });
        setId(Number(res.data.unmaskedID));
    }
    generateId();
}, [params.id]);
  const { data, isLoading } = useQuery({
    queryKey: ["banner", params.id],
    enabled: !!id,
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/banner/get/${id}`);
      return response.data.result[0];
    }
  });

  useEffect(() => {
    if (data) {
      setName(data.BannerTitle);
      setMetaTitle(data.BannerText);
      setMetaDescription(data.Description);
      setMetaKeywords(data.BannerTitle);
      setOldImage(data.BannerImage);
      setOriginalImage(`${process.env.NEXT_PUBLIC_API_URL}${data.BannerImage}`);
      setPreviewImage(`${process.env.NEXT_PUBLIC_API_URL}${data.BannerImage}`);
    }
  }, [data]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setPreviewImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("bannerTitle", name);
    formData.append("bannerText", metaTitle);
    formData.append("description", metaDescription);
    
    if (image !== null) {
      formData.append("bannerImage", image);
    }
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/banner/update/${id}`, formData);
      toast.success("Banner updated successfully");
      queryClient.invalidateQueries({ queryKey: ["banner"] });
      router.push("/dashboard/Banner");
    } catch (error) {
      toast.error("Failed to update banner image");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
     <div className='flex justify-start pb-4  gap-2 w-[100%] items-center'>
            <h1 className='text-4xl font-normal'>Edit Banner Image</h1>
        </div>
        <Toaster/>
    <Card>
      {/* <CardHeader>
        <CardTitle></CardTitle>
      </CardHeader> */}
      <CardContent className="py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Input
              placeholder="Meta Title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
            />
          </div>
          <div>
            <Textarea
              placeholder="Meta Description"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
            />
          </div>
          <div>
            <Input
              placeholder="Meta Keywords"
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
            />
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Current Image:</label>
              {originalImage && (
                <img 
                  src={originalImage}
                  alt="Current" 
                  className="mt-2 max-w-xs"
                />
              )}
            </div>
            <div>
              <label className="text-sm font-medium">New Image:</label>
              <Input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
              />
              {previewImage !== originalImage && previewImage && (
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="mt-2 max-w-xs"
                />
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <Button type="submit">Update Banner Image</Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push("/dashboard/Banner")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
    </>
  );
}