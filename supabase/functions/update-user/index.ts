import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface UpdateUserRequest {
  userId: string;
  email?: string;
  password?: string;
  full_name?: string;
  role?: 'learner' | 'instructor' | 'admin';
  organization_id?: string | null;
  is_super_admin?: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("is_super_admin")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.is_super_admin) {
      return new Response(
        JSON.stringify({ error: "Only super admins can update users" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { userId, email, password, full_name, role, organization_id, is_super_admin }: UpdateUserRequest = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing userId" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (userId === user.id && is_super_admin === false) {
      return new Response(
        JSON.stringify({ error: "Cannot remove your own super admin status" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (role && !['learner', 'instructor', 'admin'].includes(role)) {
      return new Response(
        JSON.stringify({ error: "Invalid role. Must be learner, instructor, or admin" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const authUpdates: any = {};
    if (email) authUpdates.email = email;
    if (password) authUpdates.password = password;
    if (full_name) {
      authUpdates.user_metadata = { full_name };
    }

    if (Object.keys(authUpdates).length > 0) {
      const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        authUpdates
      );

      if (updateAuthError) {
        return new Response(
          JSON.stringify({ error: updateAuthError.message || "Failed to update user auth" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    const profileUpdates: any = {};
    if (full_name !== undefined) profileUpdates.full_name = full_name;
    if (role !== undefined) profileUpdates.role = role;
    if (organization_id !== undefined) profileUpdates.organization_id = organization_id;
    if (is_super_admin !== undefined) profileUpdates.is_super_admin = is_super_admin;

    if (Object.keys(profileUpdates).length > 0) {
      const { error: updateProfileError } = await supabaseAdmin
        .from("profiles")
        .update(profileUpdates)
        .eq("id", userId);

      if (updateProfileError) {
        console.error("Error updating profile:", updateProfileError);
        return new Response(
          JSON.stringify({ error: updateProfileError.message || "Failed to update profile" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "User updated successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in update-user function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
