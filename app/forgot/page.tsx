"use client";
import "../globals.css"
// import type { Metadata } from "next"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { ForgotPasswordForm } from "@/components/forgot-password-form"
import Image from "next/image";
// export const metadata: Metadata = {
//   title: "Forgot Password",
//   description: "Enter your email to reset your password",
// }

export default function ForgotPasswordPage() {
  return (
    <>
    <head>
      <title>Forgot Password</title>
      <meta name="description" content="Enter your email to reset your password" />
    </head>
    <body>

    <div className=" flex h-screen w-screen flex-col items-center justify-center bg-gray-50">
      <Link
        href="/login" 
        className={cn(buttonVariants({ variant: "ghost" }), "absolute left-4 top-4 md:left-8 md:top-8")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to login
      </Link>
      <Image className="mb-5 rounded overflow-hidden" src="logos1.png" alt="Peponi"  width={150} height={100} />
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] bg-white p-6 rounded-lg shadow-md">
         
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Forgot your password?</h1>
          <p className="text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
    </body>
    </>
  )
}
