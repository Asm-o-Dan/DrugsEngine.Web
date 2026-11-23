export type DataSourceErrorKind = "unavailable" | "timeout" | "http" | "bad_response";

/** Ошибка получения данных. Сообщение для пользователя формируется в error.tsx по kind. */
export class DataSourceError extends Error {
  constructor(
    public readonly kind: DataSourceErrorKind,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "DataSourceError";
  }
}
