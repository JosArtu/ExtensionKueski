import { AmazonBootstrap } from "./components/AmazonBootstrap";
import { CostcoBootstrap } from "./components/CostcoBootstrap";
import { FlowDevPanel } from "./components/layout/FlowDevPanel";
import { isExtensionContext } from "./extension/session";
import { PopupShell } from "./components/layout/PopupShell";
import { AppProvider, useApp } from "./context/AppContext";
import { ActiveOfferScreen } from "./screens/ActiveOfferScreen";
import { ConfirmationScreen } from "./screens/ConfirmationScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { DigitalCardScreen } from "./screens/DigitalCardScreen";
import { EligibilityScreen } from "./screens/EligibilityScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { PreferencesScreen } from "./screens/PreferencesScreen";
import { SimulationScreen } from "./screens/SimulationScreen";
import { StoreDetectionScreen } from "./screens/StoreDetectionScreen";
import type { ScreenId } from "./types";

function ScreenRouter() {
  const { state, navigate, dismissStoreDetection } = useApp();
  const { screen } = state;

  const content = (() => {
    switch (screen) {
      case "login":
        return <LoginScreen />;
      case "dashboard":
        return <DashboardScreen />;
      case "storeDetection":
        return <StoreDetectionScreen />;
      case "activeOffer":
        return <ActiveOfferScreen />;
      case "simulation":
        return <SimulationScreen />;
      case "eligibility":
        return <EligibilityScreen />;
      case "digitalCard":
        return <DigitalCardScreen />;
      case "confirmation":
        return <ConfirmationScreen />;
      case "preferences":
        return <PreferencesScreen />;
      default:
        return <LoginScreen />;
    }
  })();

  const showBack = screen !== "login" && screen !== "dashboard" && screen !== "confirmation";
  const showSettings = screen === "dashboard";

  const onBack = () => {
    const backMap: Partial<Record<ScreenId, ScreenId>> = {
      storeDetection: "dashboard",
      activeOffer: "storeDetection",
      simulation: "activeOffer",
      eligibility: state.simulationViewed ? "simulation" : "activeOffer",
      digitalCard: "eligibility",
      preferences: "dashboard",
    };
    const target = backMap[screen];
    if (screen === "storeDetection") {
      dismissStoreDetection();
      return;
    }
    if (target) navigate(target);
  };

  return (
    <PopupShell
      screen={screen}
      showBack={showBack}
      onBack={onBack}
      showSettings={showSettings}
    >
      {content}
    </PopupShell>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AmazonBootstrap />
      <CostcoBootstrap />
      <ScreenRouter />
      {!isExtensionContext() && <FlowDevPanel />}
    </AppProvider>
  );
}