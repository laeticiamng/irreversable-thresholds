import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Exposition from "./pages/Exposition";
import Manifesto from "./pages/Manifesto";
import Pending from "./pages/Pending";
import Archive from "./pages/Archive";
import Absences from "./pages/Absences";
import ThresholdsList from "./pages/ThresholdsList";
import SilvaSpace from "./pages/SilvaSpace";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Territory pages
import Irreversa from "./pages/territories/Irreversa";
import Nulla from "./pages/territories/Nulla";
import Thresh from "./pages/territories/Thresh";
import Silva from "./pages/territories/Silva";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/exposition" element={<Exposition />} />
          <Route path="/manifesto" element={<Manifesto />} />
          
          {/* Territory concept pages */}
          <Route path="/irreversa" element={<Irreversa />} />
          <Route path="/nulla" element={<Nulla />} />
          <Route path="/thresh" element={<Thresh />} />
          <Route path="/silva" element={<Silva />} />
          
          {/* Operational pages (for exposed users) */}
          <Route path="/pending" element={<Pending />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/absences" element={<Absences />} />
          <Route path="/thresholds" element={<ThresholdsList />} />
          <Route path="/silva/space" element={<SilvaSpace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Legacy auth redirect */}
          <Route path="/auth" element={<Exposition />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
