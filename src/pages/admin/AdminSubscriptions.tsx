import { useEffect, useState } from "react";
import { adminQuery } from "@/hooks/useAdminQuery";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface SubRow {
  id: string;
  familyName: string;
  familyId: string;
  tier: string;
  status: string;
  started_at: string;
  expires_at: string | null;
}

export default function AdminSubscriptions() {
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [subsRes, familiesRes] = await Promise.all([
        adminQuery({ action: "query", table: "subscriptions", select: "*" }),
        adminQuery({ action: "query", table: "families", select: "id, name" }),
      ]);
      const famMap = Object.fromEntries((familiesRes.data || []).map((f: any) => [f.id, f.name]));
      setSubs((subsRes.data || []).map((s: any) => ({
        ...s,
        familyName: famMap[s.family_id] || s.family_id,
        familyId: s.family_id,
      })));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const changeTier = async (subId: string, newTier: string) => {
    try {
      await adminQuery({ action: "update", table: "subscriptions", id: subId, updates: { tier: newTier } });
      toast.success("Tier updated");
      load();
    } catch { toast.error("Failed"); }
  };

  const grantFreeUpgrade = async (subId: string) => {
    try {
      await adminQuery({ action: "update", table: "subscriptions", id: subId, updates: { tier: "familyplus", expires_at: null, status: "active" } });
      toast.success("Upgraded to Family+ (no expiry)");
      load();
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
      {loading ? <p className="text-gray-500">Loading…</p> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Family</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subs.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.familyName}</TableCell>
                <TableCell>
                  <Select value={s.tier} onValueChange={(v) => changeTier(s.id, v)}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="familyplus">Family+</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell><span className={`text-xs px-2 py-0.5 rounded ${s.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{s.status}</span></TableCell>
                <TableCell className="text-sm text-gray-500">{new Date(s.started_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-sm text-gray-500">{s.expires_at ? new Date(s.expires_at).toLocaleDateString() : "∞"}</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" onClick={() => grantFreeUpgrade(s.id)}>Grant Free+</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
