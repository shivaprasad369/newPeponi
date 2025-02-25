import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
  } from "@/components/ui/dialog"
  import { Button } from "@/components/ui/button"
  import type { User } from "./types"
  
  interface UserDetailsDialogProps {
    user: User
    onClose: () => void
  }
  
  export default function UserDetailsDialog({ user, onClose }: UserDetailsDialogProps) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Detailed information about the user.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-semibold text-right">Name:</span>
              <span className="col-span-3">{user.name}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-semibold text-right">Email:</span>
              <span className="col-span-3">{user.email}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-semibold text-right">Phone Number:</span>
              <span className="col-span-3">{user.phone}</span>
            </div>
            {/* <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-semibold text-right">Status:</span>
              <span className="col-span-3 capitalize">{user.status}</span>
            </div> */}
          </div>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }
  
  