import { supabase } from '@/lib/supabaseClient'
import { uriToBlob } from '@/utils/uriToBlob'
import { generateWatermark } from '@/utils/watermark'
import { useState } from 'react'
import { Platform } from 'react-native'

type UploadParams = {
  file: File | { uri: string }
  title: string
  description?: string
  price: number
  tags?: string[]
  visibility?: 'public' | 'private' | 'unlisted'
}

export function usePhotoUpload() {
  const [loading, setLoading] = useState(false)

  const uploadPhoto = async ({
    file,
    title,
    description,
    price,
    tags = [],
    visibility = 'private',
  }: UploadParams) => {
    try {
      setLoading(true)

      /* =========================
         AUTH (ESSENCIAL)
      ========================= */
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error('Usuário não autenticado')
      }

      const photoId = crypto.randomUUID()

      const { preview, original } = await generateWatermark(file)

      /* =========================
         NORMALIZA PARA BLOB
      ========================= */
      const originalBlob =
        Platform.OS === 'web'
          ? (original as File)
          : await uriToBlob((original as any).uri)

      const previewBlob =
        Platform.OS === 'web'
          ? (preview as Blob)
          : await uriToBlob((preview as any).uri)

      /* =========================
         UPLOAD ORIGINAL (PRIVADO)
      ========================= */
      const { error: originalError } = await supabase.storage
        .from('photos')
        .upload(`${user.id}/${photoId}/original.jpg`, originalBlob, {
          contentType: 'image/jpeg',
        })

      if (originalError) throw originalError

      /* =========================
         UPLOAD PREVIEW (PÚBLICO)
      ========================= */
      const { error: previewError } = await supabase.storage
        .from('photos_public')
        .upload(`${user.id}/${photoId}/preview.jpg`, previewBlob, {
          contentType: 'image/jpeg',
        })

      if (previewError) throw previewError

      /* =========================
         DATABASE (COM user_id)
      ========================= */
      const { error: dbError } = await supabase
        .from('photos')
        .insert({
          id: photoId,
          user_id: user.id, // 🔥 ISSO RESOLVE O 403
          title,
          description,
          price,
          tags,
          visibility,
          status: 'pending',
          preview_path: `${user.id}/${photoId}/preview.jpg`,
          original_path: `${user.id}/${photoId}/original.jpg`,
        })

      if (dbError) throw dbError

      return photoId
    } finally {
      setLoading(false)
    }
  }

  return { uploadPhoto, loading }
}
