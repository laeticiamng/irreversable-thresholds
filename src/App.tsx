import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loader2 } from "lucide-react";
import { OrganizationProvider } from "@/contexts/OrganizationContext";

// Eagerly loaded pages (critical path)
import Index from "./pages/Index";
import Exposition from "./pages/Exposition";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy loaded pages
const Manifesto = lazy(() => import("./pages/Manifesto"));
const About = lazy(() => import("./pages/About"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Account = lazy(() => import("./pages/Account"));
const Settings = lazy(() => import("./pages/Settings"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Suite = lazy(() => import("./pages/Suite"));

// Territory concept pages (lazy)
const Irreversa = lazy(() => import("./pages/territories/Irreversa"));
const Nulla = lazy(() => import("./pages/territories/Nulla"));
const Thresh = lazy(() => import("./pages/territories/Thresh"));
const Silva = lazy(() => import("./pages/territories/Silva"));

// IRREVERSA Module (lazy)
const IrreversaHome = lazy(() => import("./pages/irreversa/IrreversaHome"));
const IrreversaCases = lazy(() => import("./pages/irreversa/IrreversaCases"));
const IrreversaCreateCase = lazy(() => import("./pages/irreversa/CreateCase"));
const CaseDetail = lazy(() => import("./pages/irreversa/CaseDetail"));

// NULLA Module (lazy)
const NullaHome = lazy(() => import("./pages/nulla/NullaHome"));
const NullaCases = lazy(() => import("./pages/nulla/NullaCases"));
const NullaCaseDetail = lazy(() => import("./pages/nulla/NullaCaseDetail"));
const CreateNullaCase = lazy(() => import("./pages/nulla/CreateNullaCase"));

// THRESH Module (lazy)
const ThreshHome = lazy(() => import("./pages/thresh/ThreshHome"));
const ThreshCases = lazy(() => import("./pages/thresh/ThreshCases"));
const ThreshCaseDetail = lazy(() => import("./pages/thresh/ThreshCaseDetail"));
const CreateThreshCase = lazy(() => import("./pages/thresh/CreateThreshCase"));

// SILVA Module (lazy)
const SilvaHome = lazy(() => import("./pages/silva/SilvaHome"));
const SilvaSpace = lazy(() => import("./pages/silva/SilvaSpace"));
const SilvaSpaces = lazy(() => import("./pages/silva/SilvaSpaces"));

// Other modules (lazy)
const NullaModule = lazy(() => import("./pages/NullaModule"));
const ThreshModule = lazy(() => import("./pages/ThreshModule"));

// Dashboard pages (lazy)
const StatsComparison = lazy(() => import("./pages/dashboard/StatsComparison"));

// Organization pages (lazy)
const CreateOrganization = lazy(() => import("./pages/org/CreateOrganization"));
const OrgDashboard = lazy(() => import("./pages/org/OrgDashboard"));
const OrgMembers = lazy(() => import("./pages/org/OrgMembers"));
const OrgTeams = lazy(() => import("./pages/org/OrgTeams"));
const OrgSettings = lazy(() => import("./pages/org/OrgSettings"));

// Invitation page (lazy)
const AcceptInvitation = lazy(() => import("./pages/invite/AcceptInvitation"));

// Unified case creation (lazy)
const CreateCase = lazy(() => import("./pages/CreateCase"));

const queryClient = new QueryClient();

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-sm text-muted-foreground font-body">Chargement...</p>
      </div>
    </div>
  );
}

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
        <Suspense fallback={<PageLoader />}>
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
            <Route path="/thresh/cases/new" element={<CreateThreshCase />} />
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
            <Route path="/dashboard/comparison" element={<StatsComparison />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/account" element={<Account />} />
            
            {/* Organization routes */}
            <Route path="/org/new" element={<CreateOrganization />} />
            <Route path="/org/:orgSlug" element={<OrgDashboard />} />
            <Route path="/org/:orgSlug/members" element={<OrgMembers />} />
            <Route path="/org/:orgSlug/teams" element={<OrgTeams />} />
            <Route path="/org/:orgSlug/settings" element={<OrgSettings />} />
            
            {/* Invitation acceptance */}
            <Route path="/invite/:token" element={<AcceptInvitation />} />
            
            {/* Legacy redirects */}
            <Route path="/pending" element={<IrreversaCases />} />
            <Route path="/archive" element={<IrreversaCases />} />
            <Route path="/absences" element={<NullaModule />} />
            <Route path="/thresholds" element={<ThreshModule />} />
            <Route path="/auth" element={<Auth />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
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
            <OrganizationProvider>
              <OfflineIndicator />
              <AnimatedRoutes />
            </OrganizationProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
