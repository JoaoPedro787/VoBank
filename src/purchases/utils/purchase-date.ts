/**
 * Utilitários para formatação, máscara e manipulação de datas de compra no padrão brasileiro (DD/MM/AAAA).
 */

/**
 * Aplica máscara progressiva DD/MM/AAAA em dígitos inseridos pelo usuário.
 */
export function maskDateBR(text: string): string {
  const digits = text.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/**
 * Valida se uma string está no formato DD/MM/AAAA e representa uma data real válida no calendário.
 */
export function isValidDateBR(text: string): boolean {
  return parseDateBR(text) !== null;
}

/**
 * Converte uma string DD/MM/AAAA em um objeto Date seguro (meio-dia UTC)
 * para evitar distorções de fuso horário. Retorna null se for inválida.
 */
export function parseDateBR(text: string): Date | null {
  const clean = text.trim();
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(clean);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (year < 1900 || year > 2100) return null;
  if (month < 1 || month > 12) return null;

  // Verifica o número máximo de dias do mês (considerando ano bissexto)
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day < 1 || day > daysInMonth) return null;

  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

/**
 * Formata um Date ou string ISO para o padrão DD/MM/AAAA.
 */
export function formatDateBR(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Retorna a data atual local formatada como DD/MM/AAAA.
 */
export function getTodayBR(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Retorna a data de ontem local formatada como DD/MM/AAAA.
 */
export function getYesterdayBR(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
