import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useApp } from "../context/AppContext";
import { AMAZON_STORE, COSTCO_STORE, formatMXN } from "../mock/data";

export function StoreDetectionScreen() {
  const { state, dismissStoreDetection, navigate } = useApp();
  const { product, costcoActive } = state;

  // Select store based on the active state
  const store = costcoActive ? COSTCO_STORE : AMAZON_STORE;

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border p-4 ${costcoActive ? "border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50" : "border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50"}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
            {store.logo}
          </div>
          <div>
            <p className={`text-xs font-medium uppercase ${costcoActive ? "text-blue-700" : "text-orange-700"}`}>
              Tienda detectada
            </p>
            <h1 className="text-lg font-bold text-slate-900">{store.nombre}</h1>
            <p className="text-xs text-slate-600">{store.dominio}</p>
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

      <Button fullWidth onClick={() => navigate("activeOffer")}>
        Ver beneficios en {store.nombre}
      </Button>
      <Button fullWidth variant="ghost" onClick={dismissStoreDetection}>
        Cerrar
      </Button>
    </div>
  );
}