import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Tag,
  Boxes,
  Truck,
  Building2,
  UserCog,
  ClipboardList,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar({
  currentPage,
  setCurrentPage,
  currentUser,
  onLogout,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // =========================
  // แปลง Role ให้เป็นมาตรฐาน
  // =========================

  const roleMap = {
    admin: "ผู้ดูแลระบบ",
    staff: "พนักงาน",
    manager: "ผู้จัดการ",

    "ผู้ดูแลระบบ": "ผู้ดูแลระบบ",
    "พนักงาน": "พนักงาน",
    "ผู้จัดการ": "ผู้จัดการ",
  };

  const userRole =
    roleMap[String(currentUser?.role || "").trim()] || "";

  // =========================
  // รายการเมนู
  // =========================

  const menus = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      roles: ["พนักงาน", "ผู้จัดการ", "ผู้ดูแลระบบ"],
    },
    {
      name: "หน้าคิดเงิน",
      icon: ShoppingCart,
      roles: ["พนักงาน", "ผู้จัดการ", "ผู้ดูแลระบบ"],
    },
    {
      name: "สินค้า",
      icon: Package,
      roles: ["ผู้จัดการ", "ผู้ดูแลระบบ"],
    },
    {
      name: "สมาชิก",
      icon: Users,
      roles: ["พนักงาน", "ผู้จัดการ", "ผู้ดูแลระบบ"],
    },
    {
      name: "โปรโมชั่น",
      icon: Tag,
      roles: ["ผู้จัดการ", "ผู้ดูแลระบบ"],
    },
    {
      name: "สต๊อกสินค้า",
      icon: Boxes,
      roles: ["ผู้จัดการ", "ผู้ดูแลระบบ"],
    },
    {
      name: "จัดซื้อ / รับสินค้า",
      icon: Truck,
      roles: ["ผู้จัดการ", "ผู้ดูแลระบบ"],
    },
    {
      name: "สาขา",
      icon: Building2,
      roles: ["ผู้ดูแลระบบ"],
    },
    {
      name: "พนักงาน",
      icon: UserCog,
      roles: ["ผู้ดูแลระบบ"],
    },
    {
      name: "Audit Log",
      icon: ClipboardList,
      roles: ["ผู้จัดการ", "ผู้ดูแลระบบ"],
    },
  ];

  // =========================
  // กรองเมนูตามสิทธิ์
  // =========================

  const visibleMenus = menus.filter((menu) =>
    menu.roles.includes(userRole)
  );

  // =========================
  // เปลี่ยนหน้า
  // =========================

  const handleMenuClick = (page) => {
    setCurrentPage(page);
    setMobileOpen(false);
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    setMobileOpen(false);
    onLogout();
  };

  return (
    <>
      {/* =====================================
          MOBILE TOP BAR
      ===================================== */}

      <div className="mobile-topbar">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="mobile-menu-button"
          aria-label="เปิดเมนู"
        >
          <Menu size={24} />
        </button>

        <div className="mobile-title">
          <h1>Convenience POS</h1>
          <span>{currentPage}</span>
        </div>
      </div>

      {/* =====================================
          MOBILE OVERLAY
      ===================================== */}

      {mobileOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          aria-label="ปิดเมนู"
        />
      )}

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <aside
        className={`sidebar ${
          mobileOpen ? "sidebar-mobile-open" : ""
        }`}
      >
        {/* =========================
            LOGO
        ========================= */}

        <div className="sidebar-logo">
          <div className="sidebar-logo-row">
            <div>
              <h1>Convenience POS</h1>

              <p>ระบบจัดการร้านค้า</p>
            </div>

            {/* ปุ่มปิดเฉพาะมือถือ */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="sidebar-close-button"
              aria-label="ปิดเมนู"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* =========================
            USER
        ========================= */}

        <div className="sidebar-user">
          <p className="sidebar-user-name">
            {currentUser?.name || "ผู้ใช้งาน"}
          </p>

          <p className="sidebar-user-role">
            {userRole || "ไม่ระบุสิทธิ์"}
          </p>
        </div>

        {/* =========================
            MENU
        ========================= */}

        <nav className="sidebar-menu">
          <div className="sidebar-menu-list">
            {visibleMenus.map((menu) => {
              const Icon = menu.icon;
              const active = currentPage === menu.name;

              return (
                <button
                  key={menu.name}
                  type="button"
                  onClick={() => handleMenuClick(menu.name)}
                  className={`sidebar-menu-item ${
                    active ? "sidebar-menu-active" : ""
                  }`}
                >
                  <Icon size={20} />

                  <span>{menu.name}</span>
                </button>
              );
            })}

            {/* กรณีไม่มีสิทธิ์ */}

            {visibleMenus.length === 0 && (
              <div className="sidebar-no-menu">
                ไม่พบเมนูสำหรับสิทธิ์นี้
              </div>
            )}
          </div>
        </nav>

        {/* =========================
            LOGOUT
        ========================= */}

        <div className="sidebar-logout">
          <button
            type="button"
            onClick={handleLogout}
            className="sidebar-logout-button"
          >
            <LogOut size={20} />

            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>
    </>
  );
}