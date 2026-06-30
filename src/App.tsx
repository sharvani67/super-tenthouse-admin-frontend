
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout"; // 👈 NEW
import ScrollToTop from "./components/ScrollToTop";
import NotFound from "./pages/NotFound";
import WhatsAppFloat from "./WhatsAppFloat";
import Login from "./pages/Login";
import ChangePassword from "./pages/ForgotPassword";
import ProtectedRoute from "./test/ProtectedRoute";
import AdminCategories from "./pages/AdminCategories";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <ScrollToTop />

        <Routes>

          {/* ✅ PUBLIC ROUTES */}
          <Route element={<Layout />}>
           
          </Route>

          {/* ✅ ADMIN ROUTES */}
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Login />} />
            
            {/* Admin Blog Management - Protected */}
             <Route path="/admin-categories" element={<AdminCategories />} />




           

    
            
            {/* Forgot Password */}
            <Route path="/forgot-password" element={<ChangePassword />} />
          </Route>

          {/* ✅ 404 */}
          <Route path="*" element={<NotFound />} />

        </Routes>

        {/* <WhatsAppFloat /> */}

      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;