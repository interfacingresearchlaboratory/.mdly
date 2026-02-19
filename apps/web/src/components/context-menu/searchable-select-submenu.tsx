"use client";

import {
  useState,
  type ReactNode,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@editor/ui/popover";
import { Input } from "@editor/ui/input";
import { Separator } from "@editor/ui/separator";
import { useIsMobile } from "@editor/ui/sidebar";
import type { ComponentType } from "react";
import { Check, ChevronRight, Plus, Loader2 } from "lucide-react";
import { cn } from "@editor/ui/utils";

export interface SearchableSelectOption {
  id?: string;
  name?: string;
  value?: string;
  [key: string]: unknown;
}

export interface SearchableSelectSubmenuProps<
  T extends SearchableSelectOption | string,
> {
  label: string;
  icon: ComponentType<{ className?: string }>;
  options: T[];
  selectedValue: string | null | undefined;
  onSelect: (value: string | null) => void;
  searchPlaceholder?: string;
  getOptionId: (option: T) => string;
  getOptionLabel: (option: T) => string;
  getOptionValue?: (option: T) => string;
  renderOption?: (option: T, isSelected: boolean) => ReactNode;
  contentWidth?: string;
  canEdit?: boolean;
  onCreate?: (searchValue: string) => Promise<string | void>;
  isCreating?: boolean;
  getCreateLabel?: (searchValue: string) => string;
  triggerClassName?: string;
}

export function SearchableSelectSubmenu<
  T extends SearchableSelectOption | string,
>({
  label,
  icon: Icon,
  options,
  selectedValue,
  onSelect,
  searchPlaceholder,
  getOptionId,
  getOptionLabel,
  getOptionValue,
  renderOption,
  contentWidth = "w-64",
  canEdit = true,
  onCreate,
  isCreating = false,
  getCreateLabel,
  triggerClassName,
}: SearchableSelectSubmenuProps<T>) {
  const [search, setSearch] = useState("");
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (!isMobile && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (!isMobile) setSubmenuOpen(true);
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      timeoutRef.current = setTimeout(() => setSubmenuOpen(false), 150);
    }
  };

  const handleClick = () => {
    if (isMobile) setSubmenuOpen((prev) => !prev);
  };

  const filteredOptions = options.filter((option) =>
    getOptionLabel(option).toLowerCase().includes(search.toLowerCase())
  );

  const sortedOptions = [...filteredOptions].sort((a, b) => {
    const aVal = getOptionValue ? getOptionValue(a) : getOptionId(a);
    const bVal = getOptionValue ? getOptionValue(b) : getOptionId(b);
    return aVal === selectedValue ? -1 : bVal === selectedValue ? 1 : 0;
  });

  const searchMatchesExisting = useMemo(() => {
    if (!search.trim() || !onCreate) return false;
    const searchLower = search.trim().toLowerCase();
    return options.some(
      (option) => getOptionLabel(option).toLowerCase() === searchLower
    );
  }, [search, options, getOptionLabel, onCreate]);

  const shouldShowCreateOption =
    onCreate &&
    search.trim().length > 0 &&
    !searchMatchesExisting &&
    !isCreating;

  useEffect(() => {
    if (submenuOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(timer);
    }
    setFocusedIndex(null);
  }, [submenuOpen]);

  const totalItems = sortedOptions.length + (shouldShowCreateOption ? 1 : 0);

  const handleCreate = useCallback(async () => {
    if (!onCreate || !search.trim() || searchMatchesExisting || isCreating)
      return;
    try {
      const newId = await onCreate(search.trim());
      if (newId) onSelect(newId);
      setSearch("");
      setSubmenuOpen(false);
    } catch {
      // Error handling in parent
    }
  }, [onCreate, search, searchMatchesExisting, isCreating, onSelect]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (totalItems === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const firstIndex = 0;
        buttonRefs.current[firstIndex]?.focus({ preventScroll: true });
        setFocusedIndex(firstIndex);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const lastIndex = totalItems - 1;
        buttonRefs.current[lastIndex]?.focus({ preventScroll: true });
        setFocusedIndex(lastIndex);
      } else if (
        e.key === "Enter" &&
        focusedIndex !== null &&
        focusedIndex >= 0
      ) {
        e.preventDefault();
        if (shouldShowCreateOption && focusedIndex === sortedOptions.length) {
          handleCreate();
        } else {
          const option = sortedOptions[focusedIndex];
          const optionValue = option
            ? (getOptionValue ? getOptionValue(option) : getOptionId(option))
            : null;
          if (optionValue != null) onSelect(optionValue);
        }
      } else if (
        e.key === "Enter" &&
        shouldShowCreateOption &&
        sortedOptions.length === 0
      ) {
        e.preventDefault();
        handleCreate();
      }
    },
    [
      focusedIndex,
      sortedOptions,
      totalItems,
      shouldShowCreateOption,
      getOptionValue,
      getOptionId,
      onSelect,
      handleCreate,
    ]
  );

  const handleButtonKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = Math.min(index + 1, totalItems - 1);
        buttonRefs.current[nextIndex]?.focus({ preventScroll: true });
        setFocusedIndex(nextIndex);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex = Math.max(index - 1, 0);
        if (prevIndex > 0) {
          buttonRefs.current[prevIndex]?.focus({ preventScroll: true });
          setFocusedIndex(prevIndex);
        } else {
          inputRef.current?.focus();
          setFocusedIndex(null);
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (shouldShowCreateOption && index === sortedOptions.length) {
          handleCreate();
        } else {
          const option = sortedOptions[index];
          const optionValue = option
            ? (getOptionValue ? getOptionValue(option) : getOptionId(option))
            : null;
          if (optionValue != null) onSelect(optionValue);
        }
      }
    },
    [
      sortedOptions,
      totalItems,
      shouldShowCreateOption,
      getOptionValue,
      getOptionId,
      onSelect,
      handleCreate,
    ]
  );

  const menuItemStyles =
    "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50";

  if (!canEdit) return null;

  return (
    <Popover open={submenuOpen} onOpenChange={setSubmenuOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(menuItemStyles, triggerClassName)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          <Icon className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="flex-1 truncate text-left">{label}</span>
          <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={`${contentWidth} p-0 overflow-x-hidden z-[60]`}
        side={isMobile ? "top" : "right"}
        align="start"
        sideOffset={4}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="px-2 py-1" onClick={(e) => e.stopPropagation()}>
          <Input
            ref={inputRef}
            placeholder={searchPlaceholder ?? `Search ${label.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="h-8"
            autoFocus={false}
            onFocus={() => setFocusedIndex(null)}
          />
        </div>
        <div className="max-h-64 overflow-y-auto overflow-x-hidden">
          <Separator />
          {isCreating ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {sortedOptions.map((option, index) => {
                const optionId = getOptionId(option);
                const optionLabel = getOptionLabel(option);
                const optionValue = getOptionValue
                  ? getOptionValue(option)
                  : optionId;
                const isSelected = optionValue === selectedValue;
                const isFocused = focusedIndex === index;

                if (renderOption) {
                  return (
                    <button
                      key={optionId}
                      ref={(el) => {
                        buttonRefs.current[index] = el;
                      }}
                      type="button"
                      className={cn(
                        menuItemStyles,
                        "gap-2",
                        isFocused && "bg-accent"
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSelect(optionValue);
                        if (isMobile) setSubmenuOpen(false);
                      }}
                      onKeyDown={(e) => handleButtonKeyDown(e, index)}
                      onFocus={() => setFocusedIndex(index)}
                    >
                      {renderOption(option, isSelected)}
                    </button>
                  );
                }

                return (
                  <button
                    key={optionId}
                    ref={(el) => {
                      buttonRefs.current[index] = el;
                    }}
                    type="button"
                    className={cn(
                      menuItemStyles,
                      "gap-2",
                      isFocused && "bg-accent"
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelect(optionValue);
                      if (isMobile) setSubmenuOpen(false);
                    }}
                    onKeyDown={(e) => handleButtonKeyDown(e, index)}
                    onFocus={() => setFocusedIndex(index)}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span
                      className={cn(
                        "flex-1 truncate text-left",
                        isSelected && "font-bold"
                      )}
                    >
                      {optionLabel}
                    </span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-muted-foreground shrink-0 ml-auto" />
                    )}
                  </button>
                );
              })}
              {shouldShowCreateOption && (
                <button
                  type="button"
                  ref={(el) => {
                    buttonRefs.current[sortedOptions.length] = el;
                  }}
                  className={cn(
                    menuItemStyles,
                    "gap-2 text-primary font-medium",
                    focusedIndex === sortedOptions.length && "bg-accent"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCreate();
                  }}
                  onKeyDown={(e) =>
                    handleButtonKeyDown(e, sortedOptions.length)
                  }
                  onFocus={() => setFocusedIndex(sortedOptions.length)}
                >
                  <Plus className="h-4 w-4 text-primary shrink-0" />
                  <span className="flex-1 truncate text-left">
                    {getCreateLabel
                      ? getCreateLabel(search.trim())
                      : `Create "${search.trim()}"`}
                  </span>
                </button>
              )}
            </>
          )}
        </div>
        <Separator />
        <button
          type="button"
          className={cn(
            menuItemStyles,
            "text-xs text-muted-foreground"
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect(null);
            if (isMobile) setSubmenuOpen(false);
          }}
        >
          Clear selection
        </button>
      </PopoverContent>
    </Popover>
  );
}
