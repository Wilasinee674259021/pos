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

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("pos_current_user");

    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem("pos_current_user");
      return null;
    }
  });

  const [currentPage, setCurrentPage] = useState("Dashboard");

  // =========================
  // LOGIN
  // =========================

  const handleLogin = (employee) => {
    setCurrentUser(employee);

    localStorage.setItem(
      "pos_current_user",
      JSON.stringify(employee)
    );

    setCurrentPage("Dashboard");
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "ต้องการออกจากระบบใช่หรือไม่?"
    );

    if (!confirmLogout) return;

    const savedLogs = localStorage.getItem("pos_audit_logs");

    let logs = [];

    try {
      logs = savedLogs ? JSON.parse(savedLogs) : [];
    } catch {
      logs = [];
    }

    logs.unshift({
      id: Date.now(),
      date: new Date().toLocaleString("th-TH"),
      employee: currentUser?.name || "ไม่ทราบชื่อ",
      action: "ออกจากระบบ",
      module: "ระบบ",
      detail: "ออกจากระบบสำเร็จ",
      type: "logout",
    });

    localStorage.setItem(
      "pos_audit_logs",
      JSON.stringify(logs)
    );

    localStorage.removeItem("pos_current_user");

    setCurrentUser(null);
    setCurrentPage("Dashboard");
  };

  // =========================
  // LOGIN SCREEN
  // =========================

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  // =========================
  // ROLE MAP
  // รองรับทั้งภาษาไทยและภาษาอังกฤษ
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
  // PERMISSION
  // =========================

  const allowedPages = {
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

  const userAllowedPages =
    allowedPages[normalizedRole] || [];

  // =========================
  // RENDER PAGE
  // =========================

  const renderPage = () => {
    if (!userAllowedPages.includes(currentPage)) {
      return <Dashboard />;
    }

    switch (currentPage) {
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
  // MAIN APP
  // =========================

  return (
    <div className="flex min-h-screen">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        currentUser={{
          ...currentUser,
          role: normalizedRole,
        }}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;