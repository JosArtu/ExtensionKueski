import type { AmazonProduct } from "../types";

export const SESSION_TTL_MS = 30 * 60 * 1000;

export interface AmazonSession {
  detected: boolean;
  product: AmazonProduct;
  url: string;
  hostname: string;
  at: number;
}

export type ExtensionMessage =
  | {
      type: "AMAZON_DETECTED";
      product: AmazonProduct;
      url: string;
      hostname: string;
    }
  | { type: "GET_AMAZON_SESSION" }
  | { type: "CLEAR_AMAZON_SESSION" };

export type ExtensionResponse =
  | { ok: true; session: AmazonSession | null }
  | { ok: true }
  | { ok: false; error: string };

export function isAmazonHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^www\./, "");
  return (
    h === "amazon.com" ||
    h === "amazon.com.mx" ||
    h.endsWith(".amazon.com") ||
    h.endsWith(".amazon.com.mx")
  );
}

export function isSessionValid(session: AmazonSession | null | undefined): boolean {
  if (!session?.detected) return false;
  return Date.now() - session.at < SESSION_TTL_MS;
}
