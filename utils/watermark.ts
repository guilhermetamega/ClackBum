export async function generateWatermark(
  file: File | { uri: string }
): Promise<{ original: File | Blob; preview: Blob }> {
  // =========================
  // ORIGINAL (SEM ALTERAÇÃO)
  // =========================
  const original =
    file instanceof File
      ? file
      : await fetch(file.uri).then((r) => r.blob())

  // =========================
  // LOAD IMAGE
  // =========================
  const imageUrl =
    file instanceof File ? URL.createObjectURL(file) : file.uri

  const img = new Image()
  img.src = imageUrl
  await new Promise((res) => (img.onload = res))

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!

  canvas.width = img.width
  canvas.height = img.height

  ctx.drawImage(img, 0, 0)

  const text = "CLACKBUM"

  // =========================
  // CONFIG GLOBAL
  // =========================
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  const minSide = Math.min(canvas.width, canvas.height)

  // =========================
  // CENTRO (GRANDE)
  // =========================
  const centerFontSize = minSide * 0.2
  ctx.font = `bold ${centerFontSize}px Arial`

  ctx.fillText(
    text,
    canvas.width / 2,
    canvas.height / 2
  )

  // =========================
  // CANTOS (MENORES)
  // =========================
  const cornerFontSize = minSide * 0.045
  ctx.font = `bold ${cornerFontSize}px Arial`

  const padding = cornerFontSize * 0.8

  // superior esquerdo
  ctx.fillText(text, padding, padding)

  // superior direito
  ctx.fillText(text, canvas.width - padding, padding)

  // inferior esquerdo
  ctx.fillText(text, padding, canvas.height - padding)

  // inferior direito
  ctx.fillText(
    text,
    canvas.width - padding,
    canvas.height - padding
  )

  const previewBlob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.8)
  )

  URL.revokeObjectURL(imageUrl)

  return {
    original,
    preview: previewBlob,
  }
}
