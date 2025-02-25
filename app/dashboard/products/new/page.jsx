"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Controller, useForm } from "react-hook-form";

import { useRouter } from "next/navigation";
import TextEditor from "@/components/ui/Editor";
import FileDropzone from "@/components/ui/Dropzone";
import toast, { Toaster } from "react-hot-toast";

export default function NewProductPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [attributes, setAttributes] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [discountPrice, setDiscountPrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [attributeValues, setAttributeValues] = useState({});
  const [errMessage,setErrMessage]=useState({
    description:'',
    image:''
  })
  const [isLoading,setIsLoading]=useState(false)
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
 
  })

  const price = watch("price");
  const discountPercentage = watch("discountPercentage");

  useEffect(() => {
    if (price && discountPercentage) {
      const discountAmount = (price * discountPercentage) / 100;
      setDiscountPrice(discountAmount);
      setSellingPrice(price - discountAmount);
    }
  }, [price, discountPercentage]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/category`);
        return response.data.result;
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to fetch categories");
        return [];
      }
    },
  });

  const { data: subCategories } = useQuery({
    queryKey: ["subcategories", selectedCategory],
    enabled: !!selectedCategory,
    queryFn: async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/category/update/get?id=${selectedCategory}`);
        return response.data.result;
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        toast.error("Failed to fetch subcategories");
        return [];
      }
    },
  });

  const { data: categoryAttributes } = useQuery({
    queryKey: ["attributes"],
   
    queryFn: async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/product/attributes`);
        setAttributes(response.data || []);
        return response.data || [];
      } catch (error) {
        console.error("Error fetching attributes:", error);
        toast.error("Failed to fetch attributes");
        return [];
      }
    },
  });

  const onSubmit = async (data) => {
    try {
      if (!data.image) {
        setError("image", { type: "required", message: "Product image is required" });
        return;
      }
      setIsLoading(true)
      console.log("Form data before processing:", data);
      console.log(attributeValues);
      
     
      const formData = new FormData();
      formData.append("productName", data.name);
      formData.append("metaTitle", data.metaTitle || "");
      formData.append("metaDescription", data.metaDescription || "");
      formData.append("metaKeyword", data.metaKeywords || "");
      formData.append("productPrice", data.price);
      formData.append("discountPercentage", data.discountPercentage);
      formData.append("discountPrice", discountPrice);
      formData.append("sellingPrice", sellingPrice);
      formData.append("cashPrice", sellingPrice);
      formData.append("categoryId", selectedCategory);
      formData.append("subCategoryId", selectedSubCategory);
      formData.append("subCategoryLv2Id", 0);
      // formDataToSend.append("description", );
      formData.append("productDescription", data.content);
      formData.append("Stock",data.stock)

      const attributeValuess = {};
      Object.keys(attributeValues).forEach((attr) => {
        const attributeValue = attributeValues[attr];
        if (attributeValue) {
          attributeValuess[attr] = attributeValue;
        }
      });
      formData.append("attributeValue", JSON.stringify(attributeValuess));
      // formDataToSend.append("Image", data.image);
      if (data.image) formData.append("productImage", data.image);
      files.forEach((img, index) => formData.append("ProductImages", img));

      console.log("Final FormData object:", Object.fromEntries(formData));
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/product`,
        formData,
        
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data) {
        toast.success("Product created successfully");
        router.push("/dashboard/products");
      }
      setIsLoading(false)
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast.error("Error creating product.");
      setIsLoading(false)
    }
  };

  const handleGetImages=(e)=>{
    const value=e.target.files[0]
    if(
      !value
    ){
      setErrMessage({...errMessage,image:'Image is required'})
    }
    setMainImage(e.target.files[0])

  }
  return (
    <div className="container mx-auto  h-full overflow-hidden">
      <Toaster/>
      <div className='flex mt-2 justify-start pb-4  gap-2 w-[100%] items-center'>
            <h1 className='text-4xl font-normal'>Add New Product</h1>
        </div>
      <Card className="py-6">
        {/* <CardHeader>
          <CardTitle>Add New Product</CardTitle>
        </CardHeader> */}
        <CardContent className="overflow-y-auto max-h-[calc(100vh-200px)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" {...register("name", { required: true })} />
                {errors.name && <span className="text-red-500">This field is required</span>}
              </div>

              

              <div className="space-y-2">
                <Label htmlFor="price">Product Price *</Label>
                <Input type="number" id="price" {...register("price", { required: true })} />
                {errors.price && <span className="text-red-500">This field is required</span>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountPercentage">Discount Percentage *</Label>
                <Input type="number" id="discountPercentage" {...register("discountPercentage", { required: true })} />
                {errors.discountPercentage && <span className="text-red-500">This field is required</span>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountPrice">Discount Price</Label>
                <Input type="number" id="discountPrice" value={discountPrice} readOnly />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling Price</Label>
                <Input type="number" id="sellingPrice" value={sellingPrice} readOnly />
              </div>

            </div>
            <div className="space-y-4">
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Product Category *</Label>
                <Controller
                  name="Category"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        setSelectedCategory(value)
                      }}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.CategoryID} value={category.CategoryID.toString()}>
                            {category.CategoryName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.Category && <span className="text-red-500">{errors.Category.message}</span>}
              </div>

              <div className="space-y-2">
                <Label>Product Sub Category *</Label>
                <Select
                  onValueChange={setSelectedSubCategory}
                  value={selectedSubCategory}
                  disabled={!selectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategories?.map((subCategory) => (
                      <SelectItem key={subCategory.CategoryID} value={subCategory.CategoryID.toString()}>
                        {subCategory.CategoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            </div>

            {categoryAttributes?.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium">Product Attributes</h3>
                <div className="grid grid-cols-2 gap-4">
                  {categoryAttributes.map((attribute) => (
                    <div key={attribute.id} className="space-y-2">
                      <Label>{attribute.attribute_name}</Label>
                      <Select onValueChange={(value) => setAttributeValues({ ...attributeValues, [attribute.attribute_name]: value })} 
                      {...register(attribute.attribute_name)}>
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${attribute.attribute_name}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {attribute.value.map((value) => (
                            <SelectItem key={value.valueId} value={value.valueId.toString()}>
                              {value.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {errors[attribute.attribute_name] && (
                        <span className="text-red-500">This field is required</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
              <div className="space-y-2">
  <Label htmlFor="stock">Stock</Label>
  <Input
    type="number"
    id="stock"
    {...register("stock", {
      required: "Stock is required",
      min: { value: 0, message: "Stock cannot be less than 0" },
    })}
    onKeyDown={(e) => {
      if (e.key === "-" || e.key === "e") e.preventDefault(); // Prevent negative & non-numeric input
    }}
  />
  {errors.stock && <span className="text-red-500">{errors.stock.message}</span>}
</div>

              <div className="space-y-4">
              <h3 className="font-medium">Meta Details</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input id="metaTitle" {...register("metaTitle")} />
              </div>
           

            <div className="space-y-2">
              <Label htmlFor="metaKeywords">Meta Keywords</Label>
              <Input id="metaKeywords" {...register("metaKeywords")} />
            </div>
</div>
<div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea id="metaDescription" {...register("metaDescription")} />
            </div>
</div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              {/* <TextEditor value={description} onChange={setDescription} />
              {errMessage.description && <span className="text-red-500">{errMessage.description}</span>} */}
              <Controller
                name="content"
                control={control}
                rules={{ required: "Product description is required" }}
                render={({ field }) => (
                  <TextEditor
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      if (!value.trim()) {
                        setError("content", { type: "required", message: "Product description is required" });
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
              <Label>Product Image *</Label>
              {/* <Input
                type="file"
                onChange={handleGetImages}
                accept="image/*"

               
                
              />
              {errMessage.image && <span className="text-red-500 text-md">{errMessage.image}</span> } */}
             <Input
                id="image"
                type="file"
                accept="image/*"
                // rules={{ required: "Blog content is required" }}
                disabled={isSubmitting}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setValue("image", file);
                  if (!file) {
                    setError("image", { type: "required", message: "Product image is required" });
                  } else {
                    clearErrors("image");
                  }
                }}
              />
              {errors.image && <p className="text-red-500 text-sm">{errors.image.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Additional Product Images</Label>
              <FileDropzone setFiles={setFiles} files={files} />
            </div>
            <div className="flex gap-4">
           
            <Button type="submit" disabled={isLoading}
            > {isLoading?
              'Loading..'
              
              :'Create Product'}</Button>
           <Button
                 type="button"
                 variant="outline"
                 onClick={() => router.push("/dashboard/products")}
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
