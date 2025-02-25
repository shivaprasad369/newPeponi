"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import toast, { ToastBar, Toaster } from "react-hot-toast"


const formSchema = z
  .object({
    password: z.string().min(8, {
      message: "Password must be at least 8 characters long.",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export function ResetPasswordForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    // Assuming you have the reset token in the query params
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token'); // Get the token from the URL

    if (!token) {
      toast.success(
         "Invalid or expired token.",
      )
      setIsLoading(false)
      return
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forgot-password/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,        // The reset token from the URL
          newPassword: values.password, // The new password from the form
        }),
      })

      const data = await response.json()

      if (response.status===200) {
        toast.success(
         "Password reset successful",
      
        )
        // Redirect to login page
        router.push("/login")
      } else {
        ToastBar.error("An error occurred. Please try again later.")
      }
    } catch (error) {
      console.error("Error resetting password:", error)
      toast.error("An error occurred while resetting your password. Please try again.",)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
     <Toaster />
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter your new password" {...field} />
              </FormControl>
              <FormDescription>Password must be at least 8 characters long.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Confirm your new password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </Form>
    </>
  )
}
