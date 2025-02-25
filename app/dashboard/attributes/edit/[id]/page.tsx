"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const formSchema = z.object({
  attributeName: z.string().min(2, "Attribute name must be at least 2 characters"),
  values: z
    .array(z.object({ 
      value: z.string().min(1, "Value cannot be empty"), 
      id: z.number() 
    }))
    .min(1, "At least one value is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditAttributePage() {
  const params = useParams();
  const router = useRouter();
  const [id, setId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      attributeName: "",
      values: [{ value: "", id: 0 }],
    },
    mode: "onChange",
  });

  useEffect(() => {
    const generateId = async () => {
      const res = await axios.post(`/api/generate-id`, {
        id: decodeURIComponent(params.id),
        action: "unmask",
      });
      setId(Number(res.data.unmaskedID));
    };
    generateId();
  }, [params.id]);

  useEffect(() => {
    const fetchAttribute = async () => {
      if (!id) return;
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/attribute/${id}`
        );
        const attribute = response?.data[0]?.attributes[0];
        if (attribute) {
          setValue("attributeName", attribute.attributeName);
          setValue(
            "values",
            attribute.values.map((v: any) => ({ id: v.id, value: v.value }))
          );
        }
      } catch (error) {
        toast.error("Error fetching attribute");
      } finally {
        setLoading(false);
      }
    };

    fetchAttribute();
  }, [id, setValue]);

  const onSubmit = async (values: FormValues) => {
    try {
      const data = [
        {
          ...values,
          attributeId: Number(id),
        },
      ];

      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/attribute`, {
        Attributes: data,
      });

      toast.success("Attribute updated successfully");
      router.push("/dashboard/attributes");
    } catch (error) {
      toast.error("Error updating attribute");
    }
  };

  const addValue = () => {
    const currentValues = getValues("values");
    setValue("values", [...currentValues, { value: "", id: 0 }]);
  };

  const removeValue = (index: number) => {
    const currentValues = getValues("values");
    if (currentValues.length > 1) {
      setValue(
        "values",
        currentValues.filter((_, i) => i !== index)
      );
    } else {
      toast.error("At least one value is required");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Edit Attribute</CardTitle>
        </CardHeader>
        <CardContent>
         
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FormItem>
                <FormLabel>Attribute Name</FormLabel>
                <FormControl>
                  <Input 
                    {...register("attributeName",{required:'Attribute Name is Required'})} 
                    placeholder="Enter attribute name"
                  />
                </FormControl>
                {errors.attributeName && (
                  <FormMessage>{errors.attributeName.message}</FormMessage>
                )}
              </FormItem>

              {watch("values").map((_, index) => (
                <FormItem key={index}>
                  <FormLabel>Value {index + 1}</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input 
                        {...register(`values.${index}.value` as const, {required:'Values Is required'})} 
                        placeholder="Enter value"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeValue(index)}
                    >
                      Remove
                    </Button>
                  </div>
                  {errors.values && errors.values[index]?.value && (
                    <FormMessage>{errors.values[index]?.value?.message}</FormMessage>
                  )}
                </FormItem>
              ))}

              <Button type="button" variant="outline" onClick={addValue}>
                Add Value
              </Button>

              <div className="flex gap-2">
                <Button type="submit">Save Changes</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/attributes")}
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
