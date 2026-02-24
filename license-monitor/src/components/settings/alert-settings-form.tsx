"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface AlertSettings {
  id: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  warning90days: boolean;
  warning60days: boolean;
  warning30days: boolean;
  recipientEmail: string | null;
  recipientPhone: string | null;
}

interface AlertSettingsFormProps {
  settings: AlertSettings;
}

export function AlertSettingsForm({ settings }: AlertSettingsFormProps) {
  const [form, setForm] = useState({
    emailEnabled: settings.emailEnabled,
    smsEnabled: settings.smsEnabled,
    warning90days: settings.warning90days,
    warning60days: settings.warning60days,
    warning30days: settings.warning30days,
    recipientEmail: settings.recipientEmail || "",
    recipientPhone: settings.recipientPhone || "",
  });
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Settings saved");
    } else {
      toast.error("Failed to save settings");
    }
    setSaving(false);
  }

  async function handleRunCheck() {
    setChecking(true);
    const res = await fetch("/api/alerts/check", {
      method: "POST",
      headers: { "x-internal-call": "true" },
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(
        `Check complete: ${data.checked} licenses checked, ${data.alertsSent} alerts sent, ${data.errors} errors`
      );
    } else {
      toast.error("Alert check failed");
    }
    setChecking(false);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>
            Enable email and/or SMS alerts for expiring licenses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send email alerts via Resend
              </p>
            </div>
            <Switch
              checked={form.emailEnabled}
              onCheckedChange={(checked) =>
                setForm({ ...form, emailEnabled: checked })
              }
            />
          </div>
          {form.emailEnabled && (
            <div className="space-y-2 pl-4 border-l-2">
              <Label htmlFor="recipientEmail">Recipient Email</Label>
              <Input
                id="recipientEmail"
                type="email"
                placeholder="manager@company.com"
                value={form.recipientEmail}
                onChange={(e) =>
                  setForm({ ...form, recipientEmail: e.target.value })
                }
              />
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send SMS alerts via Twilio
              </p>
            </div>
            <Switch
              checked={form.smsEnabled}
              onCheckedChange={(checked) =>
                setForm({ ...form, smsEnabled: checked })
              }
            />
          </div>
          {form.smsEnabled && (
            <div className="space-y-2 pl-4 border-l-2">
              <Label htmlFor="recipientPhone">Recipient Phone</Label>
              <Input
                id="recipientPhone"
                placeholder="+1234567890"
                value={form.recipientPhone}
                onChange={(e) =>
                  setForm({ ...form, recipientPhone: e.target.value })
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Warning Thresholds</CardTitle>
          <CardDescription>
            Choose when to send alerts before license expiry
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="warning90"
              checked={form.warning90days}
              onCheckedChange={(checked) =>
                setForm({ ...form, warning90days: checked === true })
              }
            />
            <Label htmlFor="warning90">90 days before expiry</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="warning60"
              checked={form.warning60days}
              onCheckedChange={(checked) =>
                setForm({ ...form, warning60days: checked === true })
              }
            />
            <Label htmlFor="warning60">60 days before expiry</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="warning30"
              checked={form.warning30days}
              onCheckedChange={(checked) =>
                setForm({ ...form, warning30days: checked === true })
              }
            />
            <Label htmlFor="warning30">30 days before expiry</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleRunCheck}
            disabled={checking}
          >
            {checking ? "Running..." : "Run Check Now"}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
