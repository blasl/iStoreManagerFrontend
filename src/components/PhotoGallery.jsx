import { useEffect, useRef, useState } from 'react'
import { Camera, ChevronLeft, ChevronRight, Loader2, Plus, Star, Trash2, X } from 'lucide-react'
import { photoService } from '../services/photoService'
import { compressImage } from '../utils/compressImage'
import { getErrorMessage } from '../utils/getErrorMessage'

const MAX_PHOTOS = 5

const messageOf = (err, fallback) => (err.isAxiosError ? getErrorMessage(err, fallback) : err.message || fallback)

function Viewer({ photos, index, busy, onIndex, onClose, onMakeCover, onDelete }) {
  const photo = photos[index]
  const [confirming, setConfirming] = useState(false)

  useEffect(() => setConfirming(false), [index])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      } else if (e.key === 'ArrowLeft') onIndex((index - 1 + photos.length) % photos.length)
      else if (e.key === 'ArrowRight') onIndex((index + 1) % photos.length)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [index, photos.length, onClose, onIndex])

  const navBtn = 'absolute top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70'

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/95" role="dialog" aria-modal="true">
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="text-sm">
          {index + 1} / {photos.length}
          {index === 0 && ' · Portada'}
        </span>
        <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-lg p-1 hover:bg-white/10">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2">
        {photos.length > 1 && (
          <button
            type="button"
            aria-label="Anterior"
            className={`${navBtn} left-2`}
            onClick={() => onIndex((index - 1 + photos.length) % photos.length)}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        <img src={photo.url} alt={`Foto ${index + 1}`} className="max-h-full max-w-full object-contain" />
        {photos.length > 1 && (
          <button
            type="button"
            aria-label="Siguiente"
            className={`${navBtn} right-2`}
            onClick={() => onIndex((index + 1) % photos.length)}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 px-4 py-4">
        {confirming ? (
          <>
            <span className="text-sm text-white">¿Eliminar esta foto?</span>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDelete(photo)}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Eliminar
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirming(false)}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            {index !== 0 && (
              <button
                type="button"
                disabled={busy}
                onClick={() => onMakeCover(photo)}
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
                Hacer portada
              </button>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirming(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm text-red-300 hover:bg-white/20 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function PhotoGallery({ phone, onChange }) {
  const [initialCount] = useState(phone.photoCount ?? 0)
  const [photos, setPhotos] = useState(initialCount > 0 ? null : [])
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState('')
  const [viewer, setViewer] = useState(null)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (initialCount === 0) return
    let cancelled = false
    photoService
      .list(phone.id)
      .then((data) => !cancelled && setPhotos(data))
      .catch((err) => {
        if (!cancelled) {
          setPhotos([])
          setError(messageOf(err, 'No se pudieron cargar las fotos.'))
        }
      })
    return () => {
      cancelled = true
    }
  }, [phone.id, initialCount])

  const apply = (next) => {
    setPhotos(next)
    onChange(next)
  }

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (files.length === 0) return

    const queue = files.slice(0, MAX_PHOTOS - photos.length)
    const skipped = files.length - queue.length
    let current = photos
    setError('')

    try {
      for (let i = 0; i < queue.length; i++) {
        setProgress({ current: i + 1, total: queue.length })
        const compressed = await compressImage(queue[i])
        const created = await photoService.upload(phone.id, compressed)
        current = [...current, created]
        apply(current)
      }
      if (skipped > 0) setError(`Máximo ${MAX_PHOTOS} fotos: se omitieron ${skipped}.`)
    } catch (err) {
      setError(messageOf(err, 'No se pudo subir la foto.'))
    } finally {
      setProgress(null)
    }
  }

  const makeCover = async (photo) => {
    setBusy(true)
    setError('')
    try {
      const ids = [photo.id, ...photos.filter((p) => p.id !== photo.id).map((p) => p.id)]
      apply(await photoService.reorder(phone.id, ids))
      setViewer(0)
    } catch (err) {
      setError(messageOf(err, 'No se pudo cambiar la portada.'))
    } finally {
      setBusy(false)
    }
  }

  const removePhoto = async (photo) => {
    setBusy(true)
    setError('')
    try {
      await photoService.remove(phone.id, photo.id)
      const next = photos.filter((p) => p.id !== photo.id)
      apply(next)
      setViewer(next.length === 0 ? null : Math.min(viewer, next.length - 1))
    } catch (err) {
      setError(messageOf(err, 'No se pudo eliminar la foto.'))
    } finally {
      setBusy(false)
    }
  }

  const uploading = progress !== null

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Fotos</h3>
        <span className="text-xs text-slate-500">
          {photos ? photos.length : initialCount}/{MAX_PHOTOS}
        </span>
      </div>

      {photos === null ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {Array.from({ length: Math.min(initialCount, MAX_PHOTOS) }, (_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-lg bg-slate-200" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setViewer(i)}
              className="relative aspect-square overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200"
            >
              <img
                src={p.thumbUrl}
                alt={`Foto ${i + 1} de ${phone.model}`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Portada
                </span>
              )}
            </button>
          ))}

          {uploading && (
            <div className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg bg-slate-50 text-xs text-slate-500 ring-1 ring-slate-200">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
              {progress.current}/{progress.total}
            </div>
          )}

          {photos.length < MAX_PHOTOS && !uploading && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-xs text-slate-500 hover:border-indigo-400 hover:text-indigo-600"
            >
              <Plus className="h-5 w-5" />
              Agregar
            </button>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      {photos && photos.length === 0 && !uploading && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
          <Camera className="h-3.5 w-3.5" />
          Este teléfono no tiene fotos. Agrega al menos una para mostrarlo mejor.
        </p>
      )}

      {error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {viewer !== null && photos?.[viewer] && (
        <Viewer
          photos={photos}
          index={viewer}
          busy={busy}
          onIndex={setViewer}
          onClose={() => setViewer(null)}
          onMakeCover={makeCover}
          onDelete={removePhoto}
        />
      )}
    </section>
  )
}