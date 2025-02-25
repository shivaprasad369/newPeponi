"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "./Datatabel";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import ExcelJS from 'exceljs';
import { toast } from "sonner";

interface Newsletter {
  id: number;
  email: string;
  created_at: string;
}
const columns: ColumnDef<Newsletter>[] = [
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
  },
  {
    header:' '
  }
];
export default function NewsletterPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["newsletters"],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/newsletter`);
      return response.data.result;
    }
  });
  useEffect(() => {
    if (data && data.length > 0 && !isLoading) {
      setNewsletters(data);
    }
  }, [data, isLoading]);
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Newsletter Subscribers');
    worksheet.columns = [
      { header: 'Email', key: 'email', width: 30 }
    ];
    newsletters.forEach(subscriber => {
      worksheet.addRow({ email: subscriber.email });
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'newsletter_subscribers.xlsx';
    link.click();
    window.URL.revokeObjectURL(url);
  };
  const handleDeleteEach = async (id: any) => {
    try {
        const confirm = window.confirm('Are you sure you want to delete this subscriber?');
        if (!confirm) return;
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/newsletter/${id.id}`);
      if (response.status === 200) {
        toast.success("Subscriber Deleted Successfully");
        queryClient.invalidateQueries({ queryKey: ["newsletters"] });
        setNewsletters(newsletters.filter((newsletter) => newsletter.id !== id));
      }
    } catch (error) {
      toast.error("Failed to delete subscriber");
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
      <div className='flex mt-0 justify-start px-4  gap-2 w-[100%] items-center'>
            <h1 className='text-4xl font-normal'>Manage Newsletter</h1>
        </div>
        <Button onClick={exportToExcel}>
          Export to Excel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscribers List</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={newsletters}
            edit={false}
            onDeleteEach={handleDeleteEach}
            onDelete={() => {}}
            onEdit={() => {}}
          />
        </CardContent>
      </Card>
    </div>
  );
}
