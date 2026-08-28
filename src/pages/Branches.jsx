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
    <div className="p-8 bg-slate-50 min-h-screen">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-7">

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            🏪 จัดการสาขา
          </h1>

          <p className="text-slate-500 mt-1">
            จัดการข้อมูลและสถานะของแต่ละสาขา
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700"
        >
          ＋ เพิ่มสาขา
        </button>

      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-3 gap-4 mb-6">

        <div className="bg-white rounded-2xl p-5 shadow-sm">

          <p className="text-slate-500">
            สาขาทั้งหมด
          </p>

          <p className="text-3xl font-bold mt-2">
            {branches.length}
          </p>

        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">

          <p className="text-slate-500">
            เปิดใช้งาน
          </p>

          <p className="text-3xl font-bold text-green-600 mt-2">
            {
              branches.filter(
                (branch) =>
                  branch.status ===
                  "เปิดใช้งาน"
              ).length
            }
          </p>

        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">

          <p className="text-slate-500">
            ปิดใช้งาน
          </p>

          <p className="text-3xl font-bold text-red-500 mt-2">
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

      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="🔍 ค้นหารหัสสาขา / ชื่อสาขา / ที่อยู่"
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
                ชื่อสาขา
              </th>

              <th className="text-left p-4">
                ที่อยู่
              </th>

              <th className="text-left p-4">
                เบอร์โทร
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

            {filteredBranches.map(
              (branch) => (

                <tr
                  key={branch.id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="p-4 font-bold">
                    {branch.code}
                  </td>

                  <td className="p-4 font-medium">
                    {branch.name}
                  </td>

                  <td className="p-4">
                    {branch.address}
                  </td>

                  <td className="p-4">
                    {branch.phone}
                  </td>

                  <td className="p-4 text-center">

                    <button
                      onClick={() =>
                        toggleStatus(
                          branch.id
                        )
                      }
                      className={
                        branch.status ===
                        "เปิดใช้งาน"
                          ? "bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                          : "bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm"
                      }
                    >
                      {branch.status}
                    </button>

                  </td>

                  <td className="p-4">

                    <div className="flex justify-center gap-2">

                      <button
                        onClick={() =>
                          openEditForm(
                            branch
                          )
                        }
                        className="bg-blue-100 text-blue-600 px-3 py-2 rounded-lg"
                      >
                        ✏️
                      </button>

                      <button
                        onClick={() =>
                          deleteBranch(
                            branch.id
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

        {filteredBranches.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            ไม่พบสาขา
          </div>
        )}

      </div>

      {/* MODAL */}

      {showForm && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl w-[550px] p-7 shadow-xl">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-2xl font-bold">
                {editingBranch
                  ? "✏️ แก้ไขสาขา"
                  : "➕ เพิ่มสาขา"}
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

            <div className="space-y-4">

              <div>

                <label className="block mb-1 font-medium">
                  รหัสสาขา
                </label>

                <input
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="เช่น BR001"
                  className="w-full border rounded-lg p-3"
                />

              </div>

              <div>

                <label className="block mb-1 font-medium">
                  ชื่อสาขา
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="เช่น สาขานครปฐม"
                  className="w-full border rounded-lg p-3"
                />

              </div>

              <div>

                <label className="block mb-1 font-medium">
                  ที่อยู่
                </label>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="กรอกที่อยู่สาขา"
                  className="w-full border rounded-lg p-3 h-24"
                />

              </div>

              <div>

                <label className="block mb-1 font-medium">
                  เบอร์โทรศัพท์
                </label>

                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="เช่น 034-123-456"
                  className="w-full border rounded-lg p-3"
                />

              </div>

            </div>

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
                onClick={saveBranch}
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