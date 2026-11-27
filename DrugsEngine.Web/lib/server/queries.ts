import "server-only";
import { cache } from "react";
import { getDataSource } from "./source";

/** Дедупликация запросов в пределах одного рендера (generateMetadata + страница). */
export const getDrug = cache((id: string) => getDataSource().getDrug(id));
export const getPharmacy = cache((id: string) => getDataSource().getPharmacy(id));
