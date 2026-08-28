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
    const saved =
      localStorage.getItem("pos_audit_logs");

    return saved
      ? JSON.parse(saved)
      : defaultLogs;
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
      date: new Date().toLocaleString(
        "th-TH"
      ),
      employee,
      action,
      module,
      detail,
      type,
    };

    setLogs((prev) => [
      newLog,
      ...prev,
    ]);
  };

  // =========================
  // CLEAR LOG
  // =========================

  const clearLogs = () => {
    const confirmClear =
      window.confirm(
        "ต้องการลบประวัติทั้งหมดใช่หรือไม่?"
      );

    if (!confirmClear) return;

    setLogs([]);
  };

  // =========================
  // FILTER
  // =========================

  const filteredLogs = logs.filter(
    (log) => {
      const keyword =
        search.toLowerCase();

      const matchSearch =
        log.employee
          .toLowerCase()
          .includes(keyword) ||
        log.action
          .toLowerCase()
          .includes(keyword) ||
        log.module
          .toLowerCase()
          .includes(keyword) ||
        log.detail
          .toLowerCase()
          .includes(keyword);

      const matchAction =
        actionFilter === "ทั้งหมด" ||
        log.action === actionFilter;

      return (
        matchSearch &&
        matchAction
      );
    }
  );

  // =========================
  // SUMMARY
  // =========================

  const loginLogs =
    logs.filter(
      (log) =>
        log.type === "login"
    ).length;

  const createLogs =
    logs.filter(
      (log) =>
        log.type === "create"
    ).length;

  const updateLogs =
    logs.filter(
      (log) =>
        log.type === "update"
    ).length;

  const deleteLogs =
    logs.filter(
      (log) =>
        log.type === "delete"
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

  return (
    <div className="p-8 bg-slate-50 min-h-screen">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-7">

        <div>

          <h1 className="text-3xl font-bold text-slate-800">
            🔐 Audit Log
          </h1>

          <p className="text-slate-500 mt-1">
            ตรวจสอบประวัติการทำงานของผู้ใช้งานระบบ
          </p>

        </div>

        <button
          onClick={clearLogs}
          className="bg-red-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-red-700"
        >
          🗑️ ล้างประวัติ
        </button>

      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-4 gap-4 mb-6">

        <div className="bg-white rounded-2xl p-5 shadow-sm">

          <p className="text-slate-500">
            เข้าสู่ระบบ
          </p>

          <p className="text-3xl font-bold text-blue-600 mt-2">
            {loginLogs}
          </p>

          <p className="text-sm text-slate-400">
            ครั้ง
          </p>

        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">

          <p className="text-slate-500">
            เพิ่มข้อมูล
          </p>

          <p className="text-3xl font-bold text-green-600 mt-2">
            {createLogs}
          </p>

          <p className="text-sm text-slate-400">
            รายการ
          </p>

        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">

          <p className="text-slate-500">
            แก้ไขข้อมูล
          </p>

          <p className="text-3xl font-bold text-orange-500 mt-2">
            {updateLogs}
          </p>

          <p className="text-sm text-slate-400">
            รายการ
          </p>

        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">

          <p className="text-slate-500">
            ลบข้อมูล
          </p>

          <p className="text-3xl font-bold text-red-500 mt-2">
            {deleteLogs}
          </p>

          <p className="text-sm text-slate-400">
            รายการ
          </p>

        </div>

      </div>

      {/* SEARCH / FILTER */}

      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">

        <div className="flex gap-3">

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="🔍 ค้นหาพนักงาน / การทำงาน / รายละเอียด"
            className="flex-1 border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={actionFilter}
            onChange={(e) =>
              setActionFilter(
                e.target.value
              )
            }
            className="border border-slate-300 rounded-lg px-4"
          >

            <option>
              ทั้งหมด
            </option>

            <option>
              เข้าสู่ระบบ
            </option>

            <option>
              ออกจากระบบ
            </option>

            <option>
              เพิ่มข้อมูล
            </option>

            <option>
              แก้ไขข้อมูล
            </option>

            <option>
              ลบข้อมูล
            </option>

            <option>
              รับสินค้า
            </option>

            <option>
              ขายสินค้า
            </option>

          </select>

        </div>

      </div>

      {/* TABLE */}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="text-left p-4">
                วัน / เวลา
              </th>

              <th className="text-left p-4">
                ผู้ใช้งาน
              </th>

              <th className="text-left p-4">
                การทำงาน
              </th>

              <th className="text-left p-4">
                โมดูล
              </th>

              <th className="text-left p-4">
                รายละเอียด
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredLogs.map(
              (log) => (

                <tr
                  key={log.id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="p-4 text-sm">
                    {log.date}
                  </td>

                  <td className="p-4 font-medium">
                    {log.employee}
                  </td>

                  <td className="p-4">

                    <span
                      className={`px-3 py-1 rounded-full text-sm ${getTypeClass(
                        log.type
                      )}`}
                    >
                      {log.action}
                    </span>

                  </td>

                  <td className="p-4">
                    {log.module}
                  </td>

                  <td className="p-4 text-slate-600">
                    {log.detail}
                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

        {filteredLogs.length ===
          0 && (

          <div className="text-center py-12 text-slate-400">
            ไม่พบประวัติการทำงาน
          </div>

        )}

      </div>

    </div>
  );
}