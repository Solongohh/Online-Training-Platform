import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Trainings from "./pages/Trainings";
import CourseDetail from "./pages/CourseDetail";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import TrainerDashboard from "./pages/TrainerDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import ApplyTrainer from "./pages/ApplyTrainer";
import RegisterCompany from "./pages/RegisterCompany";
import Cart from "./pages/Cart";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import MyLearning from "./pages/MyLearning";
import Wishlist from "./pages/Wishlist";
import Blog from "./pages/Blog";
import Referral from "./pages/Referral";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/trainings" element={<Trainings />} />
            <Route path="/trainings/:id" element={<CourseDetail />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/trainer" element={<TrainerDashboard />} />
            <Route path="/my-dashboard" element={<ClientDashboard />} />
            <Route path="/apply-trainer" element={<ApplyTrainer />} />
            <Route path="/register-company" element={<RegisterCompany />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/my-learning" element={<MyLearning />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/referral" element={<Referral />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
