import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Exposition from "./pages/Exposition";
import Manifesto from "./pages/Manifesto";
import About from "./pages/About";
import SilvaSpace from "./pages/SilvaSpace";
import Dashboard from "./pages/Dashboard";
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
import CreateCase from "./pages/irreversa/CreateCase";
import CaseDetail from "./pages/irreversa/CaseDetail";

// NULLA Module
import NullaHome from "./pages/nulla/NullaHome";
import NullaCases from "./pages/nulla/NullaCases";
import NullaCaseDetail from "./pages/nulla/NullaCaseDetail";

// Other modules
import NullaModule from "./pages/NullaModule";
import ThreshModule from "./pages/ThreshModule";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="irreversible-theme" attribute="class">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/suite" element={<Suite />} />
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
            <Route path="/irreversa/cases/new" element={<CreateCase />} />
            <Route path="/irreversa/cases/:caseId" element={<CaseDetail />} />
            <Route path="/irreversa/space" element={<IrreversaHome />} />
            
            {/* NULLA Module */}
            <Route path="/nulla/home" element={<NullaHome />} />
            <Route path="/nulla/cases" element={<NullaCases />} />
            <Route path="/nulla/cases/new" element={<CreateCase />} />
            <Route path="/nulla/cases/:caseId" element={<NullaCaseDetail />} />
            <Route path="/nulla/space" element={<NullaModule />} />
            
            {/* Other modules */}
            <Route path="/thresh/space" element={<ThreshModule />} />
            <Route path="/silva/space" element={<SilvaSpace />} />
            
            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Legacy redirects */}
            <Route path="/pending" element={<IrreversaCases />} />
            <Route path="/archive" element={<IrreversaCases />} />
            <Route path="/absences" element={<NullaModule />} />
            <Route path="/thresholds" element={<ThreshModule />} />
            <Route path="/auth" element={<Exposition />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
