import { supabase } from "./supabase";

export async function testSupabase() {
  const { data, error } = await supabase
    .from("companies")
    .select("*");

  console.log("DATA:", data);
  console.log("ERROR:", error);
}