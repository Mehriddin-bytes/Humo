"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Send, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type Step = "select-role" | "enter-code";

const ROLES = [
  { id: "web", label: "WEB Admin" },
  { id: "office", label: "OFFICE Admin" },
];

const CODE_LENGTH = 6;

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("select-role");
  const [selectedRole, setSelectedRole] = useState("");
  const [roleLabel, setRoleLabel] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === "enter-code") {
      // Small delay to ensure refs are mounted
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }
  }, [step]);

  async function handleSendCode(role: string) {
    setSending(true);
    setSelectedRole(role);

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to send code");
        setSending(false);
        return;
      }

      setRoleLabel(data.roleLabel);
      setStep("enter-code");
      toast.success("Verification code sent!");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function handleDigitChange(index: number, value: string) {
    // Only allow single digit
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    // Auto-advance to next input
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits filled
    const code = newDigits.join("");
    if (code.length === CODE_LENGTH) {
      handleVerify(code);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    const newDigits = Array(CODE_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    // Focus the next empty or the last one
    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();

    if (pasted.length === CODE_LENGTH) {
      handleVerify(pasted);
    }
  }

  async function handleVerify(code: string) {
    if (code.length !== CODE_LENGTH) return;

    setVerifying(true);

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Verification failed");
        setDigits(Array(CODE_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
        setVerifying(false);
        return;
      }

      toast.success("Login successful!");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
      setVerifying(false);
    }
  }

  function handleBack() {
    setStep("select-role");
    setDigits(Array(CODE_LENGTH).fill(""));
    setSelectedRole("");
    setRoleLabel("");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">WPL License Monitor</CardTitle>
          <CardDescription>
            {step === "select-role"
              ? "Select your role to receive a verification code"
              : `Verification code sent to ${roleLabel}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "select-role" ? (
            <div className="space-y-3">
              {ROLES.map((role) => (
                <Button
                  key={role.id}
                  variant="outline"
                  className="w-full h-14 text-base justify-start gap-3"
                  disabled={sending}
                  onClick={() => handleSendCode(role.id)}
                >
                  {sending && selectedRole === role.id ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                  {role.label}
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* OTP Input */}
              <div className="flex justify-center gap-2">
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    disabled={verifying}
                    style={{ width: 44, height: 44 }}
                    className="shrink-0 rounded-md border border-input bg-background text-center text-lg font-semibold transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                  />
                ))}
              </div>

              {verifying && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </div>
              )}

              <Button
                type="button"
                variant="ghost"
                className="w-full mt-2"
                onClick={handleBack}
                disabled={verifying}
              >
                Back to role selection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
