"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { Input } from "@/components/ui/input"
import dynamic from "next/dynamic"
import "react-quill/dist/quill.snow.css"
import toast, { Toaster } from "react-hot-toast"

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })

export default function CMSPage() {
  const [selectedPage, setSelectedPage] = useState("")
  const [content, setContent] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newPage, setNewPage] = useState("")
  const queryClient = useQueryClient()

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  }

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
  ]

  const pages = [
    { value: "about", label: "About Page" },
    { value: "privacy", label: "Privacy Policy" },
    { value: "terms", label: "Terms & Conditions" },
    { value: "contact", label: "Contact Page" }
  ]
  const { data, isLoading, error } = useQuery({
    queryKey: ["cms"],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/cms`)
      return res.data.result
    },
  })
  useEffect(() => {
    const fetchContent = async () => {
      if (selectedPage) {
        try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/cms/${selectedPage}`)
          if (res.data.result && res.data.result[0]) {
            setContent(res.data.result[0].content)
          }
        } catch (error) {
          console.error("Error fetching content:", error)
          setContent("")
        }
      } else {
        setContent("")
      }
    }
    fetchContent()
  }, [selectedPage])

  const handleSubmit = async () => {
    try {
      if (!newPage) return

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/cms`, {
        header: newPage
      })
      
      setNewPage("")
      setIsDialogOpen(false)
      setContent("")
      setSelectedPage("")
      queryClient.invalidateQueries({ queryKey: ["cms"] })
    } catch (error) {
      console.error("Error saving content:", error)
    }
  }

  const handleSaveContent = async () => {
    try {
      if (!selectedPage || !content) return

      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/cms/${selectedPage}`, {
        content
      })
      
      setContent("")
      setSelectedPage("")
      toast.success("Content saved successfully")
    } catch (error) {
      console.error("Error saving content:", error)
      toast.error("Error saving content")
    }
  }

  const handleClear = () => {
    setContent("")
    setSelectedPage("")
  }

  return (
    <div className="container mx-auto px-6 space-y-6">
      <Toaster />
      <div className='flex mt-0 justify-start px-4  gap-2 w-[100%] items-center'>
            <h1 className='text-4xl font-normal'>Manage CMS</h1>
        </div>
      <Card>
        {/* <CardHeader>
          <div className="flex justify-between items-center"> */}
            {/* <CardTitle>Content Management System</CardTitle> */}
            {/* <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add New Page</Button>
              </DialogTrigger>
              <DialogContent className="max-w-[800px]">
                <DialogHeader>
                  <DialogTitle>Add New Page</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Enter page name"
                    value={newPage}
                    onChange={(e) => setNewPage(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit}>Add Page</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog> */}
          {/* </div>
        </CardHeader> */}
        <CardContent>
          <div className="flex w-full pt-6 flex-col items-start justify-start gap-4">
            <Select value={selectedPage} onValueChange={setSelectedPage}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a page to edit" />
              </SelectTrigger>
              <SelectContent>
                {data?.map((item: any) => (
                  <SelectItem key={item.id} value={item.id} className='capitalize'>{item.header}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPage && <div className="text-editor w-[100%]">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                className="w-[100%] h-[20rem] mb-[3rem]"
                formats={formats}
              />
            </div>}
            <div className="w-full flex justify-between gap-2">
              <Button variant="outline" onClick={handleClear}>Clear</Button>
              <Button onClick={handleSaveContent} disabled={!content}>Save Changes</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}