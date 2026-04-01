import { supabase } from "@/integrations/supabase/client";

interface Filter {
  column: string;
  op: "eq" | "gte" | "lte" | "ilike" | "in";
  value: any;
}

interface AdminQueryParams {
  action: string;
  table?: string;
  select?: string;
  filters?: Filter[];
  order?: { column: string; ascending?: boolean };
  limit?: number;
  updates?: Record<string, any>;
  id?: string;
  record?: Record<string, any>;
  rpcName?: string;
  rpcArgs?: Record<string, any>;
}

export async function adminQuery<T = any>(params: AdminQueryParams): Promise<T> {
  const { data, error } = await supabase.functions.invoke("admin-query", {
    body: params,
  });
  if (error) throw new Error(error.message || "Admin query failed");
  return data as T;
}
