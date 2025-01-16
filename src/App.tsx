import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import Index from "./pages/Index";
import BakerRegister from "./pages/baker/Register";
import BakerDashboard from "./pages/baker/Dashboard";
import BakerProducts from "./pages/baker/Products";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminDashboard from "./pages/admin/Dashboard";
import Products from "./pages/products/Index";
import ProductDetails from "./pages/products/Details";
import Orders from "./pages/orders/Index";
import ShopDashboard from "./pages/shop/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/baker/register" element={<BakerRegister />} />
              <Route path="/baker/dashboard" element={<BakerDashboard />} />
              <Route path="/baker/products" element={<BakerProducts />} />
              <Route path="/shop/dashboard" element={<ShopDashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth/login" element={<Navigate to="/login" replace />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;