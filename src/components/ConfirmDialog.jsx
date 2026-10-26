import { Loader2 } from 'lucide-react'
import Modal from './Modal'

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Eliminar',
  busy = false,
  error = '',
  onConfirm,
  onCancel,
}) {
  return (
    <Modal title={title} onClose={busy ? () => {} : onCancel}>
      <p className="text-sm text-slate-600">{message}</p>

      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}