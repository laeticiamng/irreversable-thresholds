import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Exposition from "./pages/Exposition";
import Manifesto from "./pages/Manifesto";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Account from "./pages/Account";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import Suite from "./pages/Suite";
import NotFound from "./pages/NotFound";

// Territory concept pages
import Irreversa from "./pages/territories/Irreversa";
import Nulla from "./pages/territories/Nulla";
import Thresh from "./pages/territories/Thresh";
import Silva from "./pages/territories/Silva";

// IRREVERSA Module
import IrreversaHome from "./pages/irreversa/IrreversaHome";
import IrreversaCases from "./pages/irreversa/IrreversaCases";
import IrreversaCreateCase from "./pages/irreversa/CreateCase";
import CaseDetail from "./pages/irreversa/CaseDetail";

// NULLA Module
import NullaHome from "./pages/nulla/NullaHome";
import NullaCases from "./pages/nulla/NullaCases";
import NullaCaseDetail from "./pages/nulla/NullaCaseDetail";
import CreateNullaCase from "./pages/nulla/CreateNullaCase";

// THRESH Module
import ThreshHome from "./pages/thresh/ThreshHome";
import ThreshCases from "./pages/thresh/ThreshCases";
import ThreshCaseDetail from "./pages/thresh/ThreshCaseDetail";
import CreateThreshCase from "./pages/thresh/CreateThreshCase";

// SILVA Module
import SilvaHome from "./pages/silva/SilvaHome";
import SilvaSpace from "./pages/silva/SilvaSpace";
import SilvaSpaces from "./pages/silva/SilvaSpaces";

// Other modules
import NullaModule from "./pages/NullaModule";
import ThreshModule from "./pages/ThreshModule";

// Unified case creation
import CreateCase from "./pages/CreateCase";

const queryClient = new QueryClient();

// Animated routes wrapper
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{
          type: "spring",
          stiffness: 380,
          damping: 30,
        }}
      >
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/suite" element={<Suite />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/exposition" element={<Exposition />} />
          <Route path="/manifesto" element={<Manifesto />} />
          <Route path="/about" element={<About />} />
          
          {/* Territory concept pages */}
          <Route path="/irreversa" element={<Irreversa />} />
          <Route path="/nulla" element={<Nulla />} />
          <Route path="/thresh" element={<Thresh />} />
          <Route path="/silva" element={<Silva />} />
          
          {/* IRREVERSA Module (full implementation) */}
          <Route path="/irreversa/home" element={<IrreversaHome />} />
          <Route path="/irreversa/cases" element={<IrreversaCases />} />
          <Route path="/irreversa/cases/new" element={<IrreversaCreateCase />} />
          <Route path="/irreversa/cases/:caseId" element={<CaseDetail />} />
          <Route path="/irreversa/space" element={<IrreversaHome />} />
          
          {/* NULLA Module */}
          <Route path="/nulla/home" element={<NullaHome />} />
          <Route path="/nulla/cases" element={<NullaCases />} />
          <Route path="/nulla/cases/new" element={<CreateNullaCase />} />
          <Route path="/nulla/cases/:caseId" element={<NullaCaseDetail />} />
          <Route path="/nulla/space" element={<NullaModule />} />
          
          {/* THRESH Module */}
          <Route path="/thresh/home" element={<ThreshHome />} />
          <Route path="/thresh/cases" element={<ThreshCases />} />
          <Route path="/thresh/cases/new" element={<CreateCase />} />
          <Route path="/thresh/cases/:caseId" element={<ThreshCaseDetail />} />
          <Route path="/thresh/space" element={<ThreshModule />} />
          
          {/* SILVA Module */}
          <Route path="/silva/home" element={<SilvaHome />} />
          <Route path="/silva/space" element={<SilvaSpace />} />
          <Route path="/silva/spaces" element={<SilvaSpaces />} />
          
          {/* Unified case creation */}
          <Route path="/cases/new" element={<CreateCase />} />
          
          {/* Dashboard, Settings & Account */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/account" element={<Account />} />
          
          {/* Legacy redirects */}
          <Route path="/pending" element={<IrreversaCases />} />
          <Route path="/archive" element={<IrreversaCases />} />
          <Route path="/absences" element={<NullaModule />} />
          <Route path="/thresholds" element={<ThreshModule />} />
          <Route path="/auth" element={<Exposition />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="irreversible-theme" attribute="class">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <OfflineIndicator />
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
