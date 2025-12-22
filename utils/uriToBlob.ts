export async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri)
  const blob = await response.blob()
  return blob
}
