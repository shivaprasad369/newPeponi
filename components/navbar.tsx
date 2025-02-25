"use client"

import { useState } from "react"
import LogoutDialog from "./LogoutDialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, LogOut, User, Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { SidebarTrigger } from "./ui/sidebar"

export function Navbar() {
  const router = useRouter();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("AdminToken");
    router.push("/login");
  }

  return (
    <>
      <header className="sticky top-0 z-30 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-end h-12 px-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-gray-400  rounded-full relative">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>SA</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Superadmin</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowLogoutDialog(true)} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <LogoutDialog 
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={() => {
          handleLogout();
          setShowLogoutDialog(false);
        }}
      />
    </>
  )
}

