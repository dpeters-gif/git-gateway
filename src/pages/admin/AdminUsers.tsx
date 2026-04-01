import { useEffect, useState } from "react";
import { adminQuery } from "@/hooks/useAdminQuery";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface UserRow {
  id: string;
  name: string;
  role: string;
  email?: string;
  familyName?: string;
  level?: number;
  totalXP?: number;
  streak?: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [profilesRes, membersRes, familiesRes, levelsRes, streaksRes, emailsRes] = await Promise.all([
          adminQuery({ action: "query", table: "profiles", select: "*" }),
          adminQuery({ action: "query", table: "family_members", select: "user_id, family_id" }),
          adminQuery({ action: "query", table: "families", select: "id, name" }),
          adminQuery({ action: "query", table: "levels", select: "user_id, current_level, total_xp" }),
          adminQuery({ action: "query", table: "streaks", select: "user_id, current_count" }),
          adminQuery({ action: "auth-users" }),
        ]);

        const profiles = profilesRes.data || [];
        const members = membersRes.data || [];
        const familiesMap = Object.fromEntries((familiesRes.data || []).map((f: any) => [f.id, f.name]));
        const levelsMap = Object.fromEntries((levelsRes.data || []).map((l: any) => [l.user_id, l]));
        const streaksMap = Object.fromEntries((streaksRes.data || []).map((s: any) => [s.user_id, s.current_count]));
        const emailMap = emailsRes.emailMap || {};

        const rows: UserRow[] = profiles.map((p: any) => {
          const member = members.find((m: any) => m.user_id === p.id);
          return {
            id: p.id,
            name: p.name,
            role: p.role,
            email: emailMap[p.id] || "—",
            familyName: member ? familiesMap[member.family_id] || "—" : "—",
            level: levelsMap[p.id]?.current_level || 0,
            totalXP: levelsMap[p.id]?.total_xp || 0,
            streak: streaksMap[p.id] || 0,
          };
        });
        setUsers(rows);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const filtered = users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || (u.email || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Users</h1>
      <Input placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
      {loading ? <p className="text-gray-500">Loading…</p> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Family</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>XP</TableHead>
              <TableHead>Streak</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-sm text-gray-500">{u.email}</TableCell>
                <TableCell><span className="text-xs px-2 py-0.5 rounded bg-gray-100">{u.role}</span></TableCell>
                <TableCell>{u.familyName}</TableCell>
                <TableCell>{u.level}</TableCell>
                <TableCell>{u.totalXP}</TableCell>
                <TableCell>{u.streak}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
