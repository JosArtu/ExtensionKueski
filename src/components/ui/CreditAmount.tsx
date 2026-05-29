import { formatMXN } from "../../mock/data";

export function CreditAmount({
  amount,
  label = "Crédito disponible",
  size = "lg",
}: {
  amount: number;
  label?: string;
  size?: "md" | "lg";
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className={
          size === "lg"
            ? "text-3xl font-bold tracking-tight text-kueski-800"
            : "text-xl font-bold text-kueski-800"
        }
      >
        {formatMXN(amount)}
      </p>
    </div>
  );
}
