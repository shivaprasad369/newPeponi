"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { useForm, Controller } from "react-hook-form";

interface Category {
  CategoryID: number;
  CategoryName: string;
}

interface SubCategory {
  SubCategoryID: number;
  CategoryName: string;
  CategoryID: number;
}

interface Attribute {
  attributeName: string;
  value: string[];
}

export default function AttributesPage() {
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [selectedSubCategory, setSelectedSubCategory] = useState<number>(0);
  const [attributes, setAttributes] = useState<Attribute[]>([{ attributeName: "", value: [''] }]);
  const router = useRouter();
  const { control, handleSubmit, formState: { errors }, setValue, getValues } = useForm({
    defaultValues: {
      categoryId: 0,
      subCategoryId: 0,
      attributes: [{ attributeName: "", value: [''] }],
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/category`);
      return response.data.result;
    },
  });

  const { data: subCategories } = useQuery<SubCategory[]>({
    queryKey: ["subcategories", selectedCategory],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/category/update/get?id=${selectedCategory}`);
      return response.data.result;
    },
    enabled: !!selectedCategory,
  });

  const handleAddAttribute = () => {
    setAttributes([...attributes, { attributeName: "", value: [''] }]);
    setValue("attributes", [...getValues("attributes"), { attributeName: "", value: [''] }]);
  };

  const handleRemoveAttribute = (attributeIndex: number) => {
    const newAttributes = attributes.filter((_, index) => index !== attributeIndex);
    setAttributes(newAttributes);
    setValue('attributes', newAttributes);
  };

  const handleAddValue = (attributeIndex: number) => {
    const newAttributes = [...attributes];
    newAttributes[attributeIndex].value.push("");
    setAttributes(newAttributes);
    setValue('attributes', newAttributes);
  };

  const handleRemoveValue = (attributeIndex: number, valueIndex: number) => {
    const newAttributes = [...attributes];
    newAttributes[attributeIndex].value = newAttributes[attributeIndex].value.filter(
      (_, index) => index !== valueIndex
    );
    setAttributes(newAttributes);
    setValue('attributes', newAttributes);
  };

  const onSubmit = async (data: any) => {
    const { attributes } = data;
    const Attributes = Object.values(attributes).map((item) => ({
      attributeName: item.attributeName,
      values: item.value,
    }));

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/attribute`, { Attributes });
      if (response.status === 200) {
        setAttributes([{ attributeName: "", value: [''] }]);
        setSelectedCategory(0);
        setSelectedSubCategory(0);
        toast.success("Attributes added successfully");
        router.push("/dashboard/attributes");
      }
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.message || 'Something went wrong!');
      } else {
        toast.error('An unexpected error occurred. Please try again later.');
      }
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex mt-2 justify-start pb-4 gap-2 w-[100%] items-center">
        <h1 className="text-4xl font-normal">Add New Attributes</h1>
      </div>
      <Toaster />
      <Card>
        <CardContent className="space-y-6 pt-4">
          <div className="space-y-4">
            {attributes.map((attribute, attributeIndex) => (
              <Card key={attributeIndex}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    {/* Attribute Name Input */}
                    <Controller
                      control={control}
                      name={`attributes[${attributeIndex}].attributeName`}
                      defaultValue={attribute.attributeName}
                      rules={{ required: "Attribute name is required" }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Attribute Name"
                          className={errors?.attributes?.[attributeIndex]?.attributeName ? 'border-red-500' : ''}
                        />
                      )}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveAttribute(attributeIndex)}
                    >
                      Remove Attribute
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {/* Attribute Values */}
                    {attribute.value.map((value, valueIndex) => (
                      <div key={valueIndex} className="flex items-center gap-2">
                        <Controller
                          control={control}
                          name={`attributes[${attributeIndex}].value[${valueIndex}]`}
                          defaultValue={value}
                          rules={{ required: "Value is required" }}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="Value"
                              className={errors?.attributes?.[attributeIndex]?.value?.[valueIndex] ? 'border-red-500' : ''}
                            />
                          )}
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleAddValue(attributeIndex)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        {valueIndex > 0 && (
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleRemoveValue(attributeIndex, valueIndex)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-4">
            <Button onClick={handleAddAttribute}>Add Attribute</Button>
            <Button onClick={handleSubmit(onSubmit)}>Submit</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/attributes")}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
