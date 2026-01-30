"use client"

import { ReactNode } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  title?: string
  description?: ReactNode
  itemName?: string
  confirmText?: string
  isLoading?: boolean
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Delete Item",
  description,
  itemName,
  confirmText = "Delete",
  isLoading = false,
}: DeleteConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description || (
              <>
                Are you sure you want to delete <strong>&ldquo;{itemName}&rdquo;</strong>?
                This action cannot be undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Deleting..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
