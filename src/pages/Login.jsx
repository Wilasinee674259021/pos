
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    setError("");

    if (!username || !password) {
      setError("กรุณากรอก Username และ Password");
      return;
    }

    // ===============================
    // สร้างบัญชีเริ่มต้น
    // ===============================
    const savedEmployees =
      localStorage.getItem("pos_employees");

    let employees = savedEmployees
      ? JSON.parse(savedEmployees)
      : [];

    // ถ้ายังไม่มีพนักงาน ให้สร้าง Admin อัตโนมัติ
    if (employees.length === 0) {
      employees = [
        {
          id: 1,
          name: "ผู้ดูแลระบบ",
          username: "admin",
          password: "1234",
          role: "admin",
          position: "ผู้ดูแลระบบ",
          status: "เปิดใช้งาน",
        },
        {
          id: 2,
          name: "พนักงานหน้าร้าน",
          username: "staff",
          password: "1234",
          role: "staff",
          position: "พนักงาน",
          status: "เปิดใช้งาน",
        },
      ];

      localStorage.setItem(
        "pos_employees",
        JSON.stringify(employees)
      );
    }

    // ===============================
    // ตรวจสอบ Username + Password
    // ===============================
    const employee = employees.find(
      (item) =>
        item.username.toLowerCase() ===
          username.toLowerCase() &&
        item.password === password
    );

    if (!employee) {
      setError("Username หรือ Password ไม่ถูกต้อง");
      return;
    }

    // ===============================
    // ตรวจสอบสถานะบัญชี
    // ===============================
    if (employee.status !== "เปิดใช้งาน") {
      setError(
        "บัญชีนี้ถูกปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบ"
      );
      return;
    }

    // ===============================
    // บันทึกผู้ใช้งานปัจจุบัน
    // ===============================
    localStorage.setItem(
      "pos_current_user",
      JSON.stringify(employee)
    );

    // ===============================
    // บันทึก Audit Log
    // ===============================
    const savedLogs =
      localStorage.getItem("pos_audit_logs");

    const logs = savedLogs
      ? JSON.parse(savedLogs)
      : [];

    logs.unshift({
      id: Date.now(),
      date: new Date().toLocaleString("th-TH"),
      employee: employee.name,
      action: "เข้าสู่ระบบ",
      module: "ระบบ",
      detail: `เข้าสู่ระบบด้วย Username ${employee.username}`,
      type: "login",
    });

    localStorage.setItem(
      "pos_audit_logs",
      JSON.stringify(logs)
    );

    // ===============================
    // เข้าสู่ระบบ
    // ===============================
    onLogin(employee);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-6 sm:px-6">

      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-72 h-72 sm:w-96 sm:h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-72 h-72 sm:w-96 sm:h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">

        {/* =========================
            BRAND
        ========================= */}
        <div className="text-center mb-6 sm:mb-8">

          {/* Logo */}
          <div className="mx-auto mb-4 sm:mb-5 w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-900/30 rotate-0">
            <span className="text-4xl sm:text-5xl">
              🏪
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Convenience POS
          </h1>

          <p className="text-sm sm:text-base text-slate-400 mt-2">
            ระบบจัดการร้านสะดวกซื้อ
          </p>
        </div>

        {/* =========================
            LOGIN CARD
        ========================= */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-black/30 overflow-hidden">

          {/* Card Header */}
          <div className="px-5 pt-6 pb-3 sm:px-8 sm:pt-8 sm:pb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              ยินดีต้อนรับ 👋
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              เข้าสู่ระบบเพื่อเริ่มใช้งาน
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleLogin}
            className="px-5 pb-6 sm:px-8 sm:pb-8 space-y-4 sm:space-y-5"
          >

            {/* USERNAME */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Username
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                </span>

                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  placeholder="กรอก Username"
                  autoComplete="username"
                  className="
                    w-full
                    h-12
                    sm:h-[52px]
                    bg-slate-50
                    border border-slate-200
                    rounded-2xl
                    pl-11
                    pr-4
                    text-sm sm:text-base
                    text-slate-800
                    placeholder:text-slate-400
                    outline-none
                    transition
                    focus:bg-white
                    focus:border-blue-500
                    focus:ring-4
                    focus:ring-blue-500/10
                  "
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>

              <div className="relative">

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="กรอก Password"
                  autoComplete="current-password"
                  className="
                    w-full
                    h-12
                    sm:h-[52px]
                    bg-slate-50
                    border border-slate-200
                    rounded-2xl
                    pl-11
                    pr-12
                    text-sm sm:text-base
                    text-slate-800
                    placeholder:text-slate-400
                    outline-none
                    transition
                    focus:bg-white
                    focus:border-blue-500
                    focus:ring-4
                    focus:ring-blue-500/10
                  "
                />

                {/* PASSWORD EYE */}
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "ซ่อน Password"
                      : "แสดง Password"
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    w-9
                    h-9
                    rounded-xl
                    flex
                    items-center
                    justify-center
                    text-slate-400
                    hover:text-slate-600
                    hover:bg-slate-100
                    active:bg-slate-200
                    transition-all
                    duration-200
                  "
                >
                  {showPassword ? (
                    <EyeOff
                      size={20}
                      strokeWidth={1.8}
                    />
                  ) : (
                    <Eye
                      size={20}
                      strokeWidth={1.8}
                    />
                  )}
                </button>

              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-3 text-sm">
                <span className="shrink-0">
                  ⚠️
                </span>

                <span className="leading-5">
                  {error}
                </span>
              </div>
            )}

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="
                w-full
                h-12
                sm:h-[52px]
                bg-blue-600
                hover:bg-blue-700
                active:bg-blue-800
                text-white
                rounded-2xl
                font-bold
                text-sm sm:text-base
                shadow-lg
                shadow-blue-600/20
                transition-all
                duration-200
                hover:-translate-y-0.5
                active:translate-y-0
              "
            >
              <span className="flex items-center justify-center gap-2">
                <span>เข้าสู่ระบบ</span>
              </span>
            </button>

          </form>

          {/* Card Footer */}
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-8">
            <p className="text-center text-xs text-slate-400">
              Convenience POS System
            </p>
          </div>

        </div>

        {/* Bottom Text */}
        <p className="text-center text-xs text-slate-500 mt-5">
          ระบบจัดการร้านสะดวกซื้อ
        </p>

      </div>
    </div>
  );
}
