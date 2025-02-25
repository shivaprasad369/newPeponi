import { useState, useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface EditCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category;
  data: any[];
}

interface Category {
  attributeId: number;
  attributeName: string;
  values: Array<{ id: number; value: string }>;
}

export function EditCategoryDialog({ open, onOpenChange, category, data }: EditCategoryDialogProps) {
  const [attributes, setAttributes] = useState<any[] | null[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (data) {
      // Ensure `data` is always an array
      setAttributes(Array.isArray(data) ? data : [data]);
    }
  }, [data]);

  const addAttribute = () => {
    setAttributes([
      ...attributes,
      {attributeName: "", values: [{  value: "" }] },
    ]);
  };

  const removeAttribute = async (id: number, index: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this attribute?");
    if (!confirmDelete) return;
    console.log(id)
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/attribute/${id}`);
      setAttributes(attributes.filter((_, i) => i !== index));
      queryClient.invalidateQueries({ queryKey: ["attribute"] });
    } catch (error) {
      console.error("Delete attribute error:", error);
      toast.error("Failed to delete attribute. Please try again.");
    }
  };

  const addValue = (attributeIndex: number) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[attributeIndex].values.push({  value: "" });
    setAttributes(updatedAttributes);
  };

  const removeValue = (attributeIndex: number, valueIndex: number) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[attributeIndex].values = updatedAttributes[attributeIndex].values.filter(
      (_, i:number) => i !== valueIndex
    );
    setAttributes(updatedAttributes);
  };

  const updateAttributeName = (index: number, name: string) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index].attributeName = name;
    setAttributes(updatedAttributes);
  };

  const updateAttributeValue = (attributeIndex: number, valueIndex: number, value: string) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[attributeIndex].values[valueIndex].value = value;
    setAttributes(updatedAttributes);
  };
console.log(attributes)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedAttributes = attributes.map((item) => ({
      attributeId: item.attribute_id,
      attributeName: item.attributeName,
      values: item.values,
    }));

    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/attribute`, {
        Attributes: updatedAttributes,
      });

      if (response.status === 200) {
        queryClient.invalidateQueries({ queryKey: ["attribute"] });
        onOpenChange(false);
        toast.success(response.data.message);
        // setAttributes([]); // Reset attributes to category data
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[80%] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Attributes</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Attributes Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Attributes</h3>
            </div>

            {attributes.map((attribute, attributeIndex) => (
              <div key={attribute.attribute_id} className="space-y-4 p-4 border rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Attribute <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={attribute.attributeName}
                      onChange={(e) => updateAttributeName(attributeIndex, e.target.value)}
                      placeholder="Enter attribute name"
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeAttribute(attribute.attribute_id, attributeIndex)}
                    >
                      Remove Attribute
                    </Button>
                  </div>
                </div>

                {/* Attribute Values */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Values <span className="text-red-500">*</span>
                  </label>
                  {attribute.values.map((value:any, valueIndex:number) => (
                    <div key={value.id} className="flex gap-2">
                      <Input
                        value={value.value}
                        onChange={(e) =>
                          updateAttributeValue(attributeIndex, valueIndex, e.target.value)
                        }
                        placeholder="Enter value"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeValue(attributeIndex, valueIndex)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addValue(attributeIndex)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Value
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" onClick={addAttribute} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Attribute
            </Button>
          </div>

          {/* Submit Section */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
