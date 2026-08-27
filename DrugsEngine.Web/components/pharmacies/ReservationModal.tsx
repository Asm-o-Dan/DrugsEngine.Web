"use client";

import * as React from "react";
import { PharmacyDto, ReservationResponse } from "@/contracts/contracts";
import { apiClient } from "@/lib/apiClient";
import {
  X,
  CheckCircle2,
  Clock,
  MapPin,
  Pill,
  ShieldCheck,
  Loader2,
  Copy,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pharmacy: PharmacyDto | null;
  selectedDrugId?: string;
  selectedDrugName?: string;
  drugPrice?: number;
}

export function ReservationModal({
  isOpen,
  onClose,
  pharmacy,
  selectedDrugId,
  selectedDrugName,
  drugPrice = 320,
}: ReservationModalProps) {
  const [quantity, setQuantity] = React.useState(1);
  const [customerName, setCustomerName] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [reservation, setReservation] = React.useState<ReservationResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Reset state on open
  React.useEffect(() => {
    if (isOpen) {
      setReservation(null);
      setError(null);
      setQuantity(1);
    }
  }, [isOpen]);

  if (!isOpen || !pharmacy) return null;

  const effectiveDrugName =
    pharmacy.inventory?.drugName || selectedDrugName || "Нурофен Экспресс 200мг №24";
  const effectiveDrugId =
    pharmacy.inventory?.drugId || selectedDrugId || "e4b9d7a2-1a2c-49e3-85f0-61b6c7a10001";
  const unitPrice = pharmacy.inventory?.price || drugPrice;
  const totalPrice = unitPrice * quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setError("Пожалуйста, заполните имя и номер телефона");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await apiClient.createReservation(pharmacy.id, {
        drugId: effectiveDrugId,
        quantity,
        customerName,
        customerPhone,
        comment: comment.trim() || undefined,
      });
      setReservation(res);
    } catch (err: any) {
      setError(err.message || "Не удалось оформить бронирование");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (reservation?.pickupCode && navigator.clipboard) {
      navigator.clipboard.writeText(reservation.pickupCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Confirmation State */}
        {reservation ? (
          <div className="space-y-6 text-center py-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div className="space-y-1">
              <Badge variant="generic" className="mb-2">
                Бронирование подтверждено
              </Badge>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Заказ успешно зарезервирован!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Препарат отложен в аптеке и готов к выдаче.
              </p>
            </div>

            {/* Pickup Code Box */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-5 dark:border-emerald-500/20 dark:bg-emerald-950/20 space-y-2">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Код получения заказа
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white tracking-wider">
                  {reservation.pickupCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200"
                  title="Скопировать код"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              {copied && (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
                  Код скопирован в буфер обмена
                </span>
              )}
            </div>

            {/* Order details summary */}
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 text-left text-xs space-y-2 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Препарат:</span>
                <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                  {reservation.item.drugName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Количество:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {reservation.item.quantity} уп.
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Сумма к оплате:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                  {reservation.item.totalPrice} ₽
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Аптека:</span>
                <span className="font-semibold text-slate-900 dark:text-white text-right max-w-[200px]">
                  {reservation.pharmacy.displayName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Адрес:</span>
                <span className="text-slate-700 dark:text-slate-300 text-right max-w-[200px]">
                  {reservation.pharmacy.address}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40 text-left flex items-start gap-2">
              <Clock className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                Бронь действует <strong>24 часа</strong>. Назовите код <strong>{reservation.pickupCode}</strong> фармацевту на кассе.
              </span>
            </div>

            <Button onClick={onClose} className="w-full bg-emerald-600 text-white">
              Готово
            </Button>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Экспресс-бронь без предоплаты
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                Забронировать препарат
              </h3>
            </div>

            {/* Pharmacy & Drug summary card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-sm">
                  <Pill className="h-4 w-4 text-emerald-500" />
                  <span className="truncate max-w-[240px]">{effectiveDrugName}</span>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {unitPrice} ₽ / уп.
                </span>
              </div>

              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <MapPin className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                <span>{pharmacy.displayName} ({pharmacy.address.formatted})</span>
              </div>
            </div>

            {/* Quantity selector */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  Количество упаковок
                </span>
                <span className="text-[11px] text-slate-400">Максимум 5 уп. на бронь</span>
              </div>

              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuantity(num)}
                    className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                      quantity === num
                        ? "bg-emerald-600 text-white shadow-sm dark:bg-emerald-500"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Price Display */}
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Итого к оплате при получении:
              </span>
              <span className="font-mono text-xl font-extrabold text-slate-900 dark:text-white">
                {totalPrice} ₽
              </span>
            </div>

            {/* Customer Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Имя получателя *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Иван Петров"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800/80 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Телефон для СМС с кодом *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+7 (999) 000-00-00"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800/80 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Комментарий (необязательно)
                </label>
                <input
                  type="text"
                  placeholder="Например, заберу после 18:00"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800/80 dark:text-white"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-1/3"
                disabled={isSubmitting}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-md shadow-emerald-600/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Бронируем...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" /> Зарезервировать
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
