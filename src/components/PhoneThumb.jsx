import { Camera } from 'lucide-react'

export default function PhoneThumb({ phone, className = 'h-12 w-12' }) {
  if (phone.thumbnailUrl) {
    return (
      <img
        src={phone.thumbnailUrl}
        alt={phone.model}
        loading="lazy"
        className={`${className} shrink-0 rounded-lg bg-slate-100 object-cover ring-1 ring-slate-200`}
      />
    )
  }
  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-300`}
    >
      <Camera className="h-5 w-5" />
    </div>
  )
}