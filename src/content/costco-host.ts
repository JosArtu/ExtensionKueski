const COSTCO_HOSTNAMES = new Set([
  "costco.com.mx",
  "www.costco.com.mx",
  "costco.com",
  "www.costco.com",
]);

export function isCostcoHost(hostname: string): boolean {
  return COSTCO_HOSTNAMES.has(hostname);
}
