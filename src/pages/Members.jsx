import { useEffect, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const API_URL = `${API_BASE}/api/members`;

export default function Members() {
  const [members, setMembers] = useState([]);
  const [phone, setPhone] = useState("");
  const [member, setMember] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
  });

  // =========================
  // LOAD MEMBERS
  // =========================

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "โหลดข้อมูลสมาชิกไม่สำเร็จ",
        );
      }

      setMembers(
        Array.isArray(result.data)
          ? result.data
          : [],
      );
    } catch (err) {
      console.error("Load Members Error:", err);

      setError(
        err.message ||
          "โหลดข้อมูลสมาชิกไม่สำเร็จ",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  // =========================
  // SEARCH MEMBER
  // =========================

  const searchMember = async () => {
    const cleanPhone = phone.replace(
      /\D/g,
      "",
    );

    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      alert("กรุณากรอกเบอร์โทรศัพท์ 10 หลัก");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/phone/${cleanPhone}`,
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setMember(null);
        alert("ไม่พบสมาชิกจากเบอร์โทรนี้");
        return;
      }

      setMember(result.data);
    } catch (err) {
      console.error(
        "Search Member Error:",
        err,
      );

      alert("ไม่สามารถค้นหาสมาชิกได้");
    }
  };

  const handlePhoneKeyDown = (e) => {
    if (e.key === "Enter") {
      searchMember();
    }
  };

  // =========================
  // OPEN ADD FORM
  // =========================

  const openAddForm = () => {
    setEditingMember(null);

    setForm({
      name: "",
      phone: "",
    });

    setShowForm(true);
  };

  // =========================
  // OPEN EDIT FORM
  // =========================

  const openEditForm = (item) => {
    setEditingMember(item);

    setForm({
      name: item.name || "",
      phone: item.phone || "",
    });

    setShowForm(true);
  };

  // =========================
  // CLOSE FORM
  // =========================

  const closeForm = () => {
    setShowForm(false);
    setEditingMember(null);

    setForm({
      name: "",
      phone: "",
    });
  };

  // =========================
  // SAVE MEMBER
  // =========================

  const saveMember = async () => {
    const name = form.name.trim();

    const cleanPhone = form.phone.replace(
      /\D/g,
      "",
    );

    if (!name) {
      alert("กรุณากรอกชื่อ-นามสกุล");
      return;
    }

    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      alert("กรุณากรอกเบอร์โทรศัพท์ 10 หลัก");
      return;
    }

    try {
      const url = editingMember
        ? `${API_URL}/${editingMember.id}`
        : API_URL;

      const method = editingMember
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
          name,
          phone: cleanPhone,
        }),
      });

      const result =
        await response.json();

      if (!response.ok || !result.success) {
        alert(
          result.message ||
            "บันทึกข้อมูลสมาชิกไม่สำเร็จ",
        );
        return;
      }

      alert(
        editingMember
          ? "แก้ไขสมาชิกเรียบร้อย"
          : "สมัครสมาชิกเรียบร้อย",
      );

      closeForm();

      setMember(null);
      setPhone("");

      await loadMembers();
    } catch (err) {
      console.error(
        "Save Member Error:",
        err,
      );

      alert(
        "ไม่สามารถเชื่อมต่อ Backend ได้",
      );
    }
  };

  // =========================
  // DELETE MEMBER
  // =========================

  const deleteMember = async (id) => {
    const confirmed = window.confirm(
      "ต้องการลบสมาชิกนี้ใช่หรือไม่?",
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
        },
      );

      const result =
        await response.json();

      if (!response.ok || !result.success) {
        alert(
          result.message ||
            "ลบสมาชิกไม่สำเร็จ",
        );
        return;
      }

      alert("ลบสมาชิกเรียบร้อย");

      if (member?.id === id) {
        setMember(null);
      }

      await loadMembers();
    } catch (err) {
      console.error(
        "Delete Member Error:",
        err,
      );

      alert(
        "ไม่สามารถเชื่อมต่อ Backend ได้",
      );
    }
  };

  // =========================
  // SEARCH TABLE
  // =========================

  const filteredMembers = members.filter(
    (item) => {
      const keyword = phone
        .trim()
        .toLowerCase();

      if (!keyword) {
        return true;
      }

      return (
        String(item.name || "")
          .toLowerCase()
          .includes(keyword) ||
        String(item.phone || "")
          .includes(keyword) ||
        String(item.id || "")
          .toLowerCase()
          .includes(keyword)
      );
    },
  );

  // =========================
  // SUMMARY
  // =========================

  const totalMembers = members.length;

  const totalPoints = members.reduce(
    (sum, item) =>
      sum + Number(item.points || 0),
    0,
  );

  // =========================
  // UI
  // =========================

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-5 lg:p-8">

      {/* =========================
          HEADER
      ========================= */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 sm:mb-6">

        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            👥 สมาชิก
          </h1>

          <p className="text-sm sm:text-base text-slate-500 mt-1">
            จัดการข้อมูลสมาชิกและคะแนนสะสม
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-bold transition"
        >
          ＋ สมัครสมาชิก
        </button>

      </div>

      {/* =========================
          SUMMARY
      ========================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-5 sm:mb-6">

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5">

          <p className="text-sm text-slate-500">
            สมาชิกทั้งหมด
          </p>

          <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">
            {totalMembers.toLocaleString(
              "th-TH",
            )}
          </p>

          <p className="text-xs text-slate-400 mt-1">
            คน
          </p>

        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5">

          <p className="text-sm text-slate-500">
            Points รวม
          </p>

          <p className="text-2xl sm:text-3xl font-bold text-yellow-600 mt-2">
            ⭐{" "}
            {totalPoints.toLocaleString(
              "th-TH",
            )}
          </p>

          <p className="text-xs text-slate-400 mt-1">
            คะแนนสะสมทั้งหมด
          </p>

        </div>

      </div>

      {/* =========================
          SEARCH
      ========================= */}

      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 mb-5 sm:mb-6">

        <h2 className="font-bold text-lg mb-3">
          🔎 ค้นหาสมาชิก
        </h2>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">

          <input
            value={phone}
            onChange={(e) =>
              setPhone(
                e.target.value.replace(
                  /\D/g,
                  "",
                ),
              )
            }
            onKeyDown={handlePhoneKeyDown}
            maxLength={10}
            inputMode="numeric"
            placeholder="กรอกเบอร์โทรศัพท์ 10 หลัก"
            className="w-full min-w-0 flex-1 border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={searchMember}
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-lg font-bold transition"
          >
            🔍 ค้นหา
          </button>

        </div>

      </div>

      {/* =========================
          SEARCH RESULT
      ========================= */}

      {member && (

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 mb-5 sm:mb-6">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div className="min-w-0">

              <div className="text-sm text-slate-400 mb-1">
                Member ID
              </div>

              <h2 className="text-xl sm:text-2xl font-bold break-all">
                {member.id}
              </h2>

              <p className="mt-3 break-words">
                👤{" "}
                <span className="font-medium">
                  {member.name}
                </span>
              </p>

              <p className="text-slate-500 mt-1">
                📱 {member.phone}
              </p>

            </div>

            <div className="flex flex-col sm:flex-row lg:items-center gap-3">

              <div className="bg-yellow-50 rounded-xl p-4 sm:p-5 text-center min-w-[160px]">

                <p className="text-sm text-slate-500">
                  คะแนนสะสม
                </p>

                <div className="text-3xl sm:text-4xl font-bold text-yellow-600 mt-1">
                  ⭐{" "}
                  {Number(
                    member.points || 0,
                  ).toLocaleString(
                    "th-TH",
                  )}
                </div>

                <p className="text-sm text-slate-500 mt-1">
                  Points
                </p>

              </div>

              <div className="grid grid-cols-2 sm:flex lg:flex-col gap-2">

                <button
                  onClick={() =>
                    openEditForm(member)
                  }
                  className="bg-blue-100 text-blue-600 px-4 py-3 rounded-lg hover:bg-blue-200 font-bold transition"
                >
                  ✏️ แก้ไข
                </button>

                <button
                  onClick={() =>
                    deleteMember(member.id)
                  }
                  className="bg-red-100 text-red-600 px-4 py-3 rounded-lg hover:bg-red-200 font-bold transition"
                >
                  🗑️ ลบ
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* =========================
          ERROR
      ========================= */}

      {error && (

        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-5 sm:mb-6">

          <div className="font-bold">
            ❌ โหลดข้อมูลสมาชิกไม่สำเร็จ
          </div>

          <div className="text-sm mt-1 break-words">
            {error}
          </div>

          <button
            onClick={loadMembers}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold"
          >
            🔄 ลองใหม่
          </button>

        </div>

      )}

      {/* =========================
          MEMBER TABLE
      ========================= */}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        <div className="p-4 sm:p-5 border-b">

          <div className="flex items-center justify-between gap-3">

            <h2 className="font-bold text-lg">
              รายชื่อสมาชิกทั้งหมด
            </h2>

            <span className="text-sm text-slate-400 whitespace-nowrap">
              {filteredMembers.length} คน
            </span>

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[700px]">

            <thead className="bg-slate-100">

              <tr>

                <th className="text-left p-4 whitespace-nowrap">
                  Member ID
                </th>

                <th className="text-left p-4 whitespace-nowrap">
                  ชื่อสมาชิก
                </th>

                <th className="text-left p-4 whitespace-nowrap">
                  เบอร์โทรศัพท์
                </th>

                <th className="text-center p-4 whitespace-nowrap">
                  Points
                </th>

                <th className="text-center p-4 whitespace-nowrap">
                  จัดการ
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="5"
                    className="text-center p-10 text-slate-500"
                  >
                    ⏳ กำลังโหลดข้อมูลสมาชิก...
                  </td>

                </tr>

              ) : filteredMembers.length === 0 ? (

                <tr>

                  <td
                    colSpan="5"
                    className="text-center p-10 text-slate-400"
                  >
                    <div className="text-3xl mb-2">
                      👥
                    </div>

                    <div>
                      {phone
                        ? "ไม่พบสมาชิกที่ค้นหา"
                        : "ยังไม่มีสมาชิก"}
                    </div>

                  </td>

                </tr>

              ) : (

                filteredMembers.map(
                  (item) => (

                    <tr
                      key={item.id}
                      className="border-t hover:bg-slate-50 transition"
                    >

                      <td className="p-4 font-bold whitespace-nowrap">
                        {item.id}
                      </td>

                      <td className="p-4 font-medium max-w-[220px]">
                        <div
                          className="truncate"
                          title={item.name}
                        >
                          {item.name}
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        {item.phone}
                      </td>

                      <td className="p-4 text-center">

                        <span className="inline-block bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full font-bold">
                          ⭐{" "}
                          {Number(
                            item.points || 0,
                          ).toLocaleString(
                            "th-TH",
                          )}
                        </span>

                      </td>

                      <td className="p-4">

                        <div className="flex justify-center gap-2">

                          <button
                            onClick={() =>
                              openEditForm(item)
                            }
                            className="bg-blue-100 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-200 transition"
                            title="แก้ไข"
                          >
                            ✏️
                          </button>

                          <button
                            onClick={() =>
                              deleteMember(
                                item.id,
                              )
                            }
                            className="bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition"
                            title="ลบ"
                          >
                            🗑️
                          </button>

                        </div>

                      </td>

                    </tr>

                  ),
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =========================
          ADD / EDIT MODAL
      ========================= */}

      {showForm && (

        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">

          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto shadow-2xl p-4 sm:p-6">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between gap-3 mb-5">

              <h2 className="text-xl sm:text-2xl font-bold">
                {editingMember
                  ? "✏️ แก้ไขสมาชิก"
                  : "➕ สมัครสมาชิก"}
              </h2>

              <button
                onClick={closeForm}
                className="w-9 h-9 flex-shrink-0 rounded-lg text-xl text-slate-500 hover:bg-slate-100 transition"
              >
                ✕
              </button>

            </div>

            {/* NAME */}

            <div className="mb-4">

              <label className="block font-medium mb-2">
                ชื่อ-นามสกุล
              </label>

              <input
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                placeholder="เช่น สมชาย ใจดี"
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* PHONE */}

            <div className="mb-5">

              <label className="block font-medium mb-2">
                เบอร์โทรศัพท์
              </label>

              <input
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value.replace(
                      /\D/g,
                      "",
                    ),
                  })
                }
                maxLength={10}
                inputMode="numeric"
                placeholder="เช่น 0812345678"
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* NEW MEMBER POINTS */}

            {!editingMember && (

              <div className="bg-yellow-50 border border-yellow-100 text-yellow-700 rounded-lg p-4 text-sm mb-5">

                ⭐ สมาชิกใหม่เริ่มต้นที่{" "}
                <strong>0 Points</strong>

              </div>

            )}

            {/* BUTTONS */}

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">

              <button
                onClick={closeForm}
                className="w-full sm:flex-1 border border-slate-300 rounded-lg py-3 hover:bg-slate-50 font-medium transition"
              >
                ยกเลิก
              </button>

              <button
                onClick={saveMember}
                className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-bold transition"
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