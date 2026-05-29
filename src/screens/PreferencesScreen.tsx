import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useApp } from "../context/AppContext";
import type { AlertIntensity, Preferences } from "../types";

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {description && (
          <p className="text-xs text-slate-500">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked ? "bg-kueski-600" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </label>
  );
}

export function PreferencesScreen() {
  const { state, updatePreferences, navigate, logout } = useApp();
  const [draft, setDraft] = useState<Preferences>(state.preferences);
  const [saved, setSaved] = useState(false);

  const save = () => {
    updatePreferences(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <Card>
        <Toggle
          label="Notificaciones"
          description="Alertas al detectar tiendas como Amazon"
          checked={draft.notificaciones}
          onChange={(notificaciones) =>
            setDraft((d) => ({ ...d, notificaciones }))
          }
        />
        <div className="border-t border-slate-100 pt-2">
          <p className="text-sm font-medium text-slate-800">Intensidad de alertas</p>
          <div className="mt-2 flex gap-2">
            {(["subtle", "standard"] as AlertIntensity[]).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setDraft((d) => ({ ...d, intensidad: level }))}
                className={`flex-1 rounded-lg border py-2 text-xs font-semibold capitalize ${
                  draft.intensidad === level
                    ? "border-kueski-500 bg-kueski-50 text-kueski-800"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                {level === "subtle" ? "Sutil" : "Estándar"}
              </button>
            ))}
          </div>
        </div>
        <div className="border-t border-slate-100">
          <Toggle
            label="Datos de navegación"
            description="Permitir análisis anónimo para mejorar ofertas"
            checked={draft.compartirDatos}
            onChange={(compartirDatos) =>
              setDraft((d) => ({ ...d, compartirDatos }))
            }
          />
        </div>
        <div className="border-t border-slate-100">
          <Toggle
            label="Tema oscuro"
            checked={draft.temaOscuro}
            onChange={(temaOscuro) => setDraft((d) => ({ ...d, temaOscuro }))}
          />
        </div>
      </Card>

      <Button fullWidth onClick={save}>
        {saved ? "Guardado ✓" : "Guardar preferencias"}
      </Button>
      <Button fullWidth variant="secondary" onClick={() => navigate("dashboard")}>
        Volver al inicio
      </Button>
      <Button fullWidth variant="danger" onClick={logout}>
        Cerrar sesión
      </Button>
    </div>
  );
}
