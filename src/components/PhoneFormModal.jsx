import { useState } from "react";
import { Loader2 } from "lucide-react";
import Modal from "./Modal";
import { phoneService } from "../services/phoneService";
import { EDITABLE_STATUSES, STATUS } from "../utils/phoneStatus";
import { todayISO } from "../utils/formatters";
import { getErrorMessage } from "../utils/getErrorMessage";

const STORAGE_OPTIONS = ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"];

// text-base on mobile avoids the iOS zoom-on-focus; sm:text-sm on larger screens
const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base sm:text-sm " +
  "focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

const toForm = (phone) => ({
  imei: phone?.imei ?? "",
  model: phone?.model ?? "",
  storage: phone?.storage ?? "",
  batteryHealth: phone?.batteryHealth ?? "",
  purchasePrice: phone?.purchasePrice ?? "",
  targetPrice: phone?.targetPrice ?? "",
  status: phone?.status ?? "DISPONIBLE",
  purchaseDate: phone?.purchaseDate ?? todayISO(),
  notes: phone?.notes ?? "",
});

function Field({ label, required, className = "", children }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export default function PhoneFormModal({ phone, onClose, onSaved }) {
  const isEdit = !!phone;
  const [form, setForm] = useState(() => toForm(phone));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const set = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const setBattery = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 3);
    const value = digits === "" ? "" : String(Math.min(100, Number(digits)));
    setForm((f) => ({ ...f, batteryHealth: value }));
  };

  const storageOptions =
    form.storage && !STORAGE_OPTIONS.includes(form.storage)
      ? [form.storage, ...STORAGE_OPTIONS]
      : STORAGE_OPTIONS;

  const validate = () => {
    if (!form.imei.trim()) return "El IMEI es obligatorio.";
    if (!form.model.trim()) return "El modelo es obligatorio.";
    if (form.purchasePrice === "" || Number(form.purchasePrice) < 0)
      return "Ingresa un precio de compra válido.";
    if (form.targetPrice !== "" && Number(form.targetPrice) < 0)
      return "El precio objetivo no puede ser negativo.";
    if (
      form.batteryHealth !== "" &&
      (Number(form.batteryHealth) < 0 || Number(form.batteryHealth) > 100)
    )
      return "La batería debe estar entre 0 y 100.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) return setError(problem);

    const payload = {
      imei: form.imei.trim(),
      model: form.model.trim(),
      storage: form.storage || null,
      batteryHealth:
        form.batteryHealth === "" ? null : Number(form.batteryHealth),
      purchasePrice: Number(form.purchasePrice),
      targetPrice: form.targetPrice === "" ? null : Number(form.targetPrice),
      status: form.status,
      purchaseDate: form.purchaseDate || null,
      notes: form.notes.trim() || null,
    };

    setError("");
    setSubmitting(true);
    try {
      const saved = isEdit
        ? await phoneService.update(phone.id, payload)
        : await phoneService.create(payload);
      onSaved(saved, isEdit);
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo guardar el teléfono."));
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "Editar teléfono" : "Nuevo teléfono"}
      onClose={submitting ? () => {} : onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <Field label="Modelo" required className="sm:col-span-2">
          <input
            name="model"
            value={form.model}
            onChange={set}
            className={inputClass}
            autoFocus
          />
        </Field>

        <Field label="IMEI" required className="sm:col-span-2">
          <input
            name="imei"
            value={form.imei}
            onChange={set}
            inputMode="numeric"
            maxLength={15}
            className={`${inputClass} font-mono`}
          />
        </Field>

        <Field label="Capacidad">
          <select
            name="storage"
            value={form.storage}
            onChange={set}
            className={inputClass}
          >
            <option value="">—</option>
            {storageOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Batería (%)">
          <input
            name="batteryHealth"
            value={form.batteryHealth}
            onChange={setBattery}
            inputMode="numeric"
            maxLength={3}
            placeholder="0-100"
            className={inputClass}
          />
        </Field>

        <Field label="Precio de compra" required>
          <input
            type="number"
            name="purchasePrice"
            value={form.purchasePrice}
            onChange={set}
            min="0"
            step="0.01"
            inputMode="decimal"
            className={inputClass}
          />
        </Field>

        <Field label="Precio objetivo de venta">
          <input
            type="number"
            name="targetPrice"
            value={form.targetPrice}
            onChange={set}
            min="0"
            step="0.01"
            inputMode="decimal"
            className={inputClass}
          />
        </Field>

        <Field label="Estado">
          <select
            name="status"
            value={form.status}
            onChange={set}
            className={inputClass}
          >
            {EDITABLE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS[s].label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Fecha de compra">
          <input
            type="date"
            name="purchaseDate"
            value={form.purchaseDate}
            onChange={set}
            className={inputClass}
          />
        </Field>

        <Field label="Notas" className="sm:col-span-2">
          <textarea
            name="notes"
            value={form.notes}
            onChange={set}
            rows={3}
            className={inputClass}
          />
        </Field>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 sm:col-span-2">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 sm:col-span-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Guardar cambios" : "Agregar teléfono"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
