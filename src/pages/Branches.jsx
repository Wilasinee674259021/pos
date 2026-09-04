import { useEffect, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const API_URL = `${API_BASE}/api/branches`;

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    code: "",
    name: "",
    address: "",
    phone: "",
  });

  // =========================
  // LOAD BRANCHES
  // =========================

  const loadBranches = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        headers: {
          Accept: "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "โหลดข้อมูลสาขาไม่สำเร็จ"
        );
      }

      setBranches(
        Array.isArray(result.data)
          ? result.data
          : []
      );
    } catch (error) {
      console.error(
        "LOAD BRANCHES ERROR:",
        error
      );

      alert(
        `ไม่สามารถโหลดข้อมูลสาขาได้\n${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

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
      code: branch.code || "",
      name: branch.name || "",
      address: branch.address || "",
      phone: branch.phone || "",
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
  // CLOSE FORM
  // =========================

  const closeForm = () => {
    setShowForm(false);
    setEditingBranch(null);

    setForm({
      code: "",
      name: "",
      address: "",
      phone: "",
    });
  };

  // =========================
  // SAVE
  // =========================

  const saveBranch = async () => {
    const code = form.code.trim();
    const name = form.name.trim();
    const address = form.address.trim();
    const phone = form.phone.trim();

    if (
      !code ||
      !name ||
      !address ||
      !phone
    ) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    try {
      const url = editingBranch
        ? `${API_URL}/${editingBranch.id}`
        : API_URL;

      const method = editingBranch
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type":
            "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          code,
          name,
          address,
          phone,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(
          result.message ||
            "บันทึกข้อมูลสาขาไม่สำเร็จ"
        );
        return;
      }

      alert(
        editingBranch
          ? "แก้ไขข้อมูลสาขาเรียบร้อย"
          : "เพิ่มสาขาเรียบร้อย"
      );

      closeForm();

      await loadBranches();
    } catch (error) {
      console.error(
        "SAVE BRANCH ERROR:",
        error
      );

      alert(
        `ไม่สามารถเชื่อมต่อ Backend ได้\n${error.message}`
      );
    }
  };

  // =========================
  // DELETE
  // =========================

  const deleteBranch = async (id) => {
    if (branches.length === 1) {
      alert("ต้องมีอย่างน้อย 1 สาขา");
      return;
    }

    const confirmed = window.confirm(
      "ต้องการลบสาขานี้ใช่หรือไม่?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(
          result.message ||
            "ลบสาขาไม่สำเร็จ"
        );
        return;
      }

      alert("ลบสาขาเรียบร้อย");

      await loadBranches();
    } catch (error) {
      console.error(
        "DELETE BRANCH ERROR:",
        error
      );

      alert(
        `ไม่สามารถเชื่อมต่อ Backend ได้\n${error.message}`
      );
    }
  };

  // =========================
  // TOGGLE STATUS
  // =========================

  const toggleStatus = async (id) => {
    try {
      const response = await fetch(
        `${API_URL}/${id}/status`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(
          result.message ||
            "เปลี่ยนสถานะไม่สำเร็จ"
        );
        return;
      }

      await loadBranches();
    } catch (error) {
      console.error(
        "TOGGLE STATUS ERROR:",
        error
      );

      alert(
        `ไม่สามารถเชื่อมต่อ Backend ได้\n${error.message}`
      );
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredBranches =
    branches.filter((branch) => {
      const keyword = search
        .toLowerCase()
        .trim();

      if (!keyword) {
        return true;
      }

      return (
        String(branch.code || "")
          .toLowerCase()
          .includes(keyword) ||
        String(branch.name || "")
          .toLowerCase()
          .includes(keyword) ||
        String(branch.address || "")
          .toLowerCase()
          .includes(keyword) ||
        String(branch.phone || "")
          .toLowerCase()
          .includes(keyword)
      );
    });

  const activeBranches =
    branches.filter(
      (branch) =>
        branch.status === "เปิดใช้งาน"
    ).length;

  const inactiveBranches =
    branches.filter(
      (branch) =>
        branch.status === "ปิดใช้งาน"
    ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-4 md:p-6 lg:p-8">

      {/* HEADER */}

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

      {/* SUMMARY */}

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">

        <div className="rounded-xl bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                สาขาทั้งหมด
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-800 sm:text-3xl">
                {branches.length}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg sm:h-11 sm:w-11 sm:rounded-xl sm:text-xl">
              🏪
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                เปิดใช้งาน
              </p>

              <p className="mt-1 text-2xl font-bold text-green-600 sm:text-3xl">
                {activeBranches}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-lg sm:h-11 sm:w-11 sm:rounded-xl sm:text-xl">
              ✓
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                ปิดใช้งาน
              </p>

              <p className="mt-1 text-2xl font-bold text-red-500 sm:text-3xl">
                {inactiveBranches}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-lg sm:h-11 sm:w-11 sm:rounded-xl sm:text-xl">
              ×
            </div>
          </div>
        </div>

      </div>

      {/* SEARCH */}

      <div className="mb-4 rounded-xl bg-white p-3 shadow-sm sm:mb-5 sm:rounded-2xl sm:p-4">

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="🔍 ค้นหารหัสสาขา / ชื่อสาขา / ที่อยู่"
          className="!h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 sm:px-4"
        />

      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm md:rounded-2xl">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[800px]">

            <thead className="bg-slate-100">
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

              {loading ? (

                <tr>
                  <td
                    colSpan="6"
                    className="p-10 text-center text-slate-400"
                  >
                    ⏳ กำลังโหลดข้อมูล...
                  </td>
                </tr>

              ) : filteredBranches.length === 0 ? (

                <tr>
                  <td
                    colSpan="6"
                    className="p-10 text-center text-slate-400"
                  >
                    ไม่พบสาขา
                  </td>
                </tr>

              ) : (

                filteredBranches.map(
                  (branch) => (

                    <tr
                      key={branch.id}
                      className="border-t border-slate-100 transition hover:bg-slate-50"
                    >

                      <td className="px-4 py-4 align-middle">
                        <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1.5 font-mono text-xs font-bold text-slate-700">
                          {branch.code}
                        </span>
                      </td>

                      <td className="px-4 py-4 align-middle">
                        <p className="text-sm font-semibold text-slate-800">
                          {branch.name}
                        </p>
                      </td>

                      <td className="max-w-[280px] px-4 py-4 align-middle">
                        <p className="break-words text-sm leading-5 text-slate-600">
                          {branch.address}
                        </p>
                      </td>

                      <td className="px-4 py-4 align-middle">
                        <span className="text-sm text-slate-600">
                          {branch.phone}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center align-middle">

                        <button
                          onClick={() =>
                            toggleStatus(
                              branch.id
                            )
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

                      <td className="px-4 py-4 align-middle">

                        <div className="flex items-center justify-center gap-1.5">

                          <button
                            onClick={() =>
                              openEditForm(
                                branch
                              )
                            }
                            title="แก้ไข"
                            className="!min-h-0 flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 p-0 text-sm text-blue-600 transition hover:bg-blue-100"
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
                            className="!min-h-0 flex h-8 w-8 items-center justify-center rounded-md bg-red-50 p-0 text-sm text-red-600 transition hover:bg-red-100"
                          >
                            🗑️
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* MOBILE */}

      <div className="mt-3 space-y-3 md:hidden">

        {filteredBranches.map(
          (branch) => (

            <div
              key={branch.id}
              className="overflow-hidden rounded-xl bg-white shadow-sm"
            >

              <div className="border-b border-slate-100 p-4">

                <div className="flex items-start justify-between gap-3">

                  <div>
                    <p className="mb-1 text-xs text-slate-400">
                      รหัสสาขา
                    </p>

                    <span className="rounded-md bg-slate-100 px-2.5 py-1.5 font-mono text-xs font-bold text-slate-700">
                      {branch.code}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      toggleStatus(
                        branch.id
                      )
                    }
                    className={`!min-h-0 h-7 rounded-full px-2.5 text-xs font-medium ${
                      branch.status ===
                      "เปิดใช้งาน"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {branch.status}
                  </button>

                </div>

              </div>

              <div className="space-y-3 p-4">

                <div>
                  <p className="text-xs text-slate-400">
                    ชื่อสาขา
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {branch.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    ที่อยู่
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
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

              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50 p-3">

                <button
                  onClick={() =>
                    openEditForm(
                      branch
                    )
                  }
                  className="!min-h-0 h-9 rounded-lg bg-blue-50 text-sm font-medium text-blue-600"
                >
                  ✏️ แก้ไข
                </button>

                <button
                  onClick={() =>
                    deleteBranch(
                      branch.id
                    )
                  }
                  className="!min-h-0 h-9 rounded-lg bg-red-50 text-sm font-medium text-red-600"
                >
                  🗑️ ลบ
                </button>

              </div>

            </div>

          )
        )}

      </div>

      {/* MODAL */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">

          <div className="flex max-h-[95vh] w-full max-w-[550px] flex-col overflow-hidden rounded-xl bg-white shadow-xl sm:rounded-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">

              <h2 className="text-lg font-bold text-slate-800 sm:text-xl">
                {editingBranch
                  ? "✏️ แก้ไขสาขา"
                  : "➕ เพิ่มสาขา"}
              </h2>

              <button
                onClick={closeForm}
                className="!min-h-0 flex h-9 w-9 items-center justify-center rounded-lg text-lg text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>

            </div>

            <div className="overflow-y-auto p-4 sm:p-6">

              <div className="space-y-4">

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

            <div className="flex gap-2 border-t border-slate-100 bg-slate-50 p-3 sm:p-4">

              <button
                onClick={closeForm}
                className="!min-h-0 h-10 flex-1 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                ยกเลิก
              </button>

              <button
                onClick={saveBranch}
                className="!min-h-0 h-10 flex-1 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
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