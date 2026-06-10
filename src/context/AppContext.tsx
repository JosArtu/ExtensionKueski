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
  ACTIVE_OFFER,
  createUser,
  getActiveOfferForUser,
  HIGH_PRICE_PRODUCT,
  updateUserCredit,
} from "../mock/data";
import { clearAmazonSession, isExtensionContext } from "../extension/session";
import type {
  AmazonProduct,
  AppAction,
  AppState,
  EligibilityStatus,
  Preferences,
  ScreenId,
  UserProfile,
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
  pendingUser: null,
  activeOffer: ACTIVE_OFFER,
  pendingCorreo: null,
  pendingVerificationCode: null,
  verificationError: null,
  amazonActive: false,
  costcoActive: false,
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

function dashboardResetFields(): Partial<AppState> {
  return {
    screen: "dashboard",
    pendingCorreo: null,
    pendingVerificationCode: null,
    verificationError: null,
    amazonActive: false,
    costcoActive: false,
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
    case "SET_ACTIVE_OFFER":
      return { ...state, activeOffer: action.offer };
    case "SET_PENDING_USER":
      return { ...state, pendingUser: action.user };
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
      return state;
    case "LOGIN_SUCCESS":
      return {
        ...state,
        ...dashboardResetFields(),
        user: action.user,
        screen: "dashboard",
      };
    case "CANCEL_VERIFICATION":
      return {
        ...state,
        pendingUser: null,
        pendingCorreo: null,
        pendingVerificationCode: null,
        verificationError: null,
      };
    case "LOGOUT":
      return { ...initialState, activeOffer: ACTIVE_OFFER, preferences: state.preferences };
    case "SIMULATE_AMAZON_VISIT":
      return {
        ...state,
        amazonActive: true,
        costcoActive: false,
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
        costcoActive: false,
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
      // #region agent log
      fetch('http://127.0.0.1:7886/ingest/5ef5ffa8-2bf4-4ad7-84e0-911796d4af42',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d50a65'},body:JSON.stringify({sessionId:'d50a65',runId:'post-fix',location:'AppContext.tsx:AMAZON_VISIT_FROM_TAB',message:'reducer apply',data:{before:{amazonActive:state.amazonActive,costcoActive:state.costcoActive},after:{amazonActive:true,costcoActive:false},productNombre:action.product.nombre},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return {
        ...state,
        amazonActive: true,
        costcoActive: false,
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
    case "SIMULATE_COSTCO_VISIT":
      return {
        ...state,
        costcoActive: true,
        amazonActive: false,
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
    case "COSTCO_VISIT_FROM_TAB": {
      const amount =
        action.product.precio > 0 ? action.product.precio : AMAZON_PRODUCT.precio;
      // #region agent log
      fetch('http://127.0.0.1:7886/ingest/5ef5ffa8-2bf4-4ad7-84e0-911796d4af42',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d50a65'},body:JSON.stringify({sessionId:'d50a65',location:'AppContext.tsx:COSTCO_VISIT_FROM_TAB',message:'reducer before',data:{amazonActive:state.amazonActive,costcoActive:state.costcoActive,screen:state.screen,productNombre:action.product.nombre},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      return {
        ...state,
        costcoActive: true,
        amazonActive: false,
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
    case "UPDATE_USER_CREDIT":
      if (!state.user) return state;
      return {
        ...state,
        user: { ...state.user, creditoDisponible: action.newCredit },
      };
    case "REVEAL_CARD":
      return { ...state, cardRevealed: true };
    case "COMPLETE_CHECKOUT":
      return {
        ...state,
        transaction: action.transaction,
        screen: "confirmation",
        amazonActive: false,
        costcoActive: false,
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
        costcoActive: false,
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
  setPendingUser: (user: UserProfile) => void;
  logout: () => void;
  simulateAmazonVisit: () => void;
  simulateAmazonExpensive: () => void;
  amazonVisitFromTab: (product: AmazonProduct) => void;
  simulateCostcoVisit: () => void;
  costcoVisitFromTab: (product: AmazonProduct) => void;
  dismissStoreDetection: () => void;
  dismissOffer: () => void;
  runSimulation: (numPagos: number, pagoMensual: number, total: number) => void;
  checkEligibility: () => void;
  setEligibility: (status: EligibilityStatus) => void;
  revealCard: () => void;
  completeCheckout: () => void;
  updatePreferences: (prefs: Partial<Preferences>) => void;
  updateUserCredit: (newCredit: number) => void;
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
      verifyCode: (code) => {
        if (code !== state.pendingVerificationCode) {
          dispatch({ type: "VERIFY_CODE", code });
          return;
        }

        // Usar el usuario ya validado contra Supabase; si por alguna razón no
        // existe (flujo legacy), caemos al helper createUser como respaldo.
        const loginAndLoadOffer = async (user: UserProfile) => {
          dispatch({ type: "LOGIN_SUCCESS", user });
          // Cargar la oferta correspondiente al tipo_usuario
          const tipoUsuario = (user as UserProfile & { tipo_usuario?: string }).tipo_usuario ?? "standard";
          const offer = await getActiveOfferForUser(tipoUsuario);
          dispatch({ type: "SET_ACTIVE_OFFER", offer });
        };

        if (state.pendingUser) {
          void loginAndLoadOffer(state.pendingUser);
        } else {
          const correo = state.pendingCorreo ?? "usuario@email.com";
          void (async () => {
            const user = await createUser(correo);
            void loginAndLoadOffer(user);
          })();
        }
      },
      setPendingUser: (user) => dispatch({ type: "SET_PENDING_USER", user }),
      cancelVerification: () => dispatch({ type: "CANCEL_VERIFICATION" }),
      logout: () => dispatch({ type: "LOGOUT" }),
      simulateAmazonVisit: () => dispatch({ type: "SIMULATE_AMAZON_VISIT" }),
      simulateAmazonExpensive: () =>
        dispatch({ type: "SIMULATE_AMAZON_EXPENSIVE" }),
      amazonVisitFromTab: (product) =>
        dispatch({ type: "AMAZON_VISIT_FROM_TAB", product }),
      simulateCostcoVisit: () => dispatch({ type: "SIMULATE_COSTCO_VISIT" }),
      costcoVisitFromTab: (product) =>
        dispatch({ type: "COSTCO_VISIT_FROM_TAB", product }),
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
            comercio: state.costcoActive ? "Costco México" : "Amazon México",
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
      updateUserCredit: (newCredit) => {
        dispatch({ type: "UPDATE_USER_CREDIT", newCredit });
        if (state.user) {
          void updateUserCredit(state.user.id, newCredit);
        }
      },
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