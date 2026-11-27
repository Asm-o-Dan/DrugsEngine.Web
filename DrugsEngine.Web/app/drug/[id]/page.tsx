import { permanentRedirect } from "next/navigation";

/** Старый адрес карточки препарата — сохраняем ссылки рабочими. */
export default async function LegacyDrugPage({ params }: { params: Promise<{ id: string }> }) {
  permanentRedirect(`/drugs/${encodeURIComponent((await params).id)}`);
}
