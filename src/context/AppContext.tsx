import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import {
  AMAZON_PRODUCT,
  createUser,
  HIGH_PRICE_PRODUCT,
} from "../mock/data";
import { clearAmazonSession, isExtensionContext } from "../extension/session";
import type {
  AmazonProduct,
  AppAction,
  AppState,
  EligibilityStatus,
  Preferences,
  ScreenId,
} from "../types";

const defaultPreferences: Preferences = {
  notificaciones: true,
  intensidad: "standard",
  compartirDatos: false,
  temaOscuro: false,
};

const initialState: AppState = {
  screen: "login",
  user: null,
  pendingCorreo: null,
  pendingVerificationCode: null,
  verificationError: null,
  amazonActive: false,
  storeDetectionDismissed: false,
  offerDismissed: false,
  product: AMAZON_PRODUCT,
  eligibility: "pending",
  simulation: null,
  simulationViewed: false,
  cardRevealed: false,
  transaction: null,
  preferences: defaultPreferences,
  purchaseAmount: AMAZON_PRODUCT.precio,
};

function dashboardResetFields(state: AppState): Partial<AppState> {
  return {
    user: createUser(state.pendingCorreo ?? undefined),
    screen: "dashboard",
    pendingCorreo: null,
    pendingVerificationCode: null,
    verificationError: null,
    amazonActive: false,
    storeDetectionDismissed: false,
    offerDismissed: false,
    eligibility: "pending",
    simulation: null,
    simulationViewed: false,
    cardRevealed: false,
    transaction: null,
    product: AMAZON_PRODUCT,
    purchaseAmount: AMAZON_PRODUCT.precio,
  };
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "NAVIGATE":
      return { ...state, screen: action.screen };
    case "REQUEST_VERIFICATION":
      return {
        ...state,
        pendingCorreo: action.correo,
        pendingVerificationCode: action.code,
        verificationError: null,
      };
    case "VERIFY_CODE":
      if (action.code !== state.pendingVerificationCode) {
        return { ...state, verificationError: "Código incorrecto. Intenta de nuevo." };
      }
      return { ...state, ...dashboardResetFields(state) };
    case "CANCEL_VERIFICATION":
      return {
        ...state,
        pendingCorreo: null,
        pendingVerificationCode: null,
        verificationError: null,
      };
    case "LOGOUT":
      return { ...initialState, preferences: state.preferences };
    case "SIMULATE_AMAZON_VISIT":
      return {
        ...state,
        amazonActive: true,
        storeDetectionDismissed: false,
        offerDismissed: false,
        screen: "storeDetection",
        product: AMAZON_PRODUCT,
        purchaseAmount: AMAZON_PRODUCT.precio,
        eligibility: "pending",
        simulation: null,
        simulationViewed: false,
        cardRevealed: false,
        transaction: null,
      };
    case "SIMULATE_AMAZON_EXPENSIVE":
      return {
        ...state,
        amazonActive: true,
        storeDetectionDismissed: false,
        offerDismissed: false,
        screen: "storeDetection",
        product: HIGH_PRICE_PRODUCT,
        purchaseAmount: HIGH_PRICE_PRODUCT.precio,
        eligibility: "pending",
        simulation: null,
        simulationViewed: false,
      };
    case "AMAZON_VISIT_FROM_TAB": {
      const amount =
        action.product.precio > 0 ? action.product.precio : AMAZON_PRODUCT.precio;
      return {
        ...state,
        amazonActive: true,
        storeDetectionDismissed: false,
        offerDismissed: false,
        screen: "storeDetection",
        product: action.product,
        purchaseAmount: amount,
        eligibility: "pending",
        simulation: null,
        simulationViewed: false,
        cardRevealed: false,
        transaction: null,
      };
    }
    case "DISMISS_STORE_DETECTION":
      return {
        ...state,
        storeDetectionDismissed: true,
        screen: "dashboard",
      };
    case "DISMISS_OFFER":
      return {
        ...state,
        offerDismissed: true,
        screen: "dashboard",
      };
    case "SET_PURCHASE_AMOUNT":
      return { ...state, purchaseAmount: action.amount };
    case "RUN_SIMULATION":
      return {
        ...state,
        simulation: {
          numPagos: action.numPagos,
          pagoMensual: action.pagoMensual,
          total: action.total,
        },
        simulationViewed: true,
      };
    case "CHECK_ELIGIBILITY": {
      const qualified =
        state.purchaseAmount <= (state.user?.creditoDisponible ?? 0);
      return {
        ...state,
        eligibility: qualified ? "qualified" : "not_qualified",
        screen: "eligibility",
      };
    }
    case "SET_ELIGIBILITY":
      return { ...state, eligibility: action.status };
    case "REVEAL_CARD":
      return { ...state, cardRevealed: true };
    case "COMPLETE_CHECKOUT":
      return {
        ...state,
        transaction: action.transaction,
        screen: "confirmation",
        amazonActive: false,
      };
    case "UPDATE_PREFERENCES":
      return {
        ...state,
        preferences: { ...state.preferences, ...action.preferences },
      };
    case "RESET_AMAZON_FLOW":
      return {
        ...state,
        amazonActive: false,
        storeDetectionDismissed: false,
        offerDismissed: false,
        eligibility: "pending",
        simulation: null,
        simulationViewed: false,
        cardRevealed: false,
        product: AMAZON_PRODUCT,
        purchaseAmount: AMAZON_PRODUCT.precio,
        screen: "dashboard",
      };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  navigate: (screen: ScreenId) => void;
  requestVerification: (correo: string) => void;
  verifyCode: (code: string) => void;
  cancelVerification: () => void;
  logout: () => void;
  simulateAmazonVisit: () => void;
  simulateAmazonExpensive: () => void;
  amazonVisitFromTab: (product: AmazonProduct) => void;
  dismissStoreDetection: () => void;
  dismissOffer: () => void;
  runSimulation: (numPagos: number, pagoMensual: number, total: number) => void;
  checkEligibility: () => void;
  setEligibility: (status: EligibilityStatus) => void;
  revealCard: () => void;
  completeCheckout: () => void;
  updatePreferences: (prefs: Partial<Preferences>) => void;
  resetAmazonFlow: () => void;
  needsSimulation: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const needsSimulation = true;

  const navigate = useCallback(
    (screen: ScreenId) => dispatch({ type: "NAVIGATE", screen }),
    []
  );

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      navigate,
      requestVerification: (correo) => {
        const code = String(Math.floor(100000 + Math.random() * 900000));
        dispatch({ type: "REQUEST_VERIFICATION", correo, code });
      },
      verifyCode: (code) => dispatch({ type: "VERIFY_CODE", code }),
      cancelVerification: () => dispatch({ type: "CANCEL_VERIFICATION" }),
      logout: () => dispatch({ type: "LOGOUT" }),
      simulateAmazonVisit: () => dispatch({ type: "SIMULATE_AMAZON_VISIT" }),
      simulateAmazonExpensive: () =>
        dispatch({ type: "SIMULATE_AMAZON_EXPENSIVE" }),
      amazonVisitFromTab: (product) =>
        dispatch({ type: "AMAZON_VISIT_FROM_TAB", product }),
      dismissStoreDetection: () => {
        dispatch({ type: "DISMISS_STORE_DETECTION" });
        if (isExtensionContext()) void clearAmazonSession();
      },
      dismissOffer: () => dispatch({ type: "DISMISS_OFFER" }),
      runSimulation: (numPagos, pagoMensual, total) =>
        dispatch({
          type: "RUN_SIMULATION",
          numPagos,
          pagoMensual,
          total,
        }),
      checkEligibility: () => dispatch({ type: "CHECK_ELIGIBILITY" }),
      setEligibility: (status) => dispatch({ type: "SET_ELIGIBILITY", status }),
      revealCard: () => dispatch({ type: "REVEAL_CARD" }),
      completeCheckout: () => {
        const plazo =
          state.simulation != null
            ? `${state.simulation.numPagos} pagos`
            : "3 pagos (3 MSI)";
        dispatch({
          type: "COMPLETE_CHECKOUT",
          transaction: {
            monto: state.purchaseAmount,
            comercio: "Amazon México",
            producto: state.product.nombre,
            plazo,
            fecha: new Date().toLocaleDateString("es-MX", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
          },
        });
        if (isExtensionContext()) void clearAmazonSession();
      },
      updatePreferences: (preferences) =>
        dispatch({ type: "UPDATE_PREFERENCES", preferences }),
      resetAmazonFlow: () => {
        dispatch({ type: "RESET_AMAZON_FLOW" });
        if (isExtensionContext()) void clearAmazonSession();
      },
      needsSimulation,
    }),
    [state, needsSimulation]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
