import type { CompanySettings } from "../types/erp";

type Currency = CompanySettings["currency"];

let activeCurrency: Currency = "USD";
const currencyFormatters = new Map<Currency, Intl.NumberFormat>();

const numberFormatter = new Intl.NumberFormat("ar");
const dateFormatter = new Intl.DateTimeFormat("ar", { year: "numeric", month: "short", day: "numeric" });

export function setActiveCurrency(currency: Currency) {
  activeCurrency = currency;
}

export function formatCurrency(value: number, currency: Currency = activeCurrency) {
  let formatter = currencyFormatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat("ar", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "YER" ? 0 : 2,
    });
    currencyFormatters.set(currency, formatter);
  }

  return formatter.format(value);
}

export function formatNumber(value: number) {
  return numberFormatter.format(value);
}

export function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}
