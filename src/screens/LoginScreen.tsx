import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useApp } from "../context/AppContext";
import { getAmazonSession, getCostcoSession } from "../extension/session";
import { isSessionValid } from "../extension/messages";

// ─── Supabase client (misma instancia que data.ts) ────────────────────────────
const supabase = createClient(
  "https://ydldbyqxcznrgrroxxdl.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "sb_publishable_JFGwgPM0uok9ix9vZGmEoA_FaImHo4u"
);

export function LoginScreen() {
  const { 
    state, 
    requestVerification, 
    verifyCode, 
    cancelVerification, 
    setPendingUser,
    amazonVisitFromTab, // Para forzar redirección de Amazon
    costcoVisitFromTab  // Para forzar redirección de Costco
  } = useApp();
  
  const [correo, setCorreo] = useState("usuario@email.com");
  const [codeInput, setCodeInput] = useState("");

  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const onVerifyStep = state.pendingVerificationCode != null;

  // ─── Paso 1: validar correo en Supabase, luego solicitar OTP ─────────────
  const handleLogin = async () => {
    const email = correo.trim() || "usuario@email.com";
    setEmailError(null);
    setIsCheckingEmail(true);

    try {
      const { data, error } = await supabase
        .from("usuario")
        .select("id_usuario, nombre, apellidos, correo, limite_de_credito, tipo_usuario")
        .ilike("correo", email)
        .limit(1);

      if (error) {
        console.error("❌ Error consultando usuario:", error.message);
        setEmailError("No pudimos verificar tu correo. Intenta de nuevo.");
        return;
      }

      if (!data || data.length === 0) {
        setEmailError("No encontramos una cuenta con ese correo. Verifica e intenta de nuevo.");
        return;
      }

      // Correo válido → guardamos el usuario en el contexto antes del OTP
      const u = data[0];
      setPendingUser({
        id: String(u.id_usuario),
        nombre: u.nombre,
        apellidos: u.apellidos,
        correo: u.correo,
        creditoDisponible: u.limite_de_credito,
        tipo_usuario: u.tipo_usuario ?? "standard",
      });

      requestVerification(email);
      setCodeInput("");
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // ─── Paso 2: verificar el código OTP e interceptar sesión ────────────────
  const handleVerify = async () => {
    let sessionToApply = null;
    let detectedStore: "amazon" | "costco" | null = null;

    if (typeof chrome !== "undefined" && chrome.runtime && chrome.tabs) {
      try {
        // 1. Buscamos en memoria del Service Worker primero (Amazon o Costco)
        const amazonSession = await getAmazonSession();
        if (isSessionValid(amazonSession) && amazonSession) {
          sessionToApply = amazonSession;
          detectedStore = "amazon";
        } else {
          const costcoSession = await getCostcoSession();
          if (isSessionValid(costcoSession) && costcoSession) {
            sessionToApply = costcoSession;
            detectedStore = "costco";
          }
        }

        // 2. FALLBACK INTELIGENTE: Consultamos la pestaña activa si no hay nada en memoria
        if (!sessionToApply) {
          const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
          
          if (activeTab && activeTab.url && activeTab.id) {
            const isAmazon = activeTab.url.includes("amazon.com") || activeTab.url.includes("amazon.com.mx");
            const isCostco = activeTab.url.includes("costco.com") || activeTab.url.includes("costco.com.mx");

            if (isAmazon || isCostco) {
              let scrapedPrice = 1299; // Precio base en caso de error

              try {
                // Inyectamos un script para leer el precio. Pasamos 'isAmazon' como argumento.
                const injectionResults = await chrome.scripting.executeScript({
                  target: { tabId: activeTab.id },
                  args: [isAmazon],
                  func: (isAmazonContext) => {
                    if (isAmazonContext) {
                      // Scraper para Amazon
                      const selectors = [
                        ".a-price .a-offscreen", 
                        "#corePriceDisplay_desktop_feature_div .a-offscreen", 
                        "#priceblock_ourprice"
                      ];
                      for (const sel of selectors) {
                        const el = document.querySelector(sel);
                        if (el && el.textContent) {
                          const text = el.textContent.replace(/[^\d.,]/g, "");
                          const clean = text.replace(/,/g, ""); 
                          const val = parseFloat(clean);
                          if (!isNaN(val) && val > 0) return val;
                        }
                      }
                    } else {
                      // Scraper para Costco
                      // Prioridad: Meta tag en el HTML estático
                      const meta = document.querySelector('meta[property="product:price:amount"]') || 
                                   document.querySelector('meta[name="product:price:amount"]');
                      if (meta) {
                        const val = parseFloat((meta as HTMLMetaElement).content);
                        if (!isNaN(val) && val > 0) return val;
                      }

                      // Secundario: DOM renderizado por Spartacus
                      const selectors = [
                        "cx-price .value",
                        "cx-product-price .value",
                        ".price-value",
                        "[itemprop='price']"
                      ];
                      for (const sel of selectors) {
                        const el = document.querySelector(sel);
                        if (el && el.textContent) {
                          const text = el.textContent.replace(/[^\d.,]/g, "");
                          const clean = text.replace(/,/g, ""); 
                          const val = parseFloat(clean);
                          if (!isNaN(val) && val > 0) return val;
                        }
                      }
                    }
                    return null;
                  }
                });
                
                if (injectionResults && injectionResults[0].result) {
                  scrapedPrice = injectionResults[0].result as number;
                }
              } catch (scriptError) {
                console.warn("No se pudo inyectar el script de precio:", scriptError);
              }

              // Limpiamos el título de la pestaña según la tienda
              let cleanTitle = activeTab.title || "Producto detectado";
              if (isAmazon) {
                cleanTitle = cleanTitle.replace(/Amazon\.com\.mx.*:|Amazon\.com.*:/i, "").trim();
              } else if (isCostco) {
                cleanTitle = cleanTitle.replace(/\s*\|\s*Costco.*$/i, "").trim();
              }

              sessionToApply = {
                detected: true,
                product: { 
                  nombre: cleanTitle, 
                  precio: scrapedPrice, 
                  url: activeTab.url 
                },
                url: activeTab.url,
                hostname: new URL(activeTab.url).hostname,
                at: Date.now()
              };
              detectedStore = isAmazon ? "amazon" : "costco";
            }
          }
        }
      } catch (e) {
        console.error("Error al interceptar sesión:", e);
      }
    }

    // 3. Verificamos el código (esto cambia el estado del usuario)
    verifyCode(codeInput.trim());

    // 4. Redirigimos inmediatamente al StoreDetection correspondiente
    if (sessionToApply) {
      if (detectedStore === "amazon" && amazonVisitFromTab) {
        amazonVisitFromTab(sessionToApply.product);
      } else if (detectedStore === "costco" && costcoVisitFromTab) {
        costcoVisitFromTab(sessionToApply.product);
      }
    }
  };

  const handleBack = () => {
    cancelVerification();
    setCodeInput("");
    setEmailError(null);
  };

  // ─── Vista: ingreso de código ─────────────────────────────────────────────
  if (onVerifyStep) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Verificación</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ingresa el código de 6 dígitos enviado a{" "}
            <span className="font-medium text-slate-700">{state.pendingCorreo}</span>
          </p>
        </div>

        <Card className="border-kueski-200 bg-kueski-50/50">
          <p className="text-xs font-medium uppercase tracking-wide text-kueski-700">
            Prototipo — código de demostración
          </p>
          <p className="mt-2 font-mono text-2xl font-bold tracking-widest text-kueski-800">
            {state.pendingVerificationCode}
          </p>
        </Card>

        <div>
          <label htmlFor="verify-code" className="text-xs font-medium text-slate-600">
            Código de verificación
          </label>
          <input
            id="verify-code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-center font-mono text-lg tracking-widest outline-none focus:border-kueski-500 focus:ring-2 focus:ring-kueski-200"
          />
          {state.verificationError && (
            <p className="mt-2 text-xs text-red-600">{state.verificationError}</p>
          )}
        </div>

        <Button fullWidth onClick={handleVerify} disabled={codeInput.length !== 6}>
          Verificar
        </Button>
        <Button fullWidth variant="ghost" onClick={handleBack}>
          Volver
        </Button>
      </div>
    );
  }

  // ─── Vista: ingreso de correo ─────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-slate-500">
          Accede a tu cuenta Kueski para financiar compras.
        </p>
      </div>

      <div>
        <label htmlFor="login-email" className="text-xs font-medium text-slate-600">
          Correo electrónico
        </label>
        <input
          id="login-email"
          type="email"
          value={correo}
          onChange={(e) => {
            setCorreo(e.target.value);
            if (emailError) setEmailError(null);
          }}
          placeholder="tu@email.com"
          className={`mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors
            ${emailError
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-slate-200 focus:border-kueski-500 focus:ring-2 focus:ring-kueski-200"
            }`}
        />
        {emailError && (
          <p className="mt-2 text-xs text-red-600">{emailError}</p>
        )}
      </div>

      <Button fullWidth onClick={handleLogin} disabled={isCheckingEmail}>
        {isCheckingEmail ? "Verificando..." : "Iniciar sesión"}
      </Button>

      <p className="text-center text-[11px] text-slate-400">
        Al continuar recibirás un código de verificación (simulado en este prototipo).
      </p>
    </div>
  );
}