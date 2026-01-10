import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Pending from "./pages/Pending";
import Archive from "./pages/Archive";
import NullaLanding from "./pages/NullaLanding";
import Absences from "./pages/Absences";
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
          {/* IRREVERSA */}
          <Route path="/irreversa" element={<Landing />} />
          <Route path="/pending" element={<Pending />} />
          <Route path="/archive" element={<Archive />} />
          {/* NULLA */}
          <Route path="/nulla" element={<NullaLanding />} />
          <Route path="/absences" element={<Absences />} />
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
