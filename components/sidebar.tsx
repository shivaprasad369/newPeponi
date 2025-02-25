"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, ListTree, FileText, Users, Layers, BookOpen } from 'lucide-react'

const sidebarItems = [
  {
    category: "DASHBOARDS",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    category: "MANAGEMENT",
    items: [
      { name: "CMS", href: "/dashboard/cms", icon: FileText },
      { name: "Manage Contacts", href: "/dashboard/contact", icon: FileText },

      { name: "Blogs", href: "/dashboard/blogs", icon: FileText },
      { name: "FAQ's", href: "/dashboard/faq", icon: FileText },
      { name: "Newsletter", href: "/dashboard/newsletter", icon: FileText },
      { name: "Users", href: "/dashboard/user", icon: Users },
      { name: "Orders", href: "/dashboard/order", icon: FileText },

      { name: "Categories", href: "/dashboard/category", icon: ListTree },
      { name: "Sub Categories", href: "/dashboard/sub-category", icon: ListTree },
      { name: "Attributes", href: "/dashboard/attributes", icon: ListTree },
      { name: "Products", href: "/dashboard/products", icon: Package },
      { name: "Manage Reviews", href: "/dashboard/review", icon: Layers },
      { name: "Manage Featured Products", href: "/dashboard/feature-products", icon: Layers },
      { name: "Manage Banner Images ", href: "/dashboard/Banner", icon: Layers },


      // { name: "Pages", href: "/dashboard/pages", icon: BookOpen },
    ]
  },
  
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-[#1e1f24] flex flex-col h-screen">
      <div className="p-6 flex justify-center">
        <div className="flex items-center ml-[-1rem] space-x-2">
        <img src="/logo1.png" alt="Peponi Logo" className="h-14 rounded-sm" />

        <img src="/logo2.png" alt="Peponi Logo" className="h-14 rounded-sm" />

        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-6 space-y-8 pb-6 scrollbar-hide">
        {sidebarItems.map((section) => (
          <div key={section.category}>
            <h2 className="text-xs font-semibold text-gray-400 mb-4">{section.category}</h2>
            <div className="space-y-1">
              {section.items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "sidebar-item",
                    pathname.startsWith(item.href) && "active"
                  )}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  )
}

