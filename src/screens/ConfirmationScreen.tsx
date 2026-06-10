import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useApp } from "../context/AppContext";
import { formatMXN } from "../mock/data";

// Added the SuccessIcon component helper that was referenced in your snippet
function SuccessIcon() {
  return <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-kueski-100 text-2xl text-kueski-600">✓</div>;
}

export function ConfirmationScreen() {
  const { state, returnToDashboard } = useApp();
  const tx = state.transaction!;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-kueski-200 bg-kueski-50 p-4 text-center">
        <SuccessIcon />
        <h1 className="mt-2 text-lg font-bold text-kueski-900">
          Financiamiento confirmado
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Tu compra en {tx.comercio} quedó registrada.
        </p>
      </div>

      <Card>
        <h2 className="text-xs font-semibold uppercase text-slate-500">
          Resumen
        </h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Comercio</dt>
            <dd className="font-medium">{tx.comercio}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Monto</dt>
            <dd className="font-bold text-kueski-800">{formatMXN(tx.monto)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Plazo</dt>
            <dd>{tx.plazo}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Fecha</dt>
            <dd>{tx.fecha}</dd>
          </div>
        </dl>
        <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500 line-clamp-2">
          {tx.producto}
        </p>
      </Card>

      <Button fullWidth onClick={returnToDashboard}>
        Volver al inicio
      </Button>
    </div>
  );
}