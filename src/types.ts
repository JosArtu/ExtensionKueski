export type ScreenId =
  | "login"
  | "dashboard"
  | "storeDetection"
  | "activeOffer"
  | "simulation"
  | "eligibility"
  | "digitalCard"
  | "confirmation"
  | "preferences";

export type EligibilityStatus = "pending" | "qualified" | "not_qualified";

export type AlertIntensity = "subtle" | "standard";

export interface UserProfile {
  id: string;
  nombre: string;
  apellidos: string;
  correo: string;
  creditoDisponible: number;
}

export interface AmazonProduct {
  nombre: string;
  precio: number;
  url: string;
}

export interface Preferences {
  notificaciones: boolean;
  intensidad: AlertIntensity;
  compartirDatos: boolean;
  temaOscuro: boolean;
}

export interface SimulationResult {
  numPagos: number;
  pagoMensual: number;
  total: number;
}

export interface Transaction {
  monto: number;
  comercio: string;
  producto: string;
  plazo: string;
  fecha: string;
}

export interface AppState {
  screen: ScreenId;
  user: UserProfile | null;
  pendingCorreo: string | null;
  pendingVerificationCode: string | null;
  verificationError: string | null;
  amazonActive: boolean;
  storeDetectionDismissed: boolean;
  offerDismissed: boolean;
  product: AmazonProduct;
  eligibility: EligibilityStatus;
  simulation: SimulationResult | null;
  simulationViewed: boolean;
  cardRevealed: boolean;
  transaction: Transaction | null;
  preferences: Preferences;
  purchaseAmount: number;
}

export type AppAction =
  | { type: "NAVIGATE"; screen: ScreenId }
  | { type: "REQUEST_VERIFICATION"; correo: string; code: string }
  | { type: "VERIFY_CODE"; code: string }
  | { type: "CANCEL_VERIFICATION" }
  | { type: "LOGOUT" }
  | { type: "SIMULATE_AMAZON_VISIT" }
  | { type: "SIMULATE_AMAZON_EXPENSIVE" }
  | { type: "AMAZON_VISIT_FROM_TAB"; product: AmazonProduct }
  | { type: "DISMISS_STORE_DETECTION" }
  | { type: "DISMISS_OFFER" }
  | { type: "SET_PURCHASE_AMOUNT"; amount: number }
  | {
      type: "RUN_SIMULATION";
      numPagos: number;
      pagoMensual: number;
      total: number;
    }
  | { type: "CHECK_ELIGIBILITY" }
  | { type: "SET_ELIGIBILITY"; status: EligibilityStatus }
  | { type: "REVEAL_CARD" }
  | { type: "COMPLETE_CHECKOUT"; transaction: Transaction }
  | { type: "UPDATE_PREFERENCES"; preferences: Partial<Preferences> }
  | { type: "RESET_AMAZON_FLOW" };
