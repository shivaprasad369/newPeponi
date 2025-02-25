// import type { Metadata } from "next"
"use client";
import "../globals.css"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Image from "next/image";
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { ResetPasswordForm } from "@/components/reset-password-form"

// export const metadata: Metadata = {
//   title: "Reset Password",
//   description: "Enter your new password to reset your account",
// }

export default function ResetPasswordPage() {
  return (
    <>
    <head>
      <title>Reset Password</title>
      <meta name="description" content="Enter your new password to reset your account" />
    </head>
    <body>
    <div className=" flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/login"
        className={cn(buttonVariants({ variant: "ghost" }), "absolute left-4 top-4 md:left-8 md:top-8")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to login
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
         <Image className="mb-5 rounded overflow-hidden" src="logos1.png" alt="Peponi"  width={150} height={100} />
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
          <p className="text-sm text-muted-foreground">Enter your new password below to reset your account.</p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
    </body>
    </>
  )
}

