import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminQuery } from "@/hooks/useAdminQuery";
import { toast } from "sonner";

export default function AdminTools() {
  const navigate = useNavigate();
  const [clearId, setClearId] = useState("");
  const [clearing, setClearing] = useState(false);

  const handleClear = async () => {
    if (!clearId.trim()) return;
    setClearing(true);
    try {
      await adminQuery({ action: "delete", table: "families", id: clearId.trim() });
      toast.success("Family deleted");
      setClearId("");
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
    setClearing(false);
  };

  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900">Tools</h1>

      <Card className="border-gray-200">
        <CardHeader><CardTitle className="text-base">Seed Demo Family</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-3">Navigate to the seed page to create a demo family linked to your account.</p>
          <Button onClick={() => navigate("/seed")}>Go to Seed Page</Button>
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardHeader><CardTitle className="text-base">Clear Family Data</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-500">Delete all data for a specific family by ID. Irreversible.</p>
          <Input placeholder="Family UUID" value={clearId} onChange={(e) => setClearId(e.target.value)} />
          <Button variant="destructive" disabled={!clearId.trim() || clearing} onClick={handleClear}>
            {clearing ? "Deleting…" : "Delete Family"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
