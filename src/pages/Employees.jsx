import { useEffect, useState } from "react";

const defaultEmployees = [
  {
    id: 1,
    employeeCode: "EMP001",
    name: "ผู้ดูแลระบบ",
    username: "admin",
    password: "admin123",
    position: "ผู้จัดการ",
    branch: "สาขาหลัก",
    role: "ผู้ดูแลระบบ",
    status: "เปิดใช้งาน",
  },
  {
    id: 2,
    employeeCode: "EMP002",
    name: "พนักงานหน้าร้าน",
    username: "staff",
    password: "staff123",
    position: "พนักงานขาย",
    branch: "สาขาหลัก",
    role: "พนักงาน",
    status: "เปิดใช้งาน",
  },
];

export default function Employees() {
  const [employees, setEmployees] = useState(() => {
    const saved =
      localStorage.getItem("pos_employees");

    return saved
      ? JSON.parse(saved)
      : defaultEmployees;
  });

  const [branches, setBranches] = useState([]);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingEmployee, setEditingEmployee] =
    useState(null);

  const [showPassword, setShowPassword] =
    useState(false);

  const [form, setForm] = useState({
    employeeCode: "",
    name: "",
    username: "",
    password: "",
    position: "พนักงานขาย",
    branch: "สาขาหลัก",
    role: "พนักงาน",
  });

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    localStorage.setItem(
      "pos_employees",
      JSON.stringify(employees)
    );
  }, [employees]);

  useEffect(() => {
    const savedBranches =
      localStorage.getItem("pos_branches");

    if (savedBranches) {
      try {
        setBranches(
          JSON.parse(savedBranches)
        );
      } catch {
        localStorage.removeItem(
          "pos_branches"
        );
        setBranches([]);
      }
    }
  }, []);

  // =========================
  // OPEN ADD
  // =========================

  const openAddForm = () => {
    setEditingEmployee(null);

    setForm({
      employeeCode: "",
      name: "",
      username: "",
      password: "",
      position: "พนักงานขาย",
      branch:
        branches.length > 0
          ? branches[0].name
          : "สาขาหลัก",
      role: "พนักงาน",
    });

    setShowPassword(false);
    setShowForm(true);
  };

  // =========================
  // OPEN EDIT
  // =========================

  const openEditForm = (employee) => {
    setEditingEmployee(employee);

    setForm({
      employeeCode:
        employee.employeeCode,
      name: employee.name,
      username: employee.username,
      password: employee.password,
      position: employee.position,
      branch: employee.branch,
      role: employee.role,
    });

    setShowPassword(false);
    setShowForm(true);
  };

  // =========================
  // HANDLE CHANGE
  // =========================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // SAVE
  // =========================

  const saveEmployee = () => {
    if (
      !form.employeeCode ||
      !form.name ||
      !form.username ||
      !form.password ||
      !form.position ||
      !form.branch ||
      !form.role
    ) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    // ตรวจรหัสพนักงานซ้ำ
    const duplicateCode =
      employees.some(
        (employee) =>
          String(employee.employeeCode || "")
            .toLowerCase() ===
            String(form.employeeCode || "")
              .toLowerCase() &&
          employee.id !==
            editingEmployee?.id
      );

    if (duplicateCode) {
      alert("รหัสพนักงานนี้มีอยู่แล้ว");
      return;
    }

    // ตรวจ username ซ้ำ
    const duplicateUsername =
      employees.some(
        (employee) =>
          String(employee.username || "")
            .toLowerCase() ===
            String(form.username || "")
              .toLowerCase() &&
          employee.id !==
            editingEmployee?.id
      );

    if (duplicateUsername) {
      alert("Username นี้มีอยู่แล้ว");
      return;
    }

    if (editingEmployee) {
      setEmployees(
        employees.map((employee) =>
          employee.id ===
          editingEmployee.id
            ? {
                ...employee,
                ...form,
              }
            : employee
        )
      );

      alert(
        "แก้ไขข้อมูลพนักงานเรียบร้อย"
      );
    } else {
      const newEmployee = {
        id: Date.now(),
        ...form,
        status: "เปิดใช้งาน",
      };

      setEmployees([
        ...employees,
        newEmployee,
      ]);

      alert("เพิ่มพนักงานเรียบร้อย");
    }

    setShowForm(false);
  };

  // =========================
  // DELETE
  // =========================

  const deleteEmployee = (id) => {
    const employee =
      employees.find(
        (item) => item.id === id
      );

    if (
      employee?.username === "admin"
    ) {
      alert(
        "ไม่สามารถลบบัญชี admin ได้"
      );
      return;
    }

    const confirmDelete =
      window.confirm(
        "ต้องการลบพนักงานคนนี้ใช่หรือไม่?"
      );

    if (!confirmDelete) return;

    setEmployees(
      employees.filter(
        (employee) =>
          employee.id !== id
      )
    );
  };

  // =========================
  // TOGGLE STATUS
  // =========================

  const toggleStatus = (id) => {
    setEmployees(
      employees.map((employee) =>
        employee.id === id
          ? {
              ...employee,
              status:
                employee.status ===
                "เปิดใช้งาน"
                  ? "ปิดใช้งาน"
                  : "เปิดใช้งาน",
            }
          : employee
      )
    );
  };

  // =========================
  // SEARCH
  // =========================

  const filteredEmployees =
    employees.filter((employee) => {
      const keyword =
        search.toLowerCase();

      return (
        String(
          employee.employeeCode || ""
        )
          .toLowerCase()
          .includes(keyword) ||
        String(employee.name || "")
          .toLowerCase()
          .includes(keyword) ||
        String(employee.username || "")
          .toLowerCase()
          .includes(keyword) ||
        String(employee.position || "")
          .toLowerCase()
          .includes(keyword)
      );
    });

  // =========================
  // SUMMARY
  // =========================

  const activeEmployees =
    employees.filter(
      (employee) =>
        employee.status ===
        "เปิดใช้งาน"
    ).length;

  const inactiveEmployees =
    employees.filter(
      (employee) =>
        employee.status ===
        "ปิดใช้งาน"
    ).length;

  const adminEmployees =
    employees.filter(
      (employee) =>
        employee.role ===
        "ผู้ดูแลระบบ"
    ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-5 lg:p-8">

      {/* HEADER */}

      <div className="mb-5 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            👨‍💼 จัดการพนักงาน
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            จัดการบัญชีพนักงาน ตำแหน่ง และสิทธิ์การใช้งาน
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="
            w-full
            rounded-lg
            bg-blue-600
            px-4
            py-2
            text-sm
            font-medium
            text-white
            transition
            hover:bg-blue-700
            sm:w-auto
          "
        >
          ＋ เพิ่มพนักงาน
        </button>

      </div>

      {/* SUMMARY */}

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">

        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
          <p className="text-xs text-slate-500 sm:text-sm">
            พนักงานทั้งหมด
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-800 sm:text-3xl">
            {employees.length}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
          <p className="text-xs text-slate-500 sm:text-sm">
            เปิดใช้งาน
          </p>

          <p className="mt-1 text-2xl font-bold text-green-600 sm:text-3xl">
            {activeEmployees}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
          <p className="text-xs text-slate-500 sm:text-sm">
            ปิดใช้งาน
          </p>

          <p className="mt-1 text-2xl font-bold text-red-500 sm:text-3xl">
            {inactiveEmployees}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
          <p className="text-xs text-slate-500 sm:text-sm">
            ผู้ดูแลระบบ
          </p>

          <p className="mt-1 text-2xl font-bold text-purple-600 sm:text-3xl">
            {adminEmployees}
          </p>
        </div>

      </div>

      {/* SEARCH */}

      <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm sm:mb-6 sm:p-5">

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="🔍 ค้นหารหัสพนักงาน / ชื่อ / Username / ตำแหน่ง"
          className="
            h-10
            w-full
            rounded-lg
            border
            border-slate-300
            px-3
            text-sm
            outline-none
            transition
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-500/20
          "
        />

      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px]">

            <thead className="bg-slate-100">

              <tr>

                <th className="p-3 text-left text-sm font-semibold text-slate-700">
                  รหัส
                </th>

                <th className="p-3 text-left text-sm font-semibold text-slate-700">
                  พนักงาน
                </th>

                <th className="p-3 text-left text-sm font-semibold text-slate-700">
                  Username
                </th>

                <th className="p-3 text-left text-sm font-semibold text-slate-700">
                  ตำแหน่ง
                </th>

                <th className="p-3 text-left text-sm font-semibold text-slate-700">
                  สาขา
                </th>

                <th className="p-3 text-center text-sm font-semibold text-slate-700">
                  สิทธิ์
                </th>

                <th className="p-3 text-center text-sm font-semibold text-slate-700">
                  สถานะ
                </th>

                <th className="p-3 text-center text-sm font-semibold text-slate-700">
                  จัดการ
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredEmployees.map(
                (employee) => (

                  <tr
                    key={employee.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50"
                  >

                    <td className="p-3 text-sm font-bold text-slate-800">
                      {employee.employeeCode}
                    </td>

                    <td className="p-3 text-sm">
                      <div className="font-semibold text-slate-800">
                        {employee.name}
                      </div>
                    </td>

                    <td className="p-3 text-sm text-slate-600">
                      {employee.username}
                    </td>

                    <td className="p-3 text-sm text-slate-600">
                      {employee.position}
                    </td>

                    <td className="p-3 text-sm text-slate-600">
                      {employee.branch}
                    </td>

                    <td className="p-3 text-center">

                      <span
                        className={`
                          inline-flex
                          rounded-full
                          px-2.5
                          py-1
                          text-xs
                          font-medium
                          ${
                            employee.role ===
                            "ผู้ดูแลระบบ"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }
                        `}
                      >
                        {employee.role}
                      </span>

                    </td>

                    <td className="p-3 text-center">

                      <button
                        onClick={() =>
                          toggleStatus(
                            employee.id
                          )
                        }
                        className={`
                          rounded-full
                          px-2.5
                          py-1
                          text-xs
                          font-medium
                          transition
                          ${
                            employee.status ===
                            "เปิดใช้งาน"
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }
                        `}
                      >
                        {employee.status}
                      </button>

                    </td>

                    {/* ACTIONS */}

                    <td className="p-3">

                      <div className="flex items-center justify-center gap-1.5">

                        {/* EDIT */}
                        <button
                          onClick={() =>
                            openEditForm(
                              employee
                            )
                          }
                          title="แก้ไข"
                          className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-md
                            bg-blue-50
                            text-sm
                            text-blue-600
                            transition
                            hover:bg-blue-100
                            active:scale-95
                          "
                        >
                          ✏️
                        </button>

                        {/* DELETE */}
                        <button
                          onClick={() =>
                            deleteEmployee(
                              employee.id
                            )
                          }
                          title="ลบ"
                          className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-md
                            bg-red-50
                            text-sm
                            text-red-600
                            transition
                            hover:bg-red-100
                            active:scale-95
                          "
                        >
                          🗑️
                        </button>

                      </div>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

        {filteredEmployees.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">
            ไม่พบพนักงาน
          </div>
        )}

      </div>

      {/* FORM MODAL */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-[650px] overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7">

            {/* TITLE */}

            <div className="mb-5 flex items-center justify-between">

              <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">
                {editingEmployee
                  ? "✏️ แก้ไขพนักงาน"
                  : "➕ เพิ่มพนักงาน"}
              </h2>

              <button
                onClick={() =>
                  setShowForm(false)
                }
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-md
                  text-lg
                  text-slate-500
                  hover:bg-slate-100
                "
              >
                ✕
              </button>

            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* EMPLOYEE CODE */}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  รหัสพนักงาน
                </label>

                <input
                  name="employeeCode"
                  value={
                    form.employeeCode
                  }
                  onChange={handleChange}
                  placeholder="เช่น EMP003"
                  className="
                    h-10
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    px-3
                    text-sm
                    outline-none
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-500/20
                  "
                />
              </div>

              {/* NAME */}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  ชื่อ-นามสกุล
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="ชื่อพนักงาน"
                  className="
                    h-10
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    px-3
                    text-sm
                    outline-none
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-500/20
                  "
                />
              </div>

              {/* USERNAME */}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Username
                </label>

                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Username สำหรับเข้าสู่ระบบ"
                  className="
                    h-10
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    px-3
                    text-sm
                    outline-none
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-500/20
                  "
                />
              </div>

              {/* PASSWORD */}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Password
                </label>

                <div className="relative">

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="รหัสผ่าน"
                    className="
                      h-10
                      w-full
                      rounded-lg
                      border
                      border-slate-300
                      px-3
                      pr-11
                      text-sm
                      outline-none
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-500/20
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="
                      absolute
                      right-2
                      top-1/2
                      flex
                      h-7
                      w-7
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-md
                      text-sm
                      hover:bg-slate-100
                    "
                  >
                    {showPassword
                      ? "🙈"
                      : "👁️"}
                  </button>

                </div>
              </div>

              {/* POSITION */}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  ตำแหน่ง
                </label>

                <select
                  name="position"
                  value={form.position}
                  onChange={handleChange}
                  className="
                    h-10
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    px-3
                    text-sm
                    outline-none
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-500/20
                  "
                >
                  <option>
                    พนักงานขาย
                  </option>

                  <option>
                    Counter Staff
                  </option>

                  <option>
                    Play Area Staff
                  </option>

                  <option>
                    ผู้จัดการ
                  </option>

                  <option>
                    ผู้ดูแลระบบ
                  </option>
                </select>
              </div>

              {/* BRANCH */}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  สาขา
                </label>

                <select
                  name="branch"
                  value={form.branch}
                  onChange={handleChange}
                  className="
                    h-10
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    px-3
                    text-sm
                    outline-none
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-500/20
                  "
                >
                  {branches.length > 0 ? (
                    branches.map(
                      (branch) => (
                        <option
                          key={branch.id}
                          value={branch.name}
                        >
                          {branch.name}
                        </option>
                      )
                    )
                  ) : (
                    <option>
                      สาขาหลัก
                    </option>
                  )}
                </select>
              </div>

              {/* ROLE */}

              <div className="sm:col-span-2">

                <label className="mb-1 block text-sm font-medium text-slate-700">
                  สิทธิ์การใช้งาน
                </label>

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="
                    h-10
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    px-3
                    text-sm
                    outline-none
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-500/20
                  "
                >
                  <option>
                    พนักงาน
                  </option>

                  <option>
                    ผู้จัดการ
                  </option>

                  <option>
                    ผู้ดูแลระบบ
                  </option>
                </select>

              </div>

            </div>

            {/* ROLE INFO */}

            <div className="mt-5 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">

              <p className="mb-2 font-bold">
                🔐 สิทธิ์การใช้งาน
              </p>

              <p>
                • พนักงาน: ใช้งานหน้าคิดเงินและงานประจำวัน
              </p>

              <p>
                • ผู้จัดการ: จัดการสินค้า สต๊อก สมาชิก และรายงาน
              </p>

              <p>
                • ผู้ดูแลระบบ: จัดการระบบและพนักงานทั้งหมด
              </p>

            </div>

            {/* BUTTON */}

            <div className="mt-6 flex gap-2">

              <button
                onClick={() =>
                  setShowForm(false)
                }
                className="
                  flex-1
                  rounded-lg
                  border
                  border-slate-300
                  py-2
                  text-sm
                  font-medium
                  text-slate-600
                  transition
                  hover:bg-slate-50
                "
              >
                ยกเลิก
              </button>

              <button
                onClick={saveEmployee}
                className="
                  flex-1
                  rounded-lg
                  bg-blue-600
                  py-2
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:bg-blue-700
                "
              >
                💾 บันทึก
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}