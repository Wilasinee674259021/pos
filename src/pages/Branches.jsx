import { useEffect, useState } from "react";

const defaultBranches = [
  {
    id: 1,
    code: "BR001",
    name: "สาขาหลัก",
    address: "นครปฐม",
    phone: "034-111-111",
    status: "เปิดใช้งาน",
  },
];

export default function Branches() {
  const [branches, setBranches] = useState(() => {
    const saved = localStorage.getItem("pos_branches");

    return saved
      ? JSON.parse(saved)
      : defaultBranches;
  });

  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    code: "",
    name: "",
    address: "",
    phone: "",
  });

  useEffect(() => {
    localStorage.setItem(
      "pos_branches",
      JSON.stringify(branches)
    );
  }, [branches]);

  // =========================
  // OPEN ADD
  // =========================

  const openAddForm = () => {
    setEditingBranch(null);

    setForm({
      code: "",
      name: "",
      address: "",
      phone: "",
    });

    setShowForm(true);
  };

  // =========================
  // OPEN EDIT
  // =========================

  const openEditForm = (branch) => {
    setEditingBranch(branch);

    setForm({
      code: branch.code,
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
    });

    setShowForm(true);
  };

  // =========================
  // CHANGE
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

  const saveBranch = () => {
    if (
      !form.code ||
      !form.name ||
      !form.address ||
      !form.phone
    ) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    if (editingBranch) {
      setBranches(
        branches.map((branch) =>
          branch.id === editingBranch.id
            ? {
                ...branch,
                ...form,
              }
            : branch
        )
      );

      alert("แก้ไขข้อมูลสาขาเรียบร้อย");
    } else {
      const duplicate = branches.some(
        (branch) =>
          branch.code.toLowerCase() ===
          form.code.toLowerCase()
      );

      if (duplicate) {
        alert("รหัสสาขานี้มีอยู่แล้ว");
        return;
      }

      const newBranch = {
        id: Date.now(),
        code: form.code,
        name: form.name,
        address: form.address,
        phone: form.phone,
        status: "เปิดใช้งาน",
      };

      setBranches([
        ...branches,
        newBranch,
      ]);

      alert("เพิ่มสาขาเรียบร้อย");
    }

    setShowForm(false);
  };

  // =========================
  // DELETE
  // =========================

  const deleteBranch = (id) => {
    if (branches.length === 1) {
      alert("ต้องมีอย่างน้อย 1 สาขา");
      return;
    }

    const confirmDelete = window.confirm(
      "ต้องการลบสาขานี้ใช่หรือไม่?"
    );

    if (!confirmDelete) return;

    setBranches(
      branches.filter(
        (branch) => branch.id !== id
      )
    );
  };

  // =========================
  // TOGGLE STATUS
  // =========================

  const toggleStatus = (id) => {
    setBranches(
      branches.map((branch) =>
        branch.id === id
          ? {
              ...branch,
              status:
                branch.status === "เปิดใช้งาน"
                  ? "ปิดใช้งาน"
                  : "เปิดใช้งาน",
            }
          : branch
      )
    );
  };

  // =========================
  // SEARCH
  // =========================

  const filteredBranches =
    branches.filter((branch) => {
      const keyword =
        search.toLowerCase();

      return (
        branch.code
          .toLowerCase()
          .includes(keyword) ||
        branch.name
          .toLowerCase()
          .includes(keyword) ||
        branch.address
          .toLowerCase()
          .includes(keyword)
      );
    });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-5 lg:p-8">

      {/* HEADER */}

      <div className="mb-5 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            🏪 จัดการสาขา
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            จัดการข้อมูลและสถานะของแต่ละสาขา
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
          ＋ เพิ่มสาขา
        </button>

      </div>

      {/* SUMMARY */}

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">

        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-slate-500">
            สาขาทั้งหมด
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-800 sm:text-3xl">
            {branches.length}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-slate-500">
            เปิดใช้งาน
          </p>

          <p className="mt-1 text-2xl font-bold text-green-600 sm:text-3xl">
            {
              branches.filter(
                (branch) =>
                  branch.status ===
                  "เปิดใช้งาน"
              ).length
            }
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-slate-500">
            ปิดใช้งาน
          </p>

          <p className="mt-1 text-2xl font-bold text-red-500 sm:text-3xl">
            {
              branches.filter(
                (branch) =>
                  branch.status ===
                  "ปิดใช้งาน"
              ).length
            }
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
          placeholder="🔍 ค้นหารหัสสาขา / ชื่อสาขา / ที่อยู่"
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

          <table className="w-full min-w-[750px]">

            <thead className="bg-slate-100">

              <tr>

                <th className="p-3 text-left text-sm font-semibold text-slate-700">
                  รหัส
                </th>

                <th className="p-3 text-left text-sm font-semibold text-slate-700">
                  ชื่อสาขา
                </th>

                <th className="p-3 text-left text-sm font-semibold text-slate-700">
                  ที่อยู่
                </th>

                <th className="p-3 text-left text-sm font-semibold text-slate-700">
                  เบอร์โทร
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

              {filteredBranches.map(
                (branch) => (

                  <tr
                    key={branch.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50"
                  >

                    <td className="p-3 text-sm font-bold text-slate-800">
                      {branch.code}
                    </td>

                    <td className="p-3 text-sm font-medium text-slate-700">
                      {branch.name}
                    </td>

                    <td className="max-w-[250px] truncate p-3 text-sm text-slate-600">
                      {branch.address}
                    </td>

                    <td className="p-3 text-sm text-slate-600">
                      {branch.phone}
                    </td>

                    <td className="p-3 text-center">

                      <button
                        onClick={() =>
                          toggleStatus(
                            branch.id
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
                            branch.status ===
                            "เปิดใช้งาน"
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }
                        `}
                      >
                        {branch.status}
                      </button>

                    </td>

                    <td className="p-3">

                      {/* ปุ่มเล็กลง */}
                      <div className="flex items-center justify-center gap-1.5">

                        <button
                          onClick={() =>
                            openEditForm(
                              branch
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

                        <button
                          onClick={() =>
                            deleteBranch(
                              branch.id
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

        {filteredBranches.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">
            ไม่พบสาขา
          </div>
        )}

      </div>

      {/* MODAL */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-[550px] overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7">

            <div className="mb-5 flex items-center justify-between">

              <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">
                {editingBranch
                  ? "✏️ แก้ไขสาขา"
                  : "➕ เพิ่มสาขา"}
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

            <div className="space-y-4">

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  รหัสสาขา
                </label>

                <input
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="เช่น BR001"
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

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  ชื่อสาขา
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="เช่น สาขานครปฐม"
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

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  ที่อยู่
                </label>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="กรอกที่อยู่สาขา"
                  className="
                    h-24
                    w-full
                    resize-none
                    rounded-lg
                    border
                    border-slate-300
                    p-3
                    text-sm
                    outline-none
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-500/20
                  "
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  เบอร์โทรศัพท์
                </label>

                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="เช่น 034-123-456"
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

            </div>

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
                onClick={saveBranch}
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