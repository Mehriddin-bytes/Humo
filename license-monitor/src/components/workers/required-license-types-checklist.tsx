"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface RequiredLicenseTypesChecklistProps {
  workerId: string;
  allLicenseTypes: { id: string; name: string }[];
  currentRequired: string[];
  activeLicenseTypeIds: string[];
}

export function RequiredLicenseTypesChecklist({
  workerId,
  allLicenseTypes,
  currentRequired,
  activeLicenseTypeIds,
}: RequiredLicenseTypesChecklistProps) {
  const router = useRouter();
  const [checkedIds, setCheckedIds] = useState<Set<string>>(
    new Set(currentRequired)
  );
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const requiredCount = checkedIds.size;
  const missingCount = Array.from(checkedIds).filter(
    (id) => !activeLicenseTypeIds.includes(id)
  ).length;

  async function handleToggle(licenseTypeId: string) {
    const prev = new Set(checkedIds);
    const next = new Set(checkedIds);
    if (next.has(licenseTypeId)) {
      next.delete(licenseTypeId);
    } else {
      next.add(licenseTypeId);
    }
    setCheckedIds(next);

    setSaving(true);
    const res = await fetch(`/api/workers/${workerId}/required-license-types`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseTypeIds: Array.from(next) }),
    });

    if (res.ok) {
      router.refresh();
    } else {
      toast.error("Failed to update required licenses");
      setCheckedIds(prev);
    }
    setSaving(false);
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <span className="font-semibold text-sm">Required License Types</span>
          <span className="text-sm text-muted-foreground">
            {requiredCount} of {allLicenseTypes.length} selected
          </span>
        </div>
        <div className="flex items-center gap-2">
          {missingCount > 0 && (
            <Badge variant="orange">
              {missingCount} missing
            </Badge>
          )}
          {requiredCount > 0 && missingCount === 0 && (
            <Badge className="!bg-green-600 !text-white">
              All covered
            </Badge>
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-3 border-t">
          <div className="grid gap-3 sm:grid-cols-2">
            {allLicenseTypes.map((lt) => {
              const isRequired = checkedIds.has(lt.id);
              const hasActive = activeLicenseTypeIds.includes(lt.id);

              return (
                <label
                  key={lt.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={isRequired}
                    onCheckedChange={() => handleToggle(lt.id)}
                    disabled={saving}
                  />
                  <span className="text-sm">{lt.name}</span>
                  {isRequired && hasActive && (
                    <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                  )}
                  {isRequired && !hasActive && (
                    <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
