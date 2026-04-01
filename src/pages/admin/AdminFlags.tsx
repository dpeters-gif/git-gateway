import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const DEFAULT_FLAGS = [
  { key: "enable_ai_suggestions", label: "AI Task Suggestions", description: "P-12 AI task suggestions feature" },
  { key: "enable_email_inbox", label: "Email-to-Calendar", description: "P-14 email inbox processing" },
  { key: "enable_push_notifications", label: "Push Notifications", description: "Push notification delivery" },
  { key: "enable_boss_battles", label: "Boss Battles", description: "Boss battle challenge type" },
];

export default function AdminFlags() {
  const [flags, setFlags] = useState<Record<string, boolean>>(() => {
    const stored = localStorage.getItem("admin_flags");
    return stored ? JSON.parse(stored) : Object.fromEntries(DEFAULT_FLAGS.map((f) => [f.key, true]));
  });

  const toggle = (key: string) => {
    const next = { ...flags, [key]: !flags[key] };
    setFlags(next);
    localStorage.setItem("admin_flags", JSON.stringify(next));
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Feature Flags</h1>
      <p className="text-sm text-gray-500">Runtime feature toggles. Stored in localStorage for now.</p>
      <div className="space-y-3 max-w-lg">
        {DEFAULT_FLAGS.map((f) => (
          <Card key={f.key} className="border-gray-200">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-sm">{f.label}</p>
                <p className="text-xs text-gray-500">{f.description}</p>
              </div>
              <Switch checked={flags[f.key] ?? true} onCheckedChange={() => toggle(f.key)} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
