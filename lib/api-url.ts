function buildApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
  const trimmed = raw.trim().replace(/\/$/, "");

  // Si no tiene protocolo, se agrega https:// para evitar que se trate como ruta relativa
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

export const API_BASE_URL = buildApiBaseUrl();
