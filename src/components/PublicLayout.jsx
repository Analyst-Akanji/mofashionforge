import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import WhatsAppFloat from "./WhatsAppFloat";

export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <WhatsAppFloat />
      <Outlet />
    </>
  );
}
