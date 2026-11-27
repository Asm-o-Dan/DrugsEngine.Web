"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CloudOff } from "lucide-react";
import { Button, buttonStyles } from "@/components/ui/button";
import { StateMessage } from "@/components/ui/state";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container py-16">
      <StateMessage
        tone="danger"
        icon={<CloudOff />}
        title="Не удалось загрузить данные"
        action={
          <>
            <Button onClick={reset}>Попробовать снова</Button>
            <Link href="/status" className={buttonStyles({ variant: "secondary" })}>
              Состояние сервиса
            </Link>
          </>
        }
      >
        Сервис цен временно не отвечает. Обычно это проходит за пару минут.
        {error.digest ? <span className="mt-2 block font-mono text-xs text-ink-3">Код ошибки: {error.digest}</span> : null}
      </StateMessage>
    </div>
  );
}
