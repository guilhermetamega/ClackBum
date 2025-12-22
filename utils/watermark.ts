export async function generateWatermark(
  file: File | { uri: string }
): Promise<{ original: File | Blob; preview: Blob }> {
  /* =========================
     ORIGINAL
  ========================= */
  const original =
    file instanceof File
      ? file
      : await fetch(file.uri).then((r) => r.blob())

  /* =========================
     LOAD IMAGE
  ========================= */
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

  /* =========================
     WATERMARK CONFIG
  ========================= */
  const text = "CLACKBUM"
  const angle = (-35 * Math.PI) / 180

  const minSide = Math.min(canvas.width, canvas.height)
  const fontSize = minSide * 0.15
  const gapX = fontSize * 7
  const gapY = fontSize * 2

  ctx.font = `bold ${fontSize}px Arial`
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  /* =========================
     ROTATE + ALTERNATED STRIPES
  ========================= */
  ctx.save()
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate(angle)

  const diagonal = Math.sqrt(
    canvas.width ** 2 + canvas.height ** 2
  )

  let row = 0

  for (let y = -diagonal; y < diagonal; y += gapY) {
    const offsetX = row % 2 === 0 ? 0 : gapX / 2

    for (let x = -diagonal; x < diagonal; x += gapX) {
      ctx.fillText(text, x + offsetX, y)
    }

    row++
  }

  ctx.restore()

  /* =========================
     EXPORT
  ========================= */
  const previewBlob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.8)
  )

  URL.revokeObjectURL(imageUrl)

  return {
    original,
    preview: previewBlob,
  }
}
