import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import PublicLayout from "./components/PublicLayout";
import RequireAdmin from "./components/admin/RequireAdmin";

import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import AboutPage from "./pages/AboutPage";
import CustomOrdersPage from "./pages/CustomOrdersPage";
import GalleryPage from "./pages/GalleryPage";
import ContactPage from "./pages/ContactPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import PolicyPage from "./pages/PolicyPage";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminInquiries from "./pages/admin/AdminInquiries";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminBlog from "./pages/admin/AdminBlog";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public site: Navbar + WhatsApp button stay mounted between pages */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/custom-orders" element={<CustomOrdersPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/privacy" element={<PolicyPage policy="privacy" />} />
          <Route path="/shipping" element={<PolicyPage policy="shipping" />} />
          <Route path="/returns" element={<PolicyPage policy="returns" />} />
          <Route path="/faq" element={<PolicyPage policy="faq" />} />
        </Route>

        {/* Admin login is the only admin page that doesn't need a session */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Everything below requires a logged-in session */}
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminOverview />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/gallery" element={<AdminGallery />} />
          <Route path="/admin/inquiries" element={<AdminInquiries />} />
          <Route path="/admin/messages" element={<AdminMessages />} />
          <Route path="/admin/blog" element={<AdminBlog />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
