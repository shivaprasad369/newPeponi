"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import TextEditor from "@/components/ui/Editor";
import FileDropzone from "@/components/ui/Dropzone";
import ReactQuill from "react-quill";
import toast, { Toaster } from "react-hot-toast";

export default function NewProductPage() {
    const params = useParams();
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [selectedOldSubCategory, setSelectedOldSubCategory] = useState(0);
    const [attributes, setAttributes] = useState([]);
    const [mainImage, setMainImage] = useState(null);
    const [discountPrice, setDiscountPrice] = useState(0);
    const [sellingPrice, setSellingPrice] = useState(0);
    const [attributeValues, setAttributeValues] = useState({});
    const [id, setId] = useState(0);
    const [description, setDescription] = useState("");
    const [files, setFiles] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [newAttributeValues, setNewAttributeValues] = useState({});
    const [newMainImage, setNewMainImage] = useState('');
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue
    } = useForm();
    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            ["clean"], // Remove formatting
        ],
    };

    const formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "list",
        "bullet",
        "link",
        "image",
    ];
    const price = watch("price");
    const discountPercentage = watch("discountPercentage");

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
    const { data: product } = useQuery({
        queryKey: ["product", id],
        enabled: !!id,
        queryFn: async () => {
            if (id) {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/productimage/${id}`);
                return response.data;
            }
        },
    });

    useEffect(() => {
        if (product) {
            // Pre-fill basic fields
            setValue('name', product.ProductName);
            setValue('metaTitle', product.MetaTitle || "");
            setValue('metaDescription', product.metaDescription || "");
            setValue('metaKeywords', product.MetaKeyWords || "");
            setValue('price', product.ProductPrice);
            setValue('discountPercentage', product.DiscountPercentage);
            setValue('stock', product.Stock)
            setDescription(product.Description);
            setSelectedCategory(product.CategoryID.toString());
            setSelectedSubCategory(product.SubCategoryIDone.toString());
            setSelectedOldSubCategory(product.SubCategoryIDone);

            // Set main image and additional images
            setMainImage(product.Image);
            //   setFiles(product.ProductImages.map(img => img.ImageURL));
            setNewFiles(product.ProductImages);

            // Map attribute values to the form fields
            const initialAttributeValues = {};
            product.Attributes.forEach((attribute) => {
                initialAttributeValues[attribute.AttributeName] = attribute.AttributeID ? attribute.AttributeID.toString() : "";  // Set value instead of ID
            });
            setNewAttributeValues({
                attributeValues: initialAttributeValues,
                subCategoryId: Number(product.SubCategoryIDone),
                categoryId: Number(product.CategoryID),
            });
            setAttributeValues(initialAttributeValues);
        }
    }, [product]);
    useEffect(() => {
        if (selectedOldSubCategory) {
            setSelectedSubCategory(selectedOldSubCategory.toString());
        }
    }, [selectedOldSubCategory]);


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
                toast.error("Failed to fetch attributes");
                return [];
            }
        },
    });
    useEffect(() => {
        if (
            newAttributeValues.categoryId !== Number(selectedCategory) ||
            newAttributeValues.subCategoryId !== Number(selectedSubCategory)
        ) {
            setNewAttributeValues((prev) => ({
                ...prev,
                subCategoryId: selectedSubCategory,
                categoryId: selectedCategory,
            }));

            if (categoryAttributes?.length > 0) {

                setAttributeValues({});

            }
        }
    }, [selectedSubCategory, selectedCategory, categoryAttributes]);


    const handleDeleteImages = async (imgId, ProductImage) => {
        const confirm = window.confirm("Are you sure you want to delete this image?");
        if (!confirm) {
            return;
        }
        const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/productimage/${imgId}`, { data: { ProductImage: JSON.stringify(ProductImage) } });
        if (response.data) {
            toast.success("Image deleted successfully");
            setNewFiles(newFiles.filter(file => file.ImageID !== imgId));
        }
    }


    const onSubmit = async (data) => {
        try {

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
            formData.append('stock', data.stock)
            formData.append("subCategoryId", selectedSubCategory);
            formData.append("subCategoryLv2Id", 0);
            formData.append("productDescription", description);
            formData.append("attributeValue", JSON.stringify(attributeValues));

            if (newMainImage) {
                console.log(newMainImage);
                formData.append("newImage", newMainImage);
            }
            if (files.length > 0) {
                files.forEach((file) => {
                    formData.append('ProductImages', file);
                });
            }

            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/product/${id}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (response.data) {
                toast.success("Product created successfully");
                router.push("/dashboard/products");
            }
        } catch (error) {

            toast.error("Error creating product.");
        }
    };

    return (
        <div className="container mx-auto  h-full overflow-hidden">
            <Toaster/>
            <div className='flex mt-2 justify-start pb-4  gap-2 w-[100%] items-center'>
                <h1 className='text-4xl font-normal'>Edit Product</h1>
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

                            <div className="space-y-2">
                                <Label>Product Category *</Label>
                                <Select onValueChange={setSelectedCategory} value={selectedCategory}>
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
                            </div>

                            <div className="space-y-2">
                                <Label>Product Sub Category *</Label>
                                <Select
                                    onValueChange={(value) => {
                                        setSelectedSubCategory(value);  // Update selectedSubCategory directly
                                    }}
                                    value={selectedSubCategory}  // Use selectedSubCategory directly here
                                    disabled={!selectedCategory}  // Disable subcategory dropdown if no category is selected
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

                        {categoryAttributes?.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="font-medium">Category Attributes</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {categoryAttributes.map((attribute) => (
                                        <div key={attribute.id} className="space-y-2">
                                            <Label>{attribute.attribute_name}</Label>
                                            <Select
                                                value={attributeValues[attribute.attribute_name] || ""}
                                                onValueChange={(value) => {
                                                    setAttributeValues((prev) => ({
                                                        ...prev,
                                                        [attribute.attribute_name]: value,
                                                    }));
                                                    setNewAttributeValues((prev) => ({
                                                        ...prev,
                                                        subCategoryId: selectedSubCategory,
                                                    }));
                                                }}
                                                {...register(attribute.attribute_name)}
                                            >


                                                <SelectTrigger>
                                                    <SelectValue placeholder={`Select ${attribute.attribute_name}`} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {attribute.value && attribute.value.map((value) => (
                                                        value && value.valueId !== null && value.value !== null ? (
                                                            <SelectItem key={value.valueId} value={value.valueId.toString()}>
                                                                {value.value}
                                                            </SelectItem>
                                                        ) : null // Skip invalid values
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
                            {/* {errors.name && <span className="text-red-500">This field is required</span>} */}
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="metaTitle">Meta Title</Label>
                                <Input id="metaTitle" {...register("metaTitle")} />
                            </div>


                            <div className="space-y-2">
                                <Label htmlFor="metaKeywords">Meta Keywords</Label>
                                <Input id="metaKeywords" {...register("metaKeywords")} />
                            </div></div>
                        <div className="space-y-2">
                            <Label htmlFor="metaDescription">Meta Description</Label>
                            <Textarea id="metaDescription" {...register("metaDescription")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <div className="text-editor w-[100%]">
                                <ReactQuill
                                    theme="snow"
                                    value={description}
                                    onChange={(content) => setDescription(content)}
                                    modules={modules}
                                    className="w-[100%] h-[20rem] mb-[3rem]"

                                    formats={formats}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Product Image *</Label>
                            <Input
                                type="file"
                                onChange={(e) => setNewMainImage(e.target.files[0])}
                                accept="image/*"

                            />
                        </div>
                        {mainImage && (
                            <div className="space-y-2">
                                <Label>Main Old Image Preview</Label>
                                <div className="flex w-[20%]  border-2 border-gray-300 p-1  justify-center items-center">
                                    <img src={`${process.env.NEXT_PUBLIC_API_URL}/${mainImage}`} alt="Main Image Preview" />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Additional Product Images</Label>
                            <FileDropzone setFiles={setFiles} handleDeleteImages={handleDeleteImages} files={files} setNewFiles={setNewFiles} newFiles={newFiles} />
                        </div>
                        <div className="flex gap-4">

                            <Button type="submit">Save Changes</Button>
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
