import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { StateMessage } from "@/components/ui/state";

export default function NotFound() {
  return (
    <div className="container py-16">
      <StateMessage
        icon={<FileQuestion />}
        title="Страница не найдена"
        action={
          <>
            <Link href="/search" className={buttonStyles()}>Перейти в каталог</Link>
            <Link href="/" className={buttonStyles({ variant: "secondary" })}>На главную</Link>
          </>
        }
      >
        Возможно, препарат убрали из каталога или ссылка устарела.
      </StateMessage>
    </div>
  );
}
