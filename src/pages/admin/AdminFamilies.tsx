import { useEffect, useState } from "react";
import { adminQuery } from "@/hooks/useAdminQuery";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Family {
  id: string;
  name: string;
  created_at: string;
  memberCount?: number;
  tier?: string;
  adminName?: string;
}

export default function AdminFamilies() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editFamily, setEditFamily] = useState<Family | null>(null);
  const [editTier, setEditTier] = useState("free");
  const [deleteFamily, setDeleteFamily] = useState<Family | null>(null);
  const [confirmName, setConfirmName] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data: fams } = await adminQuery({ action: "query", table: "families", select: "*" });
      const { data: members } = await adminQuery({ action: "query", table: "family_members", select: "family_id, name, is_admin" });
      const { data: subs } = await adminQuery({ action: "query", table: "subscriptions", select: "family_id, tier, status", filters: [{ column: "status", op: "eq", value: "active" }] });

      const enriched = (fams || []).map((f: any) => {
        const fMembers = (members || []).filter((m: any) => m.family_id === f.id);
        const admin = fMembers.find((m: any) => m.is_admin);
        const sub = (subs || []).find((s: any) => s.family_id === f.id);
        return { ...f, memberCount: fMembers.length, tier: sub?.tier || "free", adminName: admin?.name || "—" };
      });
      setFamilies(enriched);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = families.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  const handleEditSub = async () => {
    if (!editFamily) return;
    try {
      // Find existing sub
      const { data: subs } = await adminQuery({ action: "query", table: "subscriptions", filters: [{ column: "family_id", op: "eq", value: editFamily.id }] });
      if (subs?.length) {
        await adminQuery({ action: "update", table: "subscriptions", id: subs[0].id, updates: { tier: editTier, status: "active" } });
      } else {
        await adminQuery({ action: "insert", table: "subscriptions", record: { family_id: editFamily.id, tier: editTier, status: "active" } });
      }
      toast.success("Subscription updated");
      setEditFamily(null);
      load();
    } catch { toast.error("Failed"); }
  };

  const handleDelete = async () => {
    if (!deleteFamily || confirmName !== deleteFamily.name) return;
    try {
      await adminQuery({ action: "delete", table: "families", id: deleteFamily.id });
      toast.success("Family deleted");
      setDeleteFamily(null);
      setConfirmName("");
      load();
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Families</h1>
      <Input placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
      {loading ? <p className="text-gray-500">Loading…</p> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="font-medium">{f.name}</TableCell>
                <TableCell>{f.memberCount}</TableCell>
                <TableCell><span className="text-xs px-2 py-0.5 rounded bg-gray-100">{f.tier}</span></TableCell>
                <TableCell>{f.adminName}</TableCell>
                <TableCell className="text-sm text-gray-500">{new Date(f.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => { setEditFamily(f); setEditTier(f.tier || "free"); }}>Edit Sub</Button>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteFamily(f)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Edit subscription dialog */}
      <Dialog open={!!editFamily} onOpenChange={() => setEditFamily(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Subscription: {editFamily?.name}</DialogTitle></DialogHeader>
          <Select value={editTier} onValueChange={setEditTier}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="familyplus">Family+</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button onClick={handleEditSub}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteFamily} onOpenChange={() => { setDeleteFamily(null); setConfirmName(""); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Family</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600">Type <strong>{deleteFamily?.name}</strong> to confirm deletion. This is irreversible.</p>
          <Input value={confirmName} onChange={(e) => setConfirmName(e.target.value)} placeholder="Family name" />
          <DialogFooter>
            <Button variant="destructive" disabled={confirmName !== deleteFamily?.name} onClick={handleDelete}>Delete Forever</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
