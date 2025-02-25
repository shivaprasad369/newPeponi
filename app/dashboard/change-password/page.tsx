"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";

type PasswordFormData = {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
};

export default function ChangePasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, reset, formState: { errors }, watch } = useForm<PasswordFormData>();

    const onSubmit = async (data: PasswordFormData) => {
        if (data.newPassword !== data.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        setIsLoading(true);
        const aid = Cookies.get('Aid');
        try {
            const token = localStorage.getItem('AdminToken');
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/change-password/${aid}`,
                { 
                    oldPassword: data.oldPassword,
                    newPassword: data.newPassword,
                    id: aid
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                alert("Password changed successfully!");
                reset();
            }
        } catch (error) {
            console.error('Change password error:', error);
            alert("Failed to change password. Please try again.");
        }

        setIsLoading(false);
    };

    return (
        <div className="container mx-auto py-10">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="oldPassword">Current Password</Label>
                            <Input
                                id="oldPassword"
                                type="password"
                                {...register("oldPassword", { required: "Current password is required" })}
                            />
                            {errors.oldPassword && (
                                <p className="text-red-500 text-sm">{errors.oldPassword.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                {...register("newPassword", { 
                                    required: "New password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters"
                                    }
                                })}
                            />
                            {errors.newPassword && (
                                <p className="text-red-500 text-sm">{errors.newPassword.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                {...register("confirmPassword", {
                                    required: "Please confirm your password",
                                    validate: (value) => 
                                        value === watch("newPassword") || "Passwords do not match"
                                })}
                            />
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
                            )}
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Change Password
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}