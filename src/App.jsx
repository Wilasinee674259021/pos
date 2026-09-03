import { useState } from "react";

import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Members from "./pages/Members";
import Products from "./pages/Products";
import Promotions from "./pages/Promotions";
import Stock from "./pages/Stock";
import Purchasing from "./pages/Purchasing";
import Branches from "./pages/Branches";
import Employees from "./pages/Employees";
import AuditLog from "./pages/AuditLog";

export default function App() {
  // =========================
  // CURRENT USER
  // =========================

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("pos_current_user");

      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("ไม่สามารถอ่านข้อมูลผู้ใช้งาน:", error);
      return null;
    }
  });

  // =========================
  // CURRENT PAGE
  // =========================

  const [currentPage, setCurrentPage] = useState("Dashboard");

  // =========================
  // LOGIN
  // =========================

  const handleLogin = (user) => {
    setCurrentUser(user);
    setCurrentPage("Dashboard");

    localStorage.setItem(
      "pos_current_user",
      JSON.stringify(user)
    );
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "คุณต้องการออกจากระบบหรือไม่?"
    );

    if (!confirmLogout) {
      return;
    }

    try {
      const existingLogs = JSON.parse(
        localStorage.getItem("pos_audit_logs") || "[]"
      );

      const logoutLog = {
        id: Date.now(),
        action: "ออกจากระบบ",
        user:
          currentUser?.name ||
          currentUser?.username ||
          "ผู้ใช้งาน",
        username: currentUser?.username || "",
        role: currentUser?.role || "",
        date: new Date().toISOString(),
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(
        "pos_audit_logs",
        JSON.stringify([logoutLog, ...existingLogs])
      );
    } catch (error) {
      console.error(
        "ไม่สามารถบันทึก Audit Log:",
        error
      );
    }

    localStorage.removeItem("pos_current_user");

    setCurrentUser(null);
    setCurrentPage("Dashboard");
  };

  // =========================
  // LOGIN PAGE
  // =========================

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  // =========================
  // ROLE MAP
  // =========================

  const roleMap = {
    admin: "ผู้ดูแลระบบ",
    staff: "พนักงาน",
    manager: "ผู้จัดการ",

    "ผู้ดูแลระบบ": "ผู้ดูแลระบบ",
    "พนักงาน": "พนักงาน",
    "ผู้จัดการ": "ผู้จัดการ",
  };

  const normalizedRole =
    roleMap[String(currentUser?.role || "").trim()] || "";

  // =========================
  // PERMISSIONS
  // =========================

  const permissions = {
    พนักงาน: [
      "Dashboard",
      "หน้าคิดเงิน",
      "สมาชิก",
    ],

    ผู้จัดการ: [
      "Dashboard",
      "หน้าคิดเงิน",
      "สินค้า",
      "สมาชิก",
      "โปรโมชั่น",
      "สต๊อกสินค้า",
      "จัดซื้อ / รับสินค้า",
      "Audit Log",
    ],

    ผู้ดูแลระบบ: [
      "Dashboard",
      "หน้าคิดเงิน",
      "สินค้า",
      "สมาชิก",
      "โปรโมชั่น",
      "สต๊อกสินค้า",
      "จัดซื้อ / รับสินค้า",
      "สาขา",
      "พนักงาน",
      "Audit Log",
    ],
  };

  const allowedPages =
    permissions[normalizedRole] || [];

  // =========================
  // ตรวจสอบสิทธิ์หน้า
  // =========================

  const safeCurrentPage = allowedPages.includes(
    currentPage
  )
    ? currentPage
    : "Dashboard";

  // =========================
  // RENDER PAGE
  // =========================

  const renderPage = () => {
    switch (safeCurrentPage) {
      case "Dashboard":
        return <Dashboard />;

      case "หน้าคิดเงิน":
        return <POS />;

      case "สินค้า":
        return <Products />;

      case "สมาชิก":
        return <Members />;

      case "โปรโมชั่น":
        return <Promotions />;

      case "สต๊อกสินค้า":
        return <Stock />;

      case "จัดซื้อ / รับสินค้า":
        return <Purchasing />;

      case "สาขา":
        return <Branches />;

      case "พนักงาน":
        return <Employees />;

      case "Audit Log":
        return <AuditLog />;

      default:
        return <Dashboard />;
    }
  };

  // =========================
  // MAIN LAYOUT
  // =========================

  return (
    <div className="app-layout">
      <Sidebar
        currentPage={safeCurrentPage}
        setCurrentPage={setCurrentPage}
        currentUser={{
          ...currentUser,
          role: normalizedRole,
        }}
        onLogout={handleLogout}
      />

      <main className="app-main">
        {renderPage()}
      </main>
    </div>
  );
}