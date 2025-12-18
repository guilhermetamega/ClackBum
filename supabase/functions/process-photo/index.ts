import { serve } from "https://deno.land/std/http/server.ts";
import {
  ImageMagick,
  initializeImageMagick,
  MagickFormat,
} from "https://esm.sh/@imagemagick/magick-wasm";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

await initializeImageMagick();

serve(async (req) => {
  const { photo_id } = await req.json();

  const { data: photo } = await supabase
    .from("photos")
    .select("original_path")
    .eq("id", photo_id)
    .single();

  if (!photo) {
    return new Response("Photo not found", { status: 404 });
  }

  // 📥 Baixa original
  const { data: originalFile } = await supabase.storage
    .from("photos")
    .download(photo.original_path);

  const buffer = new Uint8Array(await originalFile!.arrayBuffer());

  let previewBuffer!: Uint8Array;

  await ImageMagick.read(buffer, (img) => {
    img.resize(1200, 0);

    img.annotate(
      "© MeuApp",
      (settings) => {
        settings.gravity = "SouthEast";
        settings.fill = "rgba(255,255,255,0.5)";
        settings.fontSize = 36;
      }
    );

    img.write(MagickFormat.Jpeg, (data) => {
      previewBuffer = data;
    });
  });

  const previewPath = photo.original_path.replace(
    "original",
    "preview"
  );

  // 📤 Upload preview
  await supabase.storage.from("photos_preview").upload(
    previewPath,
    previewBuffer,
    { contentType: "image/jpeg", upsert: true }
  );

  // 🗄️ Atualiza DB
  await supabase.from("photos").update({
    preview_path: previewPath,
  }).eq("id", photo_id);

  return new Response("Preview generated", { status: 200 });
});
