import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const jwt = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      },
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(jwt);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const userId = user.id;

    const { data: myPhotos, error: myPhotosError } = await supabase
      .from("photos")
      .select("id, original_path, preview_path")
      .eq("user_id", userId);

    if (myPhotosError) {
      throw myPhotosError;
    }

    const photoIds = (myPhotos ?? []).map((photo) => photo.id);
    const originalPaths = (myPhotos ?? [])
      .map((photo) => photo.original_path)
      .filter(Boolean);
    const previewPaths = (myPhotos ?? [])
      .map((photo) => photo.preview_path)
      .filter(Boolean);

    if (originalPaths.length > 0) {
      const { error } = await supabase.storage
        .from("photos")
        .remove(originalPaths);
      if (error) {
        console.error("Erro ao remover originais:", error);
      }
    }

    if (previewPaths.length > 0) {
      const { error } = await supabase.storage
        .from("photos_public")
        .remove(previewPaths);
      if (error) {
        console.error("Erro ao remover previews:", error);
      }
    }

    if (photoIds.length > 0) {
      const { error: deleteSalesError } = await supabase
        .from("purchases")
        .delete()
        .in("photo_id", photoIds);

      if (deleteSalesError) {
        throw deleteSalesError;
      }
    }

    const { error: deleteMyPurchasesError } = await supabase
      .from("purchases")
      .delete()
      .eq("buyer_id", userId);

    if (deleteMyPurchasesError) {
      throw deleteMyPurchasesError;
    }

    const { error: deleteMyPhotosError } = await supabase
      .from("photos")
      .delete()
      .eq("user_id", userId);

    if (deleteMyPhotosError) {
      throw deleteMyPhotosError;
    }

    const { error: deleteProfileError } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (deleteProfileError) {
      throw deleteProfileError;
    }

    const { error: deleteAuthError } =
      await supabase.auth.admin.deleteUser(userId);

    if (deleteAuthError) {
      throw deleteAuthError;
    }

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("delete-account error:", error);

    return new Response(
      JSON.stringify({
        error: "Não foi possível excluir a conta.",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
