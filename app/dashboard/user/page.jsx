import UserManagement from "./user-management"

export const metadata = {
  title: "User Management",
  description: "Manage users of the application",
}

export default function UsersPage() {
  return (
    <div className="container mx-auto py-0">
     <div className='flex mt-2 justify-start px-4  pb-2 gap-2 w-[100%] items-center'>
            <h1 className='text-4xl font-normal'> User Management</h1>
        </div>
      <UserManagement />
    </div>
  )
}

