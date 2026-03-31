import { useAuth } from "@/hooks/useAuth";
import ParentHome from "@/pages/ParentHome";
import ChildMyDay from "@/pages/ChildMyDay";

export default function HomePage() {
  const { profile } = useAuth();
  return profile?.role === "child" ? <ChildMyDay /> : <ParentHome />;
}
