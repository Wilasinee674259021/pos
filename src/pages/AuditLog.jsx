import { useEffect, useState } from "react";

const defaultLogs = [
  {
    id: 1,
    date: new Date().toLocaleString("th-TH"),
    employee: "ผู้ดูแลระบบ",
    action: "เข้าสู่ระบบ",
    module: "ระบบ",
    detail: "เข้าสู่ระบบสำเร็จ",
    type: "login",
  },
];

export default function AuditLog() {
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem("pos_audit_logs");

    try {
      return saved ? JSON.parse(saved) : defaultLogs;
    } catch {
      return defaultLogs;
    }
  });

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] =
    useState("ทั้งหมด");

  useEffect(() => {
    localStorage.setItem(
      "pos_audit_logs",
      JSON.stringify(logs)
    );
  }, [logs]);

  // =========================
  // ADD LOG
  // =========================
  const addLog = ({
    employee = "ผู้ดูแลระบบ",
    action,
    module,
    detail,
    type = "info",
  }) => {
    const newLog = {
      id: Date.now(),
      date: new Date().toLocaleString("th-TH"),
      employee,
      action,
      module,
      detail,
      type,
    };

    setLogs((prev) => [newLog, ...prev]);
  };

  // =========================
  // CLEAR LOG
  // =========================
  const clearLogs = () => {
    const confirmClear = window.confirm(
      "ต้องการลบประวัติทั้งหมดใช่หรือไม่?"
    );

    if (!confirmClear) return;

    setLogs([]);
  };

  // =========================
  // FILTER
  // =========================
  const filteredLogs = logs.filter((log) => {
    const keyword = search.toLowerCase();

    const matchSearch =
      String(log.employee || "")
        .toLowerCase()
        .includes(keyword) ||
      String(log.action || "")
        .toLowerCase()
        .includes(keyword) ||
      String(log.module || "")
        .toLowerCase()
        .includes(keyword) ||
      String(log.detail || "")
        .toLowerCase()
        .includes(keyword);

    const matchAction =
      actionFilter === "ทั้งหมด" ||
      log.action === actionFilter;

    return matchSearch && matchAction;
  });

  // =========================
  // SUMMARY
  // =========================
  const loginLogs = logs.filter(
    (log) => log.type === "login"
  ).length;

  const createLogs = logs.filter(
    (log) => log.type === "create"
  ).length;

  const updateLogs = logs.filter(
    (log) => log.type === "update"
  ).length;

  const deleteLogs = logs.filter(
    (log) => log.type === "delete"
  ).length;

  // =========================
  // TYPE STYLE
  // =========================
  const getTypeClass = (type) => {
    switch (type) {
      case "login":
        return "bg-blue-100 text-blue-700";

      case "create":
        return "bg-green-100 text-green-700";

      case "update":
        return "bg-orange-100 text-orange-700";

      case "delete":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getActionIcon = (type) => {
    switch (type) {
      case "login":
        return "🔵";

      case "create":
        return "🟢";

      case "update":
        return "🟠";

      case "delete":
        return "🔴";

      default:
        return "⚪";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

      {/* =========================
          HEADER
      ========================= */}
      <div className="flex flex-col gap-4 mb-6 sm:mb-7 lg:flex-row lg:items-center lg:justify-between">

        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 break-words">
            🔐 Audit Log
          </h1>

          <p className="text-sm sm:text-base text-slate-500 mt-1">
            ตรวจสอบประวัติการทำงานของผู้ใช้งานระบบ
          </p>
        </div>

        <button
          onClick={clearLogs}
          className="
            w-full sm:w-auto
            bg-red-600
            text-white
            px-5 py-3
            rounded-xl
            font-bold
            hover:bg-red-700
            active:scale-[0.98]
            transition
            whitespace-nowrap
          "
        >
          🗑️ ล้างประวัติ
        </button>
      </div>

      {/* =========================
          SUMMARY
      ========================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">

        {/* LOGIN */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm sm:text-base text-slate-500">
                เข้าสู่ระบบ
              </p>

              <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">
                {loginLogs}
              </p>

              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                ครั้ง
              </p>
            </div>

            <div className="text-xl sm:text-2xl">
              🔵
            </div>
          </div>
        </div>

        {/* CREATE */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm sm:text-base text-slate-500">
                เพิ่มข้อมูล
              </p>

              <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">
                {createLogs}
              </p>

              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                รายการ
              </p>
            </div>

            <div className="text-xl sm:text-2xl">
              🟢
            </div>
          </div>
        </div>

        {/* UPDATE */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm sm:text-base text-slate-500">
                แก้ไขข้อมูล
              </p>

              <p className="text-2xl sm:text-3xl font-bold text-orange-500 mt-2">
                {updateLogs}
              </p>

              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                รายการ
              </p>
            </div>

            <div className="text-xl sm:text-2xl">
              🟠
            </div>
          </div>
        </div>

        {/* DELETE */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm sm:text-base text-slate-500">
                ลบข้อมูล
              </p>

              <p className="text-2xl sm:text-3xl font-bold text-red-500 mt-2">
                {deleteLogs}
              </p>

              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                รายการ
              </p>
            </div>

            <div className="text-xl sm:text-2xl">
              🔴
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          SEARCH / FILTER
      ========================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 mb-6">

        <div className="flex flex-col gap-3 lg:flex-row">

          <div className="relative flex-1 min-w-0">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="ค้นหาพนักงาน / การทำงาน / รายละเอียด"
              className="
                w-full
                border border-slate-300
                rounded-xl
                pl-11 pr-4 py-3
                outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:border-blue-500
                text-sm sm:text-base
              "
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) =>
              setActionFilter(e.target.value)
            }
            className="
              w-full lg:w-56
              border border-slate-300
              rounded-xl
              px-4 py-3
              bg-white
              outline-none
              focus:ring-2
              focus:ring-blue-500
              text-sm sm:text-base
              cursor-pointer
            "
          >
            <option>ทั้งหมด</option>
            <option>เข้าสู่ระบบ</option>
            <option>ออกจากระบบ</option>
            <option>เพิ่มข้อมูล</option>
            <option>แก้ไขข้อมูล</option>
            <option>ลบข้อมูล</option>
            <option>รับสินค้า</option>
            <option>ขายสินค้า</option>
          </select>

        </div>

        <div className="flex items-center justify-between gap-3 mt-4 text-sm">
          <span className="text-slate-500">
            แสดงผล{" "}
            <span className="font-bold text-slate-700">
              {filteredLogs.length}
            </span>{" "}
            รายการ
          </span>

          {(search || actionFilter !== "ทั้งหมด") && (
            <button
              onClick={() => {
                setSearch("");
                setActionFilter("ทั้งหมด");
              }}
              className="text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>
      </div>

      {/* =========================
          DESKTOP TABLE
      ========================= */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">

            <thead className="bg-slate-100">
              <tr>
                <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600 whitespace-nowrap">
                  วัน / เวลา
                </th>

                <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600 whitespace-nowrap">
                  ผู้ใช้งาน
                </th>

                <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600 whitespace-nowrap">
                  การทำงาน
                </th>

                <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600 whitespace-nowrap">
                  โมดูล
                </th>

                <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600">
                  รายละเอียด
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="border-t border-slate-100 hover:bg-slate-50 transition"
                >
                  <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap">
                    {log.date}
                  </td>

                  <td className="px-5 py-4 font-medium text-slate-800 whitespace-nowrap">
                    {log.employee}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`
                        inline-flex
                        items-center
                        gap-1.5
                        px-3 py-1.5
                        rounded-full
                        text-sm
                        font-medium
                        whitespace-nowrap
                        ${getTypeClass(log.type)}
                      `}
                    >
                      {getActionIcon(log.type)}
                      {log.action}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-700 whitespace-nowrap">
                    {log.module}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    <div className="max-w-[420px] break-words">
                      {log.detail}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-14 px-4">
            <div className="text-4xl mb-3">
              📭
            </div>

            <p className="text-slate-500 font-medium">
              ไม่พบประวัติการทำงาน
            </p>

            <p className="text-sm text-slate-400 mt-1">
              ลองเปลี่ยนคำค้นหาหรือตัวกรอง
            </p>
          </div>
        )}
      </div>

      {/* =========================
          MOBILE CARDS
      ========================= */}
      <div className="md:hidden space-y-3">

        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="
              bg-white
              rounded-2xl
              shadow-sm
              border border-slate-100
              p-4
            "
          >

            {/* TOP */}
            <div className="flex items-start justify-between gap-3">

              <div className="flex items-center gap-3 min-w-0">

                <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
                  {getActionIcon(log.type)}
                </div>

                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">
                    {log.employee}
                  </p>

                  <p className="text-xs text-slate-400 mt-0.5">
                    {log.date}
                  </p>
                </div>

              </div>

              <span
                className={`
                  shrink-0
                  inline-flex
                  items-center
                  px-2.5 py-1.5
                  rounded-full
                  text-xs
                  font-medium
                  ${getTypeClass(log.type)}
                `}
              >
                {log.action}
              </span>

            </div>

            {/* INFO */}
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">

              <div className="flex gap-3">
                <div className="w-20 shrink-0 text-xs font-medium text-slate-400">
                  โมดูล
                </div>

                <div className="text-sm text-slate-700 font-medium break-words">
                  {log.module}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-20 shrink-0 text-xs font-medium text-slate-400">
                  รายละเอียด
                </div>

                <div className="text-sm text-slate-600 break-words leading-relaxed">
                  {log.detail}
                </div>
              </div>

            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 text-center py-14 px-4">
            <div className="text-4xl mb-3">
              📭
            </div>

            <p className="text-slate-500 font-medium">
              ไม่พบประวัติการทำงาน
            </p>

            <p className="text-sm text-slate-400 mt-1">
              ลองเปลี่ยนคำค้นหาหรือตัวกรอง
            </p>
          </div>
        )}

      </div>

    </div>
  );
}