"use client";

import { useState } from "react";
import { Separator } from "@editor/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@editor/ui/dialog";
import { Button } from "@editor/ui/button";
import { Trash } from "lucide-react";
import { cn } from "@editor/ui/utils";

interface DeleteMenuItemProps {
  onDelete: () => void;
  isDeleting?: boolean;
  label?: string;
  deletingLabel?: string;
  entityType?: string;
  entityName?: string;
  className?: string;
}

export function DeleteMenuItem({
  onDelete,
  isDeleting = false,
  label = "Delete",
  deletingLabel = "Deleting...",
  entityType = "item",
  entityName,
  className,
}: DeleteMenuItemProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    setOpen(false);
    onDelete();
  };

  return (
    <>
      <Separator className="my-1" />
      <button
        type="button"
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
          "text-destructive hover:bg-accent focus:bg-accent focus:text-destructive",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          isDeleting && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={(e) => {
          e.preventDefault();
          if (!isDeleting) {
            setOpen(true);
            (e.currentTarget as HTMLButtonElement).blur();
          }
        }}
        disabled={isDeleting}
      >
        <Trash className="h-4 w-4 mr-2" />
        {isDeleting ? deletingLabel : label}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {entityType}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              {entityName
                ? `"${entityName}"`
                : `this ${entityType.toLowerCase()}`}
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? deletingLabel : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
