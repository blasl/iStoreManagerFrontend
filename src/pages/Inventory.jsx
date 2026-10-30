import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, PackageOpen, Plus, Search } from 'lucide-react'
import { phoneService } from '../services/phoneService'
import { FILTER_TABS } from '../utils/phoneStatus'
import { getErrorMessage } from '../utils/getErrorMessage'
import StatusTabs from '../components/StatusTabs'
import PhoneTable from '../components/PhoneTable'
import PhoneFormModal from '../components/PhoneFormModal'
import PhoneDetailModal from '../components/PhoneDetailModal'
import SellModal from '../components/SellModal'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Inventory() {
  const [phones, setPhones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const [formState, setFormState] = useState({ open: false, phone: null })
  const [detailId, setDetailId] = useState(null)
  const [sellId, setSellId] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const load = useCallback(async () => {
    try {
      setPhones(await phoneService.getActive())
      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo cargar el inventario.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const retry = () => {
    setLoading(true)
    load()
  }

  const counts = useMemo(() => {
    const c = { ALL: phones.length, DISPONIBLE: 0, EN_REPARACION: 0, RESERVADO: 0, VENDIDO: 0 }
    phones.forEach((p) => {
      if (c[p.status] !== undefined) c[p.status]++
    })
    return c
  }, [phones])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return phones
      .filter((p) => filter === 'ALL' || p.status === filter)
      .filter((p) => !q || p.model.toLowerCase().includes(q) || p.imei.includes(q))
      .sort((a, b) => b.id - a.id)
  }, [phones, filter, search])

  const detailPhone = phones.find((p) => p.id === detailId)
  const sellPhone = phones.find((p) => p.id === sellId)

  // --- phone form ---
  const openCreate = () => setFormState({ open: true, phone: null })
  const openEdit = (phone) => {
    setDetailId(null)
    setFormState({ open: true, phone })
  }
  const closeForm = () => setFormState({ open: false, phone: null })

  const handleSaved = (saved, wasEdit) => {
    setPhones((prev) => (wasEdit ? prev.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...prev]))
    closeForm()
  }

  // --- detail / expenses ---
  const handleExpensesChange = (phoneId, total) =>
    setPhones((prev) => prev.map((p) => (p.id === phoneId ? { ...p, totalExpenses: total } : p)))

  // --- sale ---
  const openSell = (phone) => {
    setDetailId(null)
    setSellId(phone.id)
  }
  const handleSold = (sale) => {
    setPhones((prev) => prev.map((p) => (p.id === sale.phone.id ? sale.phone : p)))
    setSellId(null)
  }

  // --- delete ---
  const askDelete = (phone) => {
    setDeleteError('')
    setDeleting(phone)
  }

  const confirmDelete = async () => {
    setDeleteBusy(true)
    setDeleteError('')
    try {
      await phoneService.remove(deleting.id)
      setPhones((prev) => prev.filter((p) => p.id !== deleting.id))
      setDeleting(null)
    } catch (err) {
      setDeleteError(getErrorMessage(err, 'No se pudo eliminar el teléfono.'))
    } finally {
      setDeleteBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventario</h1>
          <p className="text-sm text-slate-500">
            {loading ? 'Cargando…' : `${phones.length} ${phones.length === 1 ? 'teléfono' : 'teléfonos'}`}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Agregar
        </button>
      </div>

      <StatusTabs tabs={FILTER_TABS} counts={counts} active={filter} onChange={setFilter} />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por modelo o IMEI"
          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:text-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={retry}
            className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
          >
            Reintentar
          </button>
        </div>
      ) : phones.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
          <PackageOpen className="h-10 w-10 text-slate-300" />
          <p className="mt-3 font-medium text-slate-700">Aún no tienes teléfonos</p>
          <p className="text-sm text-slate-500">Agrega el primero para empezar a controlar tu stock.</p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Agregar teléfono
          </button>
        </div>
      ) : visible.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
          No hay teléfonos que coincidan con el filtro.
        </p>
      ) : (
        <PhoneTable
          phones={visible}
          onOpen={(p) => setDetailId(p.id)}
          onSell={openSell}
          onEdit={openEdit}
          onDelete={askDelete}
        />
      )}

      {formState.open && (
        <PhoneFormModal
          key={formState.phone?.id ?? 'new'}
          phone={formState.phone}
          onClose={closeForm}
          onSaved={handleSaved}
        />
      )}

      {detailPhone && (
        <PhoneDetailModal
          key={detailPhone.id}
          phone={detailPhone}
          onClose={() => setDetailId(null)}
          onEdit={openEdit}
          onSell={openSell}
          onExpensesChange={handleExpensesChange}
        />
      )}

      {sellPhone && (
        <SellModal key={sellPhone.id} phone={sellPhone} onClose={() => setSellId(null)} onSold={handleSold} />
      )}

      {deleting && (
        <ConfirmDialog
          title="Eliminar teléfono"
          message={`¿Seguro que quieres eliminar el ${deleting.model} (IMEI ${deleting.imei})? Dejará de aparecer en tu inventario.`}
          busy={deleteBusy}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  )
}