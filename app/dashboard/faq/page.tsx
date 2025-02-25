"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DataTable } from "./data-tabel"
import { columns } from "./columns"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface FAQ {
  id: number
  question: string
  answer: string
}

export default function FAQPage() {
  const queryClient = useQueryClient()
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [isEdit, setIsEdit] = useState(false)
  const [id, setId] = useState(0)
  const [open, setOpen] = useState(false)
  const [errors, setErrors] = useState({ question: "", answer: "" });

  const { data, isLoading,refetch } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/faq`);
      return response.data.result;
    }
  });

  useEffect(() => {
    if (data && data.length > 0 && !isLoading) {
      setFaqs(data)
    }
  }, [data, isLoading])

  const validateForm = () => {
    let valid = true;
    let newErrors = { question: "", answer: "" };

    if (!question.trim()) {
      newErrors.question = "Question is required.";
      valid = false;
    }

    if (!answer.trim()) {
      newErrors.answer = "Answer is required.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/faq`, {
        question: question.trim(),
        answer: answer.trim()
      });
      if (response.status === 200) {
        toast.success("FAQ Added Successfully");
        refetch()
        resetForm();
      }
    } catch (error) {
      toast.error("Failed to add FAQ");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/faq/${id}`, {
        question: question.trim(),
        answer: answer.trim()
      });
      if (response.status === 200) {
        toast.success("FAQ Updated Successfully")
        refetch()
        resetForm();
      }
    } catch (error) {
      toast.error("Failed to update FAQ");
    }
  };

  const resetForm = () => {
    setQuestion("")
    setAnswer("")
    setIsEdit(false)
    setId(0)
    setOpen(false)
    setErrors({ question: "", answer: "" }); // Reset errors
  }

  const handleEdit = (faq: any) => {
    setIsEdit(true)
    setQuestion(faq.question)
    setAnswer(faq.answer) 
    setId(faq.id)
    setOpen(true)
  }

  const handleDelete = async(id: any) => {
    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/faq/${id.id}`);
      if (response.status === 200) {
        toast.success("FAQ Deleted Successfully")
        refetch()
      }
    } catch (error) {
      toast.error("Failed to delete FAQ");
    }
  }

  const handleDeleteEach = async (id: any) => {
    try {
      const confirm = window.confirm("Are you sure you want to delete this FAQ?");
      if (!confirm) return;
      
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/faq/${id.id}`);
      if (response.status === 200) {
        toast.success("FAQ Deleted Successfully")
        refetch()
      }
    } catch (error) {
      toast.error("Failed to delete FAQ");
    }
  } 

  return (
    <div className="space-y-6 bg-white">
      <div className="flex justify-between items-center">
        <div className='flex mt-0 justify-start px-4 gap-2 w-[100%] items-center'>
            <h1 className='text-4xl font-normal'>Manage FAQs</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setIsEdit(false); resetForm(); }}>
              Create New FAQ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEdit ? "Edit FAQ" : "Create New FAQ"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={isEdit ? handleSave : handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Question</label>
                <Input
                  placeholder="Enter FAQ question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className={errors.question ? "border-red-500" : ""}
                />
                {errors.question && <p className="text-red-500 text-sm">{errors.question}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Answer</label>
                <Textarea
                  placeholder="Enter FAQ answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={4}
                  className={errors.answer ? "border-red-500" : ""}
                />
                {errors.answer && <p className="text-red-500 text-sm">{errors.answer}</p>}
              </div>

              <Button type="submit" className="w-full">
                {isEdit ? "Save Changes" : "Create FAQ"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>FAQ List</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={faqs} 
            faq={true}
            onDelete={handleDelete} 
            onEdit={handleEdit} 
            edit={true}
            onDeleteEach={handleDeleteEach} 
          />
        </CardContent>
      </Card>
    </div>
  )
}
