import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@editor/ui/dialog";
import { TypographyPanel, type TypographyPanelProps } from "./typography-panel";
import { Button } from "@editor/ui/button";
import { Type } from "lucide-react";

export const TypographyDialog = ({ value, onChange }: TypographyPanelProps) => {

  return (
    <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Letter spacing"
            >
              <Type className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Typography</DialogTitle>
            </DialogHeader>
            <TypographyPanel value={value} onChange={onChange} />
          </DialogContent>
        </Dialog>
  );
};