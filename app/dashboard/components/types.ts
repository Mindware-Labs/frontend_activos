export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"
).replace(/\/$/, "");

export const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export type AccountingEntryLine = {
  id: number;
  accountId: number;
  accountName: string;
  movementType: "DB" | "CR";
  amount: number;
};

export type AccountingEntryGroup = {
  auxiliaryId: string;
  description: string;
  inventoryTypeId: number;
  date: string;
  status: boolean;
  entries: AccountingEntryLine[];
};

export type DepreciationSummaryItem = {
  id: number;
  amountDepreciation: number;
  fixedAsset?: { id: number; name: string };
};

export function formatCurrency(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "RD$ 0.00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "RD$ 0.00";
  return num.toLocaleString("es-DO", {
    style: "currency",
    currency: "DOP",
    maximumFractionDigits: 2,
  });
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "No se pudo completar la operación.";
}

type ApiErrorPayload = {
  message?: string | string[];
  error?: string;
};

async function parseApiError(response: Response) {
  let payload: ApiErrorPayload | null = null;
  try {
    payload = (await response.json()) as ApiErrorPayload;
  } catch {
    payload = null;
  }
  if (!payload)
    return `Error ${response.status}: ${response.statusText || "Solicitud fallida"}`;
  if (Array.isArray(payload.message)) return payload.message.join(", ");
  if (typeof payload.message === "string") return payload.message;
  if (typeof payload.error === "string") return payload.error;
  return `Error ${response.status}: ${response.statusText || "Solicitud fallida"}`;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
