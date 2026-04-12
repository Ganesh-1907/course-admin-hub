import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface SearchableSelectOption {
  value: string;
  label: string;
  inlineMeta?: string;
  description?: string;
  badge?: string;
  keywords?: string[];
}

interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  triggerClassName?: string;
  contentClassName?: string;
}

const SearchableSelect = ({
  value,
  onValueChange,
  options,
  placeholder,
  searchPlaceholder = "Search...",
  emptyMessage = "No options found.",
  disabled = false,
  triggerClassName,
  contentClassName,
}: SearchableSelectProps) => {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "flex h-12 w-full items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/80 px-4 text-left text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50",
            triggerClassName,
          )}
        >
          <div className="min-w-0 flex-1">
            {selectedOption ? (
              <p className="truncate text-foreground">
                <span className="font-semibold">{selectedOption.label}</span>
                {selectedOption.inlineMeta && (
                  <span className="font-medium text-muted-foreground"> {selectedOption.inlineMeta}</span>
                )}
              </p>
            ) : (
              <p className="truncate font-normal text-muted-foreground">{placeholder}</p>
            )}
            {selectedOption?.description && (
              <p className="truncate text-xs text-muted-foreground">{selectedOption.description}</p>
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className={cn(
          "w-[var(--radix-popover-trigger-width)] rounded-[1.25rem] border border-border/70 bg-popover/95 p-0 shadow-xl backdrop-blur",
          contentClassName,
        )}
      >
        <Command className="rounded-[1.25rem] bg-transparent">
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className="max-h-72 p-2">
            <CommandEmpty className="py-8 text-sm text-muted-foreground">{emptyMessage}</CommandEmpty>
            <CommandGroup className="p-0">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={[option.label, option.inlineMeta, option.description, ...(option.keywords || [])].filter(Boolean).join(" ")}
                  onSelect={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "mb-1 rounded-xl px-3 py-3 text-sm data-[selected=true]:bg-accent/80",
                    option.value === value && "bg-secondary/60",
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <Check
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0 text-primary transition-opacity",
                        option.value === value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-foreground">
                        <span className="font-semibold">{option.label}</span>
                        {option.inlineMeta && (
                          <span className="font-medium text-muted-foreground"> {option.inlineMeta}</span>
                        )}
                      </p>
                      {option.description && (
                        <p className="truncate text-xs text-muted-foreground">{option.description}</p>
                      )}
                    </div>
                  </div>
                  {option.badge && (
                    <span className="ml-3 shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">
                      {option.badge}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export { SearchableSelect };
