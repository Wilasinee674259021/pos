```jsx
export default function Sidebar({
  currentPage,
  setCurrentPage,
  currentUser,
  onLogout,
}) {
  const menus = [
    {
      icon: "📊",
      name: "Dashboard",
      roles: ["พนักงาน", "ผู้จัดการ", "ผู้ดูแลระบบ"],
    },
    {
      icon: "🛒",
      name: "หน้าคิดเงิน",
      roles: ["พนักงาน", "ผู้จัดการ", "ผู้ดูแลระบบ"],
    },
    {
      icon: "📦",
      name: "สินค้า",
      roles: ["ผู้จัดการ", "ผู้ดูแลระบบ"],
    },
    {
      icon: "👤",
      name: "สมาชิก",
      roles: ["พนักงาน", "ผู้จัดการ", "ผู้ดูแลระบบ"],
    },
    {
      icon: "🏷️",
      name: "โปรโมชั่น",
      roles: ["ผู้จัดการ", "ผู้ดูแลระบบ"],
    },
    {
      icon: "📦",
      name: "สต๊อกสินค้า",
      roles: ["ผู้จัดการ", "ผู้ดูแลระบบ"],
    },
    {
      icon: "🚚",
      name: "จัดซื้อ / รับสินค้า",
      roles: ["ผู้จัดการ", "ผู้ดูแลระบบ"],
    },
    {
      icon: "🏪",
      name: "สาขา",
      roles: ["ผู้ดูแลระบบ"],
    },
    {
      icon: "👨‍💼",
      name: "พนักงาน",
      roles: ["ผู้ดูแลระบบ"],
    },
    {
      icon: "🔐",
      name: "Audit Log",
      roles: ["ผู้ดูแลระบบ", "ผู้จัดการ"],
    },
  ];

  // =========================
  // NORMALIZE ROLE
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

  const userRole =
    roleMap[String(currentUser?.role || "").trim()] || "";

  // =========================
  // FILTER MENU
  // =========================

  const visibleMenus = menus.filter((menu) =>
    menu.roles.includes(userRole)
  );

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-4 flex flex-col">
      {/* LOGO */}
      <div className="mb-6 px-3">
        <h1 className="text-xl font-bold">
          🏪 Convenience POS
        </h1>

        <p className="text-sm text-slate-400 mt-1">
          ระบบจัดการร้านสะดวกซื้อ
        </p>
      </div>

      {/* USER */}
      <div className="bg-slate-800 rounded-xl p-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-lg">
            👤
          </div>

          <div className="min-w-0">
            <p className="font-bold truncate">
              {currentUser?.name || "ผู้ใช้งาน"}
            </p>

            <p className="text-xs text-slate-400">
              {userRole || "ไม่ทราบสิทธิ์"}
            </p>
          </div>
        </div>
      </div>

      {/* MENU */}
      <nav className="space-y-1 flex-1">
        {visibleMenus.map((menu) => {
          const active = currentPage === menu.name;

          return (
            <button
              key={menu.name}
              onClick={() => setCurrentPage(menu.name)}
              className={`
                w-full flex items-center gap-3
                px-4 py-3 rounded-lg text-left
                transition
                ${
                  active
                    ? "bg-blue-600"
                    : "hover:bg-slate-700"
                }
              `}
            >
              <span>{menu.icon}</span>
              <span>{menu.name}</span>
            </button>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <button
        onClick={onLogout}
        className="w-full mt-4 bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg font-bold"
      >
        🚪 ออกจากระบบ
      </button>
    </aside>
  );
}
```
