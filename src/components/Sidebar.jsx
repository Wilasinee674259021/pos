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
} from "lucide-react";

export default function Sidebar({
  currentPage,
  setCurrentPage,
  currentUser,
  onLogout,
}) {
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

  const userRole =
    roleMap[String(currentUser?.role || "").trim()] || "";

  // =========================
  // MENU
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

  const visibleMenus = menus.filter((menu) =>
    menu.roles.includes(userRole)
  );

  // =========================
  // LOGO
  // =========================

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      {/* HEADER */}

      <div className="px-6 py-5 border-b border-slate-700">
        <h1 className="text-xl font-bold">
          Convenience POS
        </h1>

        <p className="text-sm text-slate-400 mt-1">
          ระบบจัดการร้านค้า
        </p>
      </div>

      {/* USER */}

      <div className="px-5 py-4 border-b border-slate-700">
        <p className="font-semibold truncate">
          {currentUser?.name || "ผู้ใช้งาน"}
        </p>

        <p className="text-sm text-slate-400 mt-1">
          {userRole || "ไม่ระบุสิทธิ์"}
        </p>
      </div>

      {/* MENU */}

      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-1">
          {visibleMenus.map((menu) => {
            const Icon = menu.icon;
            const active = currentPage === menu.name;

            return (
              <button
                key={menu.name}
                type="button"
                onClick={() => setCurrentPage(menu.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={20} />

                <span className="text-sm font-medium">
                  {menu.name}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* LOGOUT */}

      <div className="p-3 border-t border-slate-700">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
        >
          <LogOut size={20} />

          <span className="text-sm font-medium">
            ออกจากระบบ
          </span>
        </button>
      </div>
    </aside>
  );
}