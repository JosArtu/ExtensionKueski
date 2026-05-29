import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useApp } from "../context/AppContext";
import { AMAZON_STORE, formatMXN } from "../mock/data";

export function StoreDetectionScreen() {
  const { state, dismissStoreDetection, navigate } = useApp();
  const { product } = state;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
            {AMAZON_STORE.logo}
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-orange-700">
              Tienda detectada
            </p>
            <h1 className="text-lg font-bold text-slate-900">{AMAZON_STORE.nombre}</h1>
            <p className="text-xs text-slate-600">{AMAZON_STORE.dominio}</p>
          </div>
        </div>
      </div>

      <Card>
        <p className="text-xs text-slate-500">Producto en esta página</p>
        <p className="mt-1 text-sm font-medium text-slate-800 line-clamp-2">
          {product.nombre}
        </p>
        <p className="mt-2 text-lg font-bold text-kueski-800">
          {formatMXN(product.precio)}
        </p>
      </Card>

      <p className="text-sm text-slate-600">
        Tienes una promoción Kueski disponible en Amazon. Puedes verla ahora o ignorarla.
      </p>

      <Button fullWidth onClick={() => navigate("activeOffer")}>
        Ver oferta en Amazon
      </Button>
      <Button fullWidth variant="ghost" onClick={dismissStoreDetection}>
        Ignorar por ahora
      </Button>
    </div>
  );
}
