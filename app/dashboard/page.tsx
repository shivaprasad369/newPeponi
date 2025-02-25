"use client"; // Add this line at the top

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, FileText, DollarSign, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthWrapper from "@/components/AuthWraper";
import axios from "axios"; // Import axios for API calls
import { useRouter } from "next/navigation";

interface Widget {
  product: number;
  user: number;
  blog: number;
  revenue: number;
}

export default function Dashboard() {
  const [value, setValue] = useState<Widget>({
    product: 0,
    user: 0,
    blog: 0,
    revenue: 0,
  });
const router= useRouter()
  // Fetch data when component mounts
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/dash`); // Replace with actual API
        setValue(response.data.result[0]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    }
    fetchData();
  }, []);
console.log(value)
  const widgets = [
    {
      title: "Total Products",
      value: value.product,
      icon: Package,
      change: "+20.1% from last month",
    },
    {
      title: "Total Users",
      value: value.user,
      icon: Users,
      change: "+18.5% from last month",
    },
    {
      title: "Total Blogs",
      value: value.blog,
      icon: FileText,
      change: "+12.3% from last month",
    },
    {
      title: "Total Revenue",
      value: `$120`, // Format revenue with commas
      icon: DollarSign,
      change: "+25.4% from last month",
    },
  ];

  return (
    <AuthWrapper>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        {/* Widgets Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {widgets.map((widget, index) => (
            <Card key={index} className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {widget.title}
                </CardTitle>
                <div className="p-2 bg-gray-100 rounded-full">
                  <widget.icon className="h-4 w-4 text-gray-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{widget.value}</div>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <svg
                    className="w-3 h-3 mr-1"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M6 2.5L9 6.5H3L6 2.5Z" fill="currentColor" />
                  </svg>
                  {widget.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <li key={item} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">New user registered</p>
                      <p className="text-xs text-gray-500">2 minutes ago</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={()=>router.push('/dashboard/products/new')} className="justify-start">
                  <Package className="mr-2 h-4 w-4" />
                  Add New Product
                </Button>
                <Button variant="outline" onClick={()=>router.push('/dashboard/user')} className="justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
                <Button variant="outline" onClick={()=>router.push('/dashboard/blogs/new')} className="justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Create Blog Post
                </Button>
                <Button variant="outline" onClick={()=>router.push('/dashboard/profile')} className="justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                 Update Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthWrapper>
  );
}
