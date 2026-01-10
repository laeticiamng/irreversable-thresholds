import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import Pending from "./pages/Pending";
import Archive from "./pages/Archive";
import NullaLanding from "./pages/NullaLanding";
import Absences from "./pages/Absences";
import ThreshLanding from "./pages/ThreshLanding";
import ThresholdsList from "./pages/ThresholdsList";
import SilvaLanding from "./pages/SilvaLanding";
import SilvaSpace from "./pages/SilvaSpace";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          {/* IRREVERSA */}
          <Route path="/irreversa" element={<Landing />} />
          <Route path="/pending" element={<Pending />} />
          <Route path="/archive" element={<Archive />} />
          {/* NULLA */}
          <Route path="/nulla" element={<NullaLanding />} />
          <Route path="/absences" element={<Absences />} />
          {/* THRESH */}
          <Route path="/thresh" element={<ThreshLanding />} />
          <Route path="/thresholds" element={<ThresholdsList />} />
          {/* SILVA */}
          <Route path="/silva" element={<SilvaLanding />} />
          <Route path="/silva/space" element={<SilvaSpace />} />
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
