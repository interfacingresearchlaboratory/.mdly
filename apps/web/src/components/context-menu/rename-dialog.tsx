"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@editor/ui/dialog";
import { Button } from "@editor/ui/button";
import { Input } from "@editor/ui/input";

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onSave: (newName: string) => Promise<void>;
  entityType?: string;
  isSaving?: boolean;
}

export function RenameDialog({
  open,
  onOpenChange,
  currentName,
  onSave,
  entityType = "item",
  isSaving = false,
}: RenameDialogProps) {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    if (open) {
      setName(currentName);
    }
  }, [open, currentName]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    if (trimmedName === currentName) {
      onOpenChange(false);
      return;
    }
    await onSave(trimmedName);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setName(currentName);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename {entityType}</DialogTitle>
          <DialogDescription>
            Enter a new name for this {entityType.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isSaving) {
                e.preventDefault();
                handleSave();
              } else if (e.key === "Escape") {
                handleCancel();
              }
            }}
            placeholder={`${entityType} name`}
            disabled={isSaving}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !name.trim() || name.trim() === currentName}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
