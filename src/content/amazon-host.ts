export function isAmazonHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^www\./, "");
  return (
    h === "amazon.com" ||
    h === "amazon.com.mx" ||
    h.endsWith(".amazon.com") ||
    h.endsWith(".amazon.com.mx")
  );
}
