import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useApp } from "../context/AppContext";
import { formatMXN, NEXT_PROMO_SUGGESTION } from "../mock/data";

export function ConfirmationScreen() {
  const { state, navigate, resetAmazonFlow } = useApp();
  const tx = state.transaction!;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-kueski-200 bg-kueski-50 p-4 text-center">
        <SuccessIcon />
        <h1 className="mt-2 text-lg font-bold text-kueski-900">
          Financiamiento confirmado
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Tu compra en Amazon quedó registrada.
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

      <Card className="border-dashed border-kueski-300 bg-kueski-50/30">
        <p className="text-xs font-medium text-kueski-800">Próxima promoción</p>
        <p className="mt-1 text-sm font-semibold text-slate-800">
          {NEXT_PROMO_SUGGESTION.titulo}
        </p>
        <p className="text-xs text-slate-500">
          {NEXT_PROMO_SUGGESTION.tienda} · {NEXT_PROMO_SUGGESTION.vigencia}
        </p>
      </Card>

      <Button
        fullWidth
        onClick={() => {
          resetAmazonFlow();
          navigate("dashboard");
        }}
      >
        Volver al inicio
      </Button>
    </div>
  );
}

function SuccessIcon() {
  return (
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-kueski-500 text-xl text-white">
      ✓
    </div>
  );
}
