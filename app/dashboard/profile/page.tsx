"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from 'js-cookie';

export default function ProfilePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const Aid = Cookies.get('Aid');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/${Aid}`)
      return response.data.result[0]
    },
  });

  useEffect(() => {
    if (data) {
      setUsername(data.username)
      setEmail(data.email)
    }
  }, [data]);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/admin/change-password/${Aid}`, {
        oldPassword: currentPassword,
        newPassword: newPassword,
        id: Aid
      });
      alert("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      alert("Failed to update password");
    }
  };

  const handleLogout = () => {
    const isConfirmed = window.confirm('Are you sure you want to log out?');
  if (!isConfirmed) return;
    localStorage.removeItem('AdminToken');
    Cookies.remove('Aid');
    router.push('/login');
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="space-y-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  value={username}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={email}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Password</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm New Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button onClick={handlePasswordChange}>Update Password</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}