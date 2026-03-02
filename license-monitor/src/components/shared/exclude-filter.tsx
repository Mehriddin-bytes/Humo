"use client";

import { useState } from "react";
import { Filter, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export interface FilterOption {
  id: string;
  label: string;
}

interface ExcludeFilterProps {
  label: string;
  options: FilterOption[];
  excluded: Set<string>;
  onChange: (excluded: Set<string>) => void;
}

export function ExcludeFilter({
  label,
  options,
  excluded,
  onChange,
}: ExcludeFilterProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  function toggle(id: string) {
    const next = new Set(excluded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  }

  function clearAll() {
    onChange(new Set());
  }

  function excludeAll() {
    onChange(new Set(filtered.map((o) => o.id)));
  }

  const count = excluded.size;

  return (
    <div className="flex items-center gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={count > 0 ? "default" : "outline"}
            size="sm"
            className="h-8 gap-1.5"
          >
            <Filter className="h-3.5 w-3.5" />
            {label}
            {count > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 px-1.5 text-[10px] font-semibold"
              >
                {count}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <div className="p-2 border-b">
            <Input
              placeholder={`Search ${label.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="max-h-[240px] overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No results
              </div>
            ) : (
              filtered.map((opt) => {
                const isExcluded = excluded.has(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggle(opt.id)}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent transition-colors text-left"
                  >
                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border shadow-xs transition-shadow ${
                        !isExcluded
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input"
                      }`}
                    >
                      {!isExcluded && <Check className="h-3.5 w-3.5" />}
                    </div>
                    <span
                      className={
                        isExcluded
                          ? "line-through text-muted-foreground"
                          : ""
                      }
                    >
                      {opt.label}
                    </span>
                  </button>
                );
              })
            )}
          </div>
          {options.length > 1 && (
            <div className="flex items-center justify-between border-t px-2 py-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={clearAll}
              >
                <Check className="mr-1 h-3 w-3" />
                Show All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={excludeAll}
              >
                <X className="mr-1 h-3 w-3" />
                Hide All
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
      {count > 0 && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={clearAll}
          title="Clear exclude filter"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
