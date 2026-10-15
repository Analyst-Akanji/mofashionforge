import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import WhatsAppFloat from "./WhatsAppFloat";
import CartFloat from "./CartFloat";

export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <WhatsAppFloat />
      <CartFloat />
      <Outlet />
    </>
  );
}
