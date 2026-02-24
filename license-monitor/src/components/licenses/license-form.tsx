"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse, isValid } from "date-fns";
import { CalendarIcon, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { licenseSchema, type LicenseFormData } from "@/lib/validations/license";

interface LicenseType {
  id: string;
  name: string;
}

interface LicenseFormProps {
  workerId: string;
  defaultValues?: LicenseFormData & { id?: string };
  mode: "create" | "edit";
}

function tryParseDate(value: string): Date | undefined {
  if (!value) return undefined;

  // Try common formats
  const formats = [
    "yyyy-MM-dd",
    "MM/dd/yyyy",
    "dd/MM/yyyy",
    "dd.MM.yyyy",
    "MM-dd-yyyy",
    "dd-MM-yyyy",
    "MMM d, yyyy",
    "MMMM d, yyyy",
  ];

  for (const fmt of formats) {
    const parsed = parse(value, fmt, new Date());
    if (isValid(parsed) && parsed.getFullYear() > 1900 && parsed.getFullYear() < 2100) {
      return parsed;
    }
  }

  // Try native Date parse as fallback
  const native = new Date(value);
  if (isValid(native) && native.getFullYear() > 1900 && native.getFullYear() < 2100) {
    return native;
  }

  return undefined;
}

interface DatePickerFieldProps {
  label: string;
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  error?: string;
}

function DatePickerField({ label, date, onDateChange, error }: DatePickerFieldProps) {
  const [inputValue, setInputValue] = useState(date ? format(date, "yyyy-MM-dd") : "");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(date || new Date());

  // Sync input when date changes from calendar
  const handleCalendarSelect = useCallback(
    (selected: Date | undefined) => {
      if (selected) {
        setInputValue(format(selected, "yyyy-MM-dd"));
        onDateChange(selected);
        setIsCalendarOpen(false);
      }
    },
    [onDateChange]
  );

  function handleInputChange(value: string) {
    setInputValue(value);
    const parsed = tryParseDate(value);
    if (parsed) {
      onDateChange(parsed);
      setCalendarMonth(parsed);
    }
  }

  function handleInputBlur() {
    const parsed = tryParseDate(inputValue);
    if (parsed) {
      setInputValue(format(parsed, "yyyy-MM-dd"));
      onDateChange(parsed);
    } else if (inputValue && !parsed) {
      // Reset to last valid date or clear
      if (date) {
        setInputValue(format(date, "yyyy-MM-dd"));
      } else {
        setInputValue("");
        onDateChange(undefined);
      }
    }
  }

  // Generate year options (from 2000 to 2040)
  const years = Array.from({ length: 41 }, (_, i) => 2000 + i);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          placeholder="yyyy-mm-dd"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={handleInputBlur}
          className="flex-1"
        />
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="flex items-center gap-1 p-3 pb-0">
              <Select
                value={String(calendarMonth.getMonth())}
                onValueChange={(val) => {
                  const newDate = new Date(calendarMonth);
                  newDate.setMonth(parseInt(val));
                  setCalendarMonth(newDate);
                }}
              >
                <SelectTrigger className="h-8 flex-1 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={String(calendarMonth.getFullYear())}
                onValueChange={(val) => {
                  const newDate = new Date(calendarMonth);
                  newDate.setFullYear(parseInt(val));
                  setCalendarMonth(newDate);
                }}
              >
                <SelectTrigger className="h-8 w-[80px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleCalendarSelect}
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
            />
          </PopoverContent>
        </Popover>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function LicenseForm({ workerId, defaultValues, mode }: LicenseFormProps) {
  const router = useRouter();
  const [licenseTypes, setLicenseTypes] = useState<LicenseType[]>([]);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customTypeName, setCustomTypeName] = useState("");
  const [isCreatingType, setIsCreatingType] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState(defaultValues?.licenseTypeId || "");
  const [issueDate, setIssueDate] = useState<Date | undefined>(
    defaultValues?.issueDate ? new Date(defaultValues.issueDate) : undefined
  );
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(
    defaultValues?.expiryDate ? new Date(defaultValues.expiryDate) : undefined
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LicenseFormData>({
    resolver: zodResolver(licenseSchema),
    defaultValues: defaultValues || {
      workerId,
      licenseTypeId: "",
      code: "",
      issueDate: "",
      expiryDate: "",
      notes: "",
    },
  });

  useEffect(() => {
    fetch("/api/license-types")
      .then((res) => res.json())
      .then(setLicenseTypes);
  }, []);

  async function handleCreateCustomType() {
    const name = customTypeName.trim();
    if (!name) {
      toast.error("Please enter a license type name");
      return;
    }

    setIsCreatingType(true);
    try {
      const res = await fetch("/api/license-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to create license type");
        return;
      }

      const newType: LicenseType = await res.json();

      setLicenseTypes((prev) => {
        const exists = prev.some((t) => t.id === newType.id);
        if (exists) return prev;
        return [...prev, newType].sort((a, b) => a.name.localeCompare(b.name));
      });

      setSelectedTypeId(newType.id);
      setValue("licenseTypeId", newType.id);
      setIsAddingCustom(false);
      setCustomTypeName("");
      toast.success(`License type "${newType.name}" added`);
    } catch {
      toast.error("Failed to create license type");
    } finally {
      setIsCreatingType(false);
    }
  }

  async function onSubmit(data: LicenseFormData) {
    const url =
      mode === "create"
        ? "/api/licenses"
        : `/api/licenses/${defaultValues?.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      toast.error(errorData.error || "Failed to save license");
      return;
    }

    toast.success(
      mode === "create" ? "License added successfully" : "License updated successfully"
    );
    router.push(`/workers/${workerId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "create" ? "Add New License" : "Edit License"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input type="hidden" {...register("workerId")} />

          <div className="space-y-2">
            <Label>License Type *</Label>
            {isAddingCustom ? (
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Worker Health & Safety Awareness"
                  value={customTypeName}
                  onChange={(e) => setCustomTypeName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateCustomType();
                    }
                  }}
                  autoFocus
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreateCustomType}
                  disabled={isCreatingType}
                >
                  {isCreatingType ? "Adding..." : "Add"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsAddingCustom(false);
                    setCustomTypeName("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Select
                  value={selectedTypeId}
                  onValueChange={(val) => {
                    setSelectedTypeId(val);
                    setValue("licenseTypeId", val);
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select license type" />
                  </SelectTrigger>
                  <SelectContent>
                    {licenseTypes.map((lt) => (
                      <SelectItem key={lt.id} value={lt.id}>
                        {lt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingCustom(true)}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Custom
                </Button>
              </div>
            )}
            {errors.licenseTypeId && (
              <p className="text-sm text-destructive">
                {errors.licenseTypeId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">License Code (optional)</Label>
            <Input
              id="code"
              placeholder="e.g. WAH-34588"
              {...register("code")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DatePickerField
              label="Issue Date *"
              date={issueDate}
              onDateChange={(date) => {
                setIssueDate(date);
                if (date) {
                  setValue("issueDate", date.toISOString());
                }
              }}
              error={errors.issueDate?.message}
            />
            <DatePickerField
              label="Expiry Date *"
              date={expiryDate}
              onDateChange={(date) => {
                setExpiryDate(date);
                if (date) {
                  setValue("expiryDate", date.toISOString());
                }
              }}
              error={errors.expiryDate?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} {...register("notes")} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : mode === "create"
                ? "Add License"
                : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
