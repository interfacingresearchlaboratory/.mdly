"use client";

import { useState, type ChangeEvent, useRef } from "react";
import { Textarea } from "@editor/ui/textarea";
import { ToolbarlessEditor } from "@editor/ui/editor/toolbarless-editor";
import { Label } from "@editor/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@editor/ui/avatar";
import { Separator } from "@editor/ui/separator";
import { Button } from "@editor/ui/button";
import { ExternalLink, Star, Pencil, Trash2, ChevronDown, Plus, CircleDashed, Folder, Layers, Shapes, MessageSquare, ArrowRight, Edit, Binoculars } from "lucide-react";
import { cn } from "@editor/ui/utils";
import { ElectronWindow } from "./electron-window";
import { siteConfig } from "@/lib/site-config";

// Lexical editor state type
type SerializedEditorState = any;

// Simple priority high icon (3 filled vertical bars)
function PriorityHighIcon({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      {...props}
    >
      <rect x="2" y="8" width="2" height="6" rx="0.5" />
      <rect x="6" y="6" width="2" height="8" rx="0.5" />
      <rect x="10" y="4" width="2" height="10" rx="0.5" />
    </svg>
  );
}

// Helper function to convert plain text to Lexical editor state
function textToLexicalState(text: string): SerializedEditorState {
  // Split text by lines and create paragraphs
  const lines = text.split('\n');
  const children = lines.map((line) => {
    const trimmedLine = line.trim();
    
    if (trimmedLine === '') {
      // Empty line - create empty paragraph
      return {
        children: [],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      };
    }
    
    // Check if line is a heading (Overview, Requirements, or Options)
    const isHeading = trimmedLine === "Overview" || trimmedLine === "Requirements" || trimmedLine === "Options";
    
    if (isHeading) {
      // Create h2 heading node
      return {
        children: [
          {
            detail: 0,
            format: 0, // Not bold
            mode: "normal",
            style: "",
            text: trimmedLine,
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        tag: "h2",
        type: "heading",
        version: 1,
      };
    }
    
    // Regular paragraph - not bold
    return {
      children: [
        {
          detail: 0,
          format: 0, // Not bold
          mode: "normal",
          style: "",
          text: line,
          type: "text",
          version: 1,
        },
      ],
      direction: "ltr",
      format: "",
      indent: 0,
      type: "paragraph",
      version: 1,
    };
  });

  return {
    root: {
      children,
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
}

export function ScoutDetailMockup() {
  const [name, setName] = useState("Apple Studio Display for color accuracy");
  const [isEditingName, setIsEditingName] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const initialDescriptionText = `Overview
Our design team needs accurate color reproduction for the brand refresh work. Current monitors have inconsistent color calibration, which is causing issues when designs are viewed on different screens. We need a professional-grade display that ensures color accuracy across all our design work.

Requirements
- 27-inch 5K Retina display (5120 x 2880)
- P3 wide color gamut for accurate color reproduction
- True Tone and brightness adjustment
- Built-in camera and speakers for video calls
- Compatible with our existing MacBook setups

Options
We're evaluating the Apple Studio Display as the primary option. It offers the color accuracy we need and integrates seamlessly with our existing Apple ecosystem. Need to compare pricing and check if we can get a bulk discount for purchasing multiple units.`;
  
  const [description, setDescription] = useState<SerializedEditorState>(
    textToLexicalState(initialDescriptionText)
  );
  const [editorResetKey] = useState(0);
  const descriptionRef = useRef<SerializedEditorState>(description);
  const [sourceExpanded, setSourceExpanded] = useState<number | null>(1);

  const handleNameChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setName(e.target.value);
    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleNameBlur = () => {
    setIsEditingName(false);
  };

  const handleDescriptionChange = (content: SerializedEditorState) => {
    descriptionRef.current = content;
    setDescription(content);
  };

  return (
    <ElectronWindow
      title={name}
      icon={<Binoculars className="h-3 w-3" strokeWidth={1} />}
      className="w-full h-full max-w-full max-h-full"
      allowOutsideBounds={true}
      onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      showSidebarToggle={true}
    >
      <div className="flex h-full relative mx-2 border-l border-t border-r border-border rounded-t-lg" style={{ height: '100%', maxHeight: '100%' }}>
        {/* Backdrop overlay for mobile */}
        {sidebarOpen && (
          <div
            className="md:hidden absolute inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* Main content area */}
        <div className={cn("flex-1 overflow-y-auto", sidebarOpen ? "pr-56" : "pr-0 md:pr-56")} style={{ minHeight: 0 }}>
          <div className="pt-3 px-2 md:px-3 pb-3">
            <div className="space-y-3 max-w-xl mx-auto">
              {/* Name */}
              <div>
                {isEditingName ? (
                  <Textarea
                    value={name}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleNameBlur();
                      } else if (e.key === "Escape") {
                        setName("New MacBook Pro for design team");
                        setIsEditingName(false);
                      }
                    }}
                    className="min-h-[32px] p-0 border-none bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none !text-lg md:!text-xl font-normal leading-tight break-words resize-none w-full"
                    rows={1}
                    autoFocus
                  />
                ) : (
                  <h1
                    className="text-lg md:text-xl font-normal leading-tight cursor-text hover:bg-muted/50 rounded px-1 -mx-1 transition-colors break-words"
                    onClick={() => setIsEditingName(true)}
                  >
                    {name}
                  </h1>
                )}
              </div>

              {/* Description - Lexical Editor */}
              <div className="space-y-1">
                <ToolbarlessEditor
                  resetKey={`scout-detail-mockup:${editorResetKey}`}
                  initialContent={description}
                  onChange={handleDescriptionChange}
                  placeholder="Add a description for this scout…"
                  className="min-h-[160px] text-sm"
                />
              </div>

              {/* Sources Section */}
              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="!text-sm font-medium leading-normal m-0">Sources</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(siteConfig.appUrl, "_blank");
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" strokeWidth={1} />
                    Add Source
                  </Button>
                </div>

                <div className="space-y-1.5">
                  {[
                    {
                      id: 1,
                      name: "Apple Store - Studio Display",
                      price: "$1,599.00",
                      type: "retailer",
                      condition: "new",
                      url: "https://www.apple.com/studio-display",
                      description: "27-inch 5K Retina display with P3 wide color gamut. Features True Tone technology, 600 nits brightness, and built-in 12MP Ultra Wide camera with Center Stage.",
                      notes: "Check if we can get bulk discount for purchasing 3 units. Also verify compatibility with our existing MacBook models.",
                      starred: true,
                    },
                    {
                      id: 2,
                      name: "Best Buy - Studio Display",
                      price: "$1,599.00",
                      type: "retailer",
                      condition: "new",
                      url: "https://www.bestbuy.com/studio-display",
                      description: "Same model available at Best Buy with extended warranty and protection plan options.",
                      notes: "Compare warranty coverage and see if they offer business discounts.",
                      starred: false,
                    },
                    {
                      id: 3,
                      name: "B&H Photo - Studio Display",
                      price: "$1,549.00",
                      type: "retailer",
                      condition: "new",
                      url: "https://www.bhphotovideo.com/studio-display",
                      description: "Lower price point, includes free shipping and no sales tax in most states. Good option for bulk purchases.",
                      notes: null,
                      starred: false,
                    },
                  ].map((source) => (
                    <div key={source.id} className="border border-border rounded-lg p-2 space-y-1.5">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1.5">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium !text-sm leading-normal m-0 p-0">{source.name}</div>
                          <div className="flex items-center gap-1 md:gap-1.5 flex-wrap mt-1">
                            <span className="text-xs text-muted-foreground">{source.price}</span>
                            <span className="text-xs px-2 py-0.5 bg-muted rounded capitalize">
                              {source.type}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-muted rounded capitalize">
                              {source.condition}
                            </span>
                            <a
                              href="#"
                              onClick={(e) => e.preventDefault()}
                              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                            >
                              <ExternalLink className="h-2.5 w-2.5" strokeWidth={1} />
                              Link
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 md:shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "h-7 w-7 p-0",
                              source.starred && "text-yellow-500 hover:text-yellow-600"
                            )}
                            onClick={(e) => e.preventDefault()}
                          >
                            <Star className={cn("h-2.5 w-2.5", source.starred && "fill-current")} strokeWidth={1} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={(e) => e.preventDefault()}
                          >
                            <Pencil className="h-2.5 w-2.5" strokeWidth={1} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            onClick={(e) => e.preventDefault()}
                          >
                            <Trash2 className="h-2.5 w-2.5" strokeWidth={1} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => setSourceExpanded(sourceExpanded === source.id ? null : source.id)}
                          >
                            <ChevronDown
                              className={cn(
                                "h-2.5 w-2.5 transition-transform duration-200",
                                sourceExpanded === source.id && "rotate-180"
                              )}
                              strokeWidth={1}
                            />
                          </Button>
                        </div>
                      </div>
                      {sourceExpanded === source.id && (
                        <div className="pt-1.5 space-y-2 border-t border-border">
                          <div className="space-y-0.5">
                            <div className="text-xs font-medium text-muted-foreground">Description</div>
                            <div className="text-xs whitespace-pre-wrap">
                              {source.description}
                            </div>
                          </div>
                          {source.notes && (
                            <div className="space-y-0.5">
                              <div className="text-xs font-medium text-muted-foreground">Notes</div>
                              <div className="text-xs whitespace-pre-wrap">
                                {source.notes}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Section */}
              <Separator className="my-4" />
              <div className="space-y-4">
                <h2 className="!text-sm font-medium leading-normal m-0 p-0">Activity</h2>
                <div className="space-y-1">
                  {/* Activity: Created */}
                  <div className="relative flex items-center gap-2 overflow-hidden">
                    <div className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center">
                      <Plus className="h-2.5 w-2.5 text-muted-foreground" strokeWidth={1} />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden flex items-center gap-2">
                      <div className="text-xs text-muted-foreground truncate">
                        Scout created
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        2 days ago
                      </div>
                    </div>
                  </div>

                  {/* Activity: Status Changed */}
                  <div className="relative flex items-center gap-2 overflow-hidden">
                    <div className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center">
                      <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" strokeWidth={1} />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden flex items-center gap-2">
                      <div className="text-xs text-muted-foreground truncate">
                        Status changed to New
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        1 day ago
                      </div>
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="group relative flex items-start gap-2 overflow-hidden">
                    <div className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center mt-0.5">
                      <MessageSquare className="h-2.5 w-2.5 text-muted-foreground" strokeWidth={1} />
                    </div>
                    <div className="flex-1 min-w-0 rounded-md bg-muted/50 p-2 space-y-2 relative">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 shrink-0">
                          <AvatarImage src="" alt="sarah@example.com" />
                          <AvatarFallback className="text-xs">SC</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                          sarah
                        </span>
                        <span className="text-xs text-muted-foreground">
                          12 hours ago
                        </span>
                      </div>
                      <div className="text-xs text-foreground whitespace-pre-wrap break-words pr-16 pl-8">
                        Have we verified the color accuracy matches what we need for print work? Some designers mentioned concerns about P3 vs Adobe RGB.
                      </div>
                    </div>
                  </div>

                  {/* Activity: Property Changed */}
                  <div className="relative flex items-center gap-2 overflow-hidden">
                    <div className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center">
                      <Edit className="h-2.5 w-2.5 text-muted-foreground" strokeWidth={1} />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden flex items-center gap-2">
                      <div className="text-xs text-muted-foreground truncate">
                        Priority changed to High
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        10 hours ago
                      </div>
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="group relative flex items-start gap-2 overflow-hidden">
                    <div className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center mt-0.5">
                      <MessageSquare className="h-2.5 w-2.5 text-muted-foreground" strokeWidth={1} />
                    </div>
                    <div className="flex-1 min-w-0 rounded-md bg-muted/50 p-2 space-y-2 relative">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 shrink-0">
                          <AvatarImage src="" alt="mike@example.com" />
                          <AvatarFallback className="text-xs">MJ</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                          mike
                        </span>
                        <span className="text-xs text-muted-foreground">
                          5 hours ago
                        </span>
                      </div>
                      <div className="text-xs text-foreground whitespace-pre-wrap break-words pr-16 pl-8">
                        I've added three sources to compare. B&H has the best price for bulk orders. We need 3 units total for the design team.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comment Input */}
                <div className="bg-muted/50 rounded-md mt-4">
                  <div className="p-3">
                    <div className="flex items-start gap-2">
                      <Avatar className="h-6 w-6 shrink-0">
                        <AvatarImage src="" alt="you@example.com" />
                        <AvatarFallback className="text-xs">YU</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <Textarea
                          placeholder="Add a comment..."
                          className="min-h-[60px] text-xs resize-none"
                          onClick={(e) => e.preventDefault()}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={cn(
          "absolute right-0 top-0 w-56 h-full flex flex-col border-l border-border bg-accent z-50 md:z-10 transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        )}>
          <div className="overflow-y-auto flex-1">
            <div className="space-y-3 p-3 pb-3">
              {/* Properties Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="!text-xs text-muted-foreground leading-normal m-0 p-0 font-normal">Properties</Label>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {/* Status Selector */}
                  <button
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-muted text-foreground border border-border/60 rounded-md hover:bg-accent hover:border-border hover:shadow-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary/60"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(siteConfig.appUrl, "_blank");
                    }}
                  >
                    <CircleDashed className="h-3 w-3 shrink-0" strokeWidth={1} />
                    <span className="truncate">New</span>
                  </button>
                  {/* Priority Selector */}
                  <button
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-muted text-foreground border border-border/60 rounded-md hover:bg-accent hover:border-border hover:shadow-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary/60"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(siteConfig.appUrl, "_blank");
                    }}
                  >
                    <PriorityHighIcon className="h-3 w-3 shrink-0" strokeWidth={1} />
                    <span className="truncate">High</span>
                  </button>
                  {/* Category Selector */}
                  <button
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-muted text-foreground border border-border/60 rounded-md hover:bg-accent hover:border-border hover:shadow-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary/60"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(siteConfig.appUrl, "_blank");
                    }}
                  >
                    <Folder className="h-3 w-3 shrink-0" strokeWidth={1} />
                    <span className="truncate">Equipment</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {/* URL */}
                  <div className="space-y-0.5">
                    <Label className="!text-xs text-muted-foreground leading-normal m-0 p-0 font-normal">URL</Label>
                    <div className="w-full">
                      <button
                        className="w-full text-left inline-flex items-center justify-between gap-2 whitespace-nowrap rounded-md text-xs px-3 py-1.5 border border-input bg-transparent hover:bg-accent hover:border-border hover:shadow-sm transition-all cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(siteConfig.appUrl, "_blank");
                        }}
                      >
                        <span className="truncate">https://www.apple.com/studio-display</span>
                      </button>
                    </div>
                  </div>

                  {/* Image */}
                  <div className="space-y-0.5">
                    <Label className="!text-xs text-muted-foreground leading-normal m-0 p-0 font-normal">Image</Label>
                    <div className="w-full">
                      <button
                        className="w-full text-left inline-flex items-center justify-between gap-2 whitespace-nowrap rounded-md text-xs px-3 py-1.5 border border-input bg-transparent hover:bg-accent hover:border-border hover:shadow-sm transition-all cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(siteConfig.appUrl, "_blank");
                        }}
                      >
                        <span className="text-muted-foreground">Add image url</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Labels Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="!text-xs text-muted-foreground leading-normal m-0 p-0 font-normal">Labels</Label>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md !text-xs border bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 hover:shadow-sm hover:scale-105 transition-all cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(siteConfig.appUrl, "_blank");
                    }}
                  >
                    Equipment
                  </button>
                  <button
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md !text-xs border bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 hover:shadow-sm hover:scale-105 transition-all cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(siteConfig.appUrl, "_blank");
                    }}
                  >
                    Design
                  </button>
                </div>
              </div>

              {/* Project Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="!text-xs text-muted-foreground leading-normal m-0 p-0 font-normal">Project</Label>
                </div>
                <div className="flex flex-col gap-0.5">
                  <button
                    className="flex items-center justify-between group px-2 py-0.5 rounded-md hover:bg-accent hover:shadow-sm transition-all cursor-pointer w-full text-left"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(siteConfig.appUrl, "_blank");
                    }}
                  >
                    <div className="flex items-start gap-1.5 flex-1">
                      <Layers className="h-3 w-3 shrink-0 mt-0.5" strokeWidth={1} />
                      <span className="text-xs">Design Studio Setup</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Space Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="!text-xs text-muted-foreground leading-normal m-0 p-0 font-normal">Space</Label>
                </div>
                <div className="flex flex-col gap-0.5">
                  {[
                    { name: "Office" },
                    { name: "Design Studio" },
                    { name: "Remote" },
                  ].map((space) => (
                    <button
                      key={space.name}
                      className="flex items-center justify-between group px-2 py-0.5 rounded-md hover:bg-accent hover:shadow-sm transition-all cursor-pointer w-full text-left"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(siteConfig.appUrl, "_blank");
                      }}
                    >
                      <div className="flex items-start gap-1.5 flex-1">
                        <Shapes className="h-3 w-3 shrink-0 mt-0.5" strokeWidth={1} />
                        <span className="text-xs">{space.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ElectronWindow>
  );
}
