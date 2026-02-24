"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

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
  );
}
