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

  const filteredBranches = branches.filter(
    (branch) => {
      const keyword = search.toLowerCase().trim();

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
    }
  );

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-4 md:p-6 lg:p-8">

      {/* =========================
          HEADER
      ========================= */}

      <div className="mb-5 sm:mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="min-w-0">
            <h1 className="text-2xl font-bold leading-tight text-slate-800 sm:text-3xl">
              🏪 จัดการสาขา
            </h1>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              จัดการข้อมูลและสถานะของแต่ละสาขา
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="!min-h-0 h-10 w-full rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
          >
            ＋ เพิ่มสาขา
          </button>

        </div>
      </div>

      {/* =========================
          SUMMARY
      ========================= */}

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">

        {/* TOTAL */}
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                สาขาทั้งหมด
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-800 sm:text-3xl">
                {branches.length}
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-lg sm:h-11 sm:w-11 sm:rounded-xl sm:text-xl">
              🏪
            </div>
          </div>

        </div>

        {/* ACTIVE */}
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 sm:text-sm">
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

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-lg sm:h-11 sm:w-11 sm:rounded-xl sm:text-xl">
              ✓
            </div>
          </div>

        </div>

        {/* INACTIVE */}
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 sm:text-sm">
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

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-lg sm:h-11 sm:w-11 sm:rounded-xl sm:text-xl">
              ×
            </div>
          </div>

        </div>

      </div>

      {/* =========================
          SEARCH
      ========================= */}

      <div className="mb-4 rounded-xl border border-slate-100 bg-white p-3 shadow-sm sm:mb-5 sm:rounded-2xl sm:p-4">

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="🔍 ค้นหารหัสสาขา / ชื่อสาขา / ที่อยู่"
          className="!h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 sm:px-4"
        />

      </div>

      {/* =========================
          DESKTOP TABLE
      ========================= */}

      <div className="hidden overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm md:block md:rounded-2xl">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[800px]">

            <thead className="bg-slate-50">

              <tr>

                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                  รหัส
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                  ชื่อสาขา
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                  ที่อยู่
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                  เบอร์โทร
                </th>

                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">
                  สถานะ
                </th>

                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">
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

                    {/* CODE */}

                    <td className="px-4 py-4 align-middle">
                      <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1.5 font-mono text-xs font-bold text-slate-700">
                        {branch.code}
                      </span>
                    </td>

                    {/* NAME */}

                    <td className="px-4 py-4 align-middle">
                      <p className="break-words text-sm font-semibold text-slate-800">
                        {branch.name}
                      </p>
                    </td>

                    {/* ADDRESS */}

                    <td className="max-w-[280px] px-4 py-4 align-middle">
                      <p className="break-words text-sm leading-5 text-slate-600">
                        {branch.address}
                      </p>
                    </td>

                    {/* PHONE */}

                    <td className="px-4 py-4 align-middle">
                      <span className="text-sm text-slate-600">
                        {branch.phone}
                      </span>
                    </td>

                    {/* STATUS */}

                    <td className="px-4 py-4 text-center align-middle">

                      <button
                        onClick={() =>
                          toggleStatus(branch.id)
                        }
                        className={`!min-h-0 h-7 rounded-full px-2.5 text-xs font-medium transition ${
                          branch.status ===
                          "เปิดใช้งาน"
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {branch.status}
                      </button>

                    </td>

                    {/* ACTION */}

                    <td className="px-4 py-4 align-middle">

                      <div className="flex items-center justify-center gap-1.5">

                        <button
                          onClick={() =>
                            openEditForm(branch)
                          }
                          title="แก้ไข"
                          className="!min-h-0 flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 p-0 text-sm text-blue-600 transition hover:bg-blue-100 active:scale-95"
                        >
                          ✏️
                        </button>

                        <button
                          onClick={() =>
                            deleteBranch(branch.id)
                          }
                          title="ลบ"
                          className="!min-h-0 flex h-8 w-8 items-center justify-center rounded-md bg-red-50 p-0 text-sm text-red-600 transition hover:bg-red-100 active:scale-95"
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
          <div className="px-5 py-12 text-center text-sm text-slate-400">
            ไม่พบสาขา
          </div>
        )}

      </div>

      {/* =========================
          MOBILE CARDS
      ========================= */}

      <div className="space-y-3 md:hidden">

        {filteredBranches.length > 0 ? (
          filteredBranches.map((branch) => (

            <div
              key={branch.id}
              className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm"
            >

              {/* CARD HEADER */}

              <div className="border-b border-slate-100 p-3 sm:p-4">

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">

                    <p className="mb-1.5 text-xs text-slate-400">
                      รหัสสาขา
                    </p>

                    <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1.5 font-mono text-xs font-bold text-slate-700">
                      {branch.code}
                    </span>

                  </div>

                  <button
                    onClick={() =>
                      toggleStatus(branch.id)
                    }
                    className={`!min-h-0 h-7 shrink-0 rounded-full px-2.5 text-xs font-medium transition ${
                      branch.status ===
                      "เปิดใช้งาน"
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                  >
                    {branch.status}
                  </button>

                </div>

              </div>

              {/* BRANCH INFO */}

              <div className="space-y-3 p-3 sm:p-4">

                <div>
                  <p className="text-xs text-slate-400">
                    ชื่อสาขา
                  </p>

                  <p className="mt-1 break-words text-sm font-semibold leading-5 text-slate-800">
                    {branch.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    ที่อยู่
                  </p>

                  <p className="mt-1 break-words text-sm leading-5 text-slate-600">
                    {branch.address}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    เบอร์โทรศัพท์
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {branch.phone}
                  </p>
                </div>

              </div>

              {/* ACTION */}

              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50 p-3">

                <button
                  onClick={() =>
                    openEditForm(branch)
                  }
                  className="!min-h-0 h-9 rounded-lg bg-blue-50 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                >
                  ✏️ แก้ไข
                </button>

                <button
                  onClick={() =>
                    deleteBranch(branch.id)
                  }
                  className="!min-h-0 h-9 rounded-lg bg-red-50 text-sm font-medium text-red-600 transition hover:bg-red-100"
                >
                  🗑️ ลบ
                </button>

              </div>

            </div>

          ))
        ) : (

          <div className="rounded-xl border border-slate-100 bg-white px-5 py-12 text-center text-sm text-slate-400 shadow-sm">
            ไม่พบสาขา
          </div>

        )}

      </div>

      {/* =========================
          MODAL
      ========================= */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">

          <div className="flex max-h-[95vh] w-full max-w-[550px] flex-col overflow-hidden rounded-xl bg-white shadow-xl sm:rounded-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">

              <h2 className="text-lg font-bold leading-tight text-slate-800 sm:text-xl">
                {editingBranch
                  ? "✏️ แก้ไขสาขา"
                  : "➕ เพิ่มสาขา"}
              </h2>

              <button
                onClick={() =>
                  setShowForm(false)
                }
                className="!min-h-0 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg p-0 text-lg text-slate-500 transition hover:bg-slate-100"
              >
                ✕
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="overflow-y-auto p-4 sm:p-6">

              <div className="space-y-4">

                {/* CODE */}

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    รหัสสาขา
                  </label>

                  <input
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="เช่น BR001"
                    className="!h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />

                </div>

                {/* NAME */}

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    ชื่อสาขา
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="เช่น สาขานครปฐม"
                    className="!h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />

                </div>

                {/* ADDRESS */}

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    ที่อยู่
                  </label>

                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="กรอกที่อยู่สาขา"
                    className="min-h-[96px] w-full resize-none rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />

                </div>

                {/* PHONE */}

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    เบอร์โทรศัพท์
                  </label>

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="เช่น 034-123-456"
                    className="!h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />

                </div>

              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="flex gap-2 border-t border-slate-100 bg-slate-50 p-3 sm:p-4">

              <button
                onClick={() =>
                  setShowForm(false)
                }
                className="!min-h-0 h-10 flex-1 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-600 transition hover:bg-slate-50 sm:rounded-xl"
              >
                ยกเลิก
              </button>

              <button
                onClick={saveBranch}
                className="!min-h-0 h-10 flex-1 rounded-lg bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 sm:rounded-xl"
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