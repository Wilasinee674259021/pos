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
      setBranches(
        JSON.parse(savedBranches)
      );
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
      alert(
        "กรุณากรอกข้อมูลให้ครบ"
      );
      return;
    }

    // ตรวจรหัสพนักงานซ้ำ
    const duplicateCode =
      employees.some(
        (employee) =>
          employee.employeeCode
            .toLowerCase() ===
            form.employeeCode
              .toLowerCase() &&
          employee.id !==
            editingEmployee?.id
      );

    if (duplicateCode) {
      alert(
        "รหัสพนักงานนี้มีอยู่แล้ว"
      );
      return;
    }

    // ตรวจ username ซ้ำ
    const duplicateUsername =
      employees.some(
        (employee) =>
          employee.username
            .toLowerCase() ===
            form.username
              .toLowerCase() &&
          employee.id !==
            editingEmployee?.id
      );

    if (duplicateUsername) {
      alert(
        "Username นี้มีอยู่แล้ว"
      );
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

      alert(
        "เพิ่มพนักงานเรียบร้อย"
      );
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
        employee.employeeCode
          .toLowerCase()
          .includes(keyword) ||
        employee.name
          .toLowerCase()
          .includes(keyword) ||
        employee.username
          .toLowerCase()
          .includes(keyword) ||
        employee.position
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
    <div className="p-8 bg-slate-50 min-h-screen">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-7">

        <div>

          <h1 className="text-3xl font-bold text-slate-800">
            👨‍💼 จัดการพนักงาน
          </h1>

          <p className="text-slate-500 mt-1">
            จัดการบัญชีพนักงาน ตำแหน่ง และสิทธิ์การใช้งาน
          </p>

        </div>

        <button
          onClick={openAddForm}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700"
        >
          ＋ เพิ่มพนักงาน
        </button>

      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-4 gap-4 mb-6">

        <div className="bg-white rounded-2xl p-5 shadow-sm">

          <p className="text-slate-500">
            พนักงานทั้งหมด
          </p>

          <p className="text-3xl font-bold mt-2">
            {employees.length}
          </p>

        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">

          <p className="text-slate-500">
            เปิดใช้งาน
          </p>

          <p className="text-3xl font-bold text-green-600 mt-2">
            {activeEmployees}
          </p>

        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">

          <p className="text-slate-500">
            ปิดใช้งาน
          </p>

          <p className="text-3xl font-bold text-red-500 mt-2">
            {inactiveEmployees}
          </p>

        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">

          <p className="text-slate-500">
            ผู้ดูแลระบบ
          </p>

          <p className="text-3xl font-bold text-purple-600 mt-2">
            {adminEmployees}
          </p>

        </div>

      </div>

      {/* SEARCH */}

      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="🔍 ค้นหารหัสพนักงาน / ชื่อ / Username / ตำแหน่ง"
          className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />

      </div>

      {/* TABLE */}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="text-left p-4">
                รหัส
              </th>

              <th className="text-left p-4">
                พนักงาน
              </th>

              <th className="text-left p-4">
                Username
              </th>

              <th className="text-left p-4">
                ตำแหน่ง
              </th>

              <th className="text-left p-4">
                สาขา
              </th>

              <th className="text-center p-4">
                สิทธิ์
              </th>

              <th className="text-center p-4">
                สถานะ
              </th>

              <th className="text-center p-4">
                จัดการ
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredEmployees.map(
              (employee) => (

                <tr
                  key={employee.id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="p-4 font-bold">
                    {employee.employeeCode}
                  </td>

                  <td className="p-4">
                    <div className="font-bold">
                      {employee.name}
                    </div>
                  </td>

                  <td className="p-4">
                    {employee.username}
                  </td>

                  <td className="p-4">
                    {employee.position}
                  </td>

                  <td className="p-4">
                    {employee.branch}
                  </td>

                  <td className="p-4 text-center">

                    <span
                      className={
                        employee.role ===
                        "ผู้ดูแลระบบ"
                          ? "bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                          : "bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                      }
                    >
                      {employee.role}
                    </span>

                  </td>

                  <td className="p-4 text-center">

                    <button
                      onClick={() =>
                        toggleStatus(
                          employee.id
                        )
                      }
                      className={
                        employee.status ===
                        "เปิดใช้งาน"
                          ? "bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                          : "bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm"
                      }
                    >
                      {employee.status}
                    </button>

                  </td>

                  <td className="p-4">

                    <div className="flex justify-center gap-2">

                      <button
                        onClick={() =>
                          openEditForm(
                            employee
                          )
                        }
                        className="bg-blue-100 text-blue-600 px-3 py-2 rounded-lg"
                      >
                        ✏️
                      </button>

                      <button
                        onClick={() =>
                          deleteEmployee(
                            employee.id
                          )
                        }
                        className="bg-red-100 text-red-600 px-3 py-2 rounded-lg"
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

        {filteredEmployees.length ===
          0 && (

          <div className="text-center py-12 text-slate-400">
            ไม่พบพนักงาน
          </div>

        )}

      </div>

      {/* =========================
          FORM MODAL
      ========================= */}

      {showForm && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl w-[650px] max-h-[90vh] overflow-y-auto p-7 shadow-xl">

            {/* TITLE */}

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-2xl font-bold">
                {editingEmployee
                  ? "✏️ แก้ไขพนักงาน"
                  : "➕ เพิ่มพนักงาน"}
              </h2>

              <button
                onClick={() =>
                  setShowForm(false)
                }
                className="text-xl text-slate-500"
              >
                ✕
              </button>

            </div>

            <div className="grid grid-cols-2 gap-4">

              {/* EMPLOYEE CODE */}

              <div>

                <label className="block mb-2 font-medium">
                  รหัสพนักงาน
                </label>

                <input
                  name="employeeCode"
                  value={
                    form.employeeCode
                  }
                  onChange={handleChange}
                  placeholder="เช่น EMP003"
                  className="w-full border rounded-lg p-3"
                />

              </div>

              {/* NAME */}

              <div>

                <label className="block mb-2 font-medium">
                  ชื่อ-นามสกุล
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="ชื่อพนักงาน"
                  className="w-full border rounded-lg p-3"
                />

              </div>

              {/* USERNAME */}

              <div>

                <label className="block mb-2 font-medium">
                  Username
                </label>

                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Username สำหรับเข้าสู่ระบบ"
                  className="w-full border rounded-lg p-3"
                />

              </div>

              {/* PASSWORD */}

              <div>

                <label className="block mb-2 font-medium">
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
                    className="w-full border rounded-lg p-3 pr-12"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-3 top-3"
                  >
                    {showPassword
                      ? "🙈"
                      : "👁️"}
                  </button>

                </div>

              </div>

              {/* POSITION */}

              <div>

                <label className="block mb-2 font-medium">
                  ตำแหน่ง
                </label>

                <select
                  name="position"
                  value={form.position}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3"
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

                <label className="block mb-2 font-medium">
                  สาขา
                </label>

                <select
                  name="branch"
                  value={form.branch}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3"
                >

                  {branches.length >
                  0 ? (
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

              <div className="col-span-2">

                <label className="block mb-2 font-medium">
                  สิทธิ์การใช้งาน
                </label>

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3"
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

            <div className="bg-blue-50 rounded-xl p-4 mt-5 text-sm text-blue-700">

              <p className="font-bold mb-2">
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

            <div className="flex gap-3 mt-7">

              <button
                onClick={() =>
                  setShowForm(false)
                }
                className="flex-1 border rounded-lg py-3"
              >
                ยกเลิก
              </button>

              <button
                onClick={saveEmployee}
                className="flex-1 bg-blue-600 text-white rounded-lg py-3 font-bold"
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