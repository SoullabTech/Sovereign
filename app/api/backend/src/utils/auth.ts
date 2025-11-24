import { supabase } from "../lib/supabase";

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    // Check if user has admin role
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role_id")
      .eq("user_id", userId)
      .single();

    if (rolesError || !roles) {
      return false;
    }

    // Verify the role is admin
    const { data: roleType, error: roleTypeError } = await supabase
      .from("role_types")
      .select("name")
      .eq("id", roles.role_id)
      .single();

    return !roleTypeError && roleType?.name === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}
