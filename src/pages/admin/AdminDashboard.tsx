import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminQuery } from "@/hooks/useAdminQuery";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface Stats {
  totalFamilies: number;
  totalAdults: number;
  totalChildren: number;
  totalBabies: number;
  tierCounts: Record<string, number>;
  tasksCompletedToday: number;
  tasksCompletedWeek: number;
  totalXP: number;
  recentSignups: number;
}

const COLORS = ["#4E6E5D", "#5B8A9B", "#FF6B35", "#C67B5C"];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminQuery<Stats>({ action: "stats" })
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-500">Loading dashboard…</div>;
  if (!stats) return <div className="text-red-500">Failed to load stats</div>;

  const tierData = Object.entries(stats.tierCounts).map(([name, value]) => ({ name, value }));

  const metricCards = [
    { label: "Families", value: stats.totalFamilies },
    { label: "Adults", value: stats.totalAdults },
    { label: "Children", value: stats.totalChildren },
    { label: "Babies", value: stats.totalBabies },
    { label: "Tasks Today", value: stats.tasksCompletedToday },
    { label: "Tasks This Week", value: stats.tasksCompletedWeek },
    { label: "Total XP Awarded", value: stats.totalXP.toLocaleString() },
    { label: "Signups (30d)", value: stats.recentSignups },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricCards.map((m) => (
          <Card key={m.label} className="border-gray-200">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider">{m.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {tierData.length > 0 && (
        <Card className="border-gray-200">
          <CardHeader><CardTitle className="text-base">Subscription Tiers</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={tierData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {tierData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
