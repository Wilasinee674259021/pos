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

      {/* HEADER */}

      <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">

        <div className="min-w-0">

          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            👥 สมาชิก
          </h1>

          <p className="mt-1 text-sm text-slate-500 sm:text-base">
            จัดการข้อมูลสมาชิกและคะแนนสะสม
          </p>

        </div>

        <button
          onClick={openAddForm}
          className="
            h-10
            w-full
            rounded-lg
            bg-blue-600
            px-5
            text-sm
            font-bold
            text-white
            transition
            hover:bg-blue-700
            sm:w-auto
          "
        >
          ＋ สมัครสมาชิก
        </button>

      </div>

      {/* SUMMARY */}

      <div className="mb-5 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-2 sm:gap-4">

        <div className="rounded-xl bg-white p-4 shadow-sm sm:p-5">

          <p className="text-sm text-slate-500">
            สมาชิกทั้งหมด
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600 sm:text-3xl">
            {totalMembers.toLocaleString(
              "th-TH",
            )}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            คน
          </p>

        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm sm:p-5">

          <p className="text-sm text-slate-500">
            Points รวม
          </p>

          <p className="mt-2 text-2xl font-bold text-yellow-600 sm:text-3xl">
            ⭐{" "}
            {totalPoints.toLocaleString(
              "th-TH",
            )}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            คะแนนสะสมทั้งหมด
          </p>

        </div>

      </div>

      {/* SEARCH */}

      <div className="mb-5 rounded-xl bg-white p-4 shadow-sm sm:mb-6 sm:p-5">

        <h2 className="mb-3 font-bold text-lg">
          🔎 ค้นหาสมาชิก
        </h2>

        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">

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
            className="
              h-10
              w-full
              min-w-0
              flex-1
              rounded-lg
              border
              border-slate-300
              px-4
              text-sm
              outline-none
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-500
            "
          />

          <button
            onClick={searchMember}
            className="
              h-10
              w-full
              rounded-lg
              bg-slate-800
              px-6
              text-sm
              font-bold
              text-white
              transition
              hover:bg-slate-900
              sm:w-auto
            "
          >
            🔍 ค้นหา
          </button>

        </div>

      </div>

      {/* SEARCH RESULT */}

      {member && (

        <div className="mb-5 rounded-xl bg-white p-4 shadow-sm sm:mb-6 sm:p-5">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div className="min-w-0">

              <div className="mb-1 text-sm text-slate-400">
                Member ID
              </div>

              <h2 className="break-all text-xl font-bold sm:text-2xl">
                {member.id}
              </h2>

              <p className="mt-3 break-words">
                👤{" "}
                <span className="font-medium">
                  {member.name}
                </span>
              </p>

              <p className="mt-1 text-slate-500">
                📱 {member.phone}
              </p>

            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:items-center">

              <div className="min-w-[160px] rounded-xl bg-yellow-50 p-4 text-center sm:p-5">

                <p className="text-sm text-slate-500">
                  คะแนนสะสม
                </p>

                <div className="mt-1 text-3xl font-bold text-yellow-600 sm:text-4xl">
                  ⭐{" "}
                  {Number(
                    member.points || 0,
                  ).toLocaleString(
                    "th-TH",
                  )}
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Points
                </p>

              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex lg:flex-col">

                {/* EDIT */}

                <button
                  onClick={() =>
                    openEditForm(member)
                  }
                  className="
                    flex
                    h-8
                    items-center
                    justify-center
                    gap-1.5
                    rounded-md
                    bg-blue-100
                    px-3
                    text-xs
                    font-semibold
                    text-blue-600
                    transition
                    hover:bg-blue-200
                  "
                >
                  ✏️ แก้ไข
                </button>

                {/* DELETE */}

                <button
                  onClick={() =>
                    deleteMember(member.id)
                  }
                  className="
                    flex
                    h-8
                    items-center
                    justify-center
                    gap-1.5
                    rounded-md
                    bg-red-100
                    px-3
                    text-xs
                    font-semibold
                    text-red-600
                    transition
                    hover:bg-red-200
                  "
                >
                  🗑️ ลบ
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* ERROR */}

      {error && (

        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 sm:mb-6">

          <div className="font-bold">
            ❌ โหลดข้อมูลสมาชิกไม่สำเร็จ
          </div>

          <div className="mt-1 break-words text-sm">
            {error}
          </div>

          <button
            onClick={loadMembers}
            className="
              mt-3
              h-9
              rounded-lg
              bg-red-600
              px-4
              text-sm
              font-bold
              text-white
              hover:bg-red-700
            "
          >
            🔄 ลองใหม่
          </button>

        </div>

      )}

      {/* MEMBER TABLE */}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">

        <div className="border-b p-4 sm:p-5">

          <div className="flex items-center justify-between gap-3">

            <h2 className="font-bold text-lg">
              รายชื่อสมาชิกทั้งหมด
            </h2>

            <span className="whitespace-nowrap text-sm text-slate-400">
              {filteredMembers.length} คน
            </span>

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[700px]">

            <thead className="bg-slate-100">

              <tr>

                <th className="whitespace-nowrap p-4 text-left">
                  Member ID
                </th>

                <th className="whitespace-nowrap p-4 text-left">
                  ชื่อสมาชิก
                </th>

                <th className="whitespace-nowrap p-4 text-left">
                  เบอร์โทรศัพท์
                </th>

                <th className="whitespace-nowrap p-4 text-center">
                  Points
                </th>

                <th className="whitespace-nowrap p-4 text-center">
                  จัดการ
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="5"
                    className="p-10 text-center text-slate-500"
                  >
                    ⏳ กำลังโหลดข้อมูลสมาชิก...
                  </td>

                </tr>

              ) : filteredMembers.length === 0 ? (

                <tr>

                  <td
                    colSpan="5"
                    className="p-10 text-center text-slate-400"
                  >

                    <div className="mb-2 text-3xl">
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
                      className="border-t transition hover:bg-slate-50"
                    >

                      <td className="whitespace-nowrap p-4 font-bold">
                        {item.id}
                      </td>

                      <td className="max-w-[220px] p-4 font-medium">

                        <div
                          className="truncate"
                          title={item.name}
                        >
                          {item.name}
                        </div>

                      </td>

                      <td className="whitespace-nowrap p-4">
                        {item.phone}
                      </td>

                      <td className="p-4 text-center">

                        <span className="inline-block rounded-full bg-yellow-50 px-3 py-1 font-bold text-yellow-700">
                          ⭐{" "}
                          {Number(
                            item.points || 0,
                          ).toLocaleString(
                            "th-TH",
                          )}
                        </span>

                      </td>

                      {/* ACTION */}

                      <td className="p-4">

                        <div className="flex justify-center gap-1.5">

                          {/* EDIT */}

                          <button
                            onClick={() =>
                              openEditForm(item)
                            }
                            className="
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-md
                              bg-blue-100
                              text-sm
                              text-blue-600
                              transition
                              hover:bg-blue-200
                            "
                            title="แก้ไข"
                          >
                            ✏️
                          </button>

                          {/* DELETE */}

                          <button
                            onClick={() =>
                              deleteMember(
                                item.id,
                              )
                            }
                            className="
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-md
                              bg-red-100
                              text-sm
                              text-red-600
                              transition
                              hover:bg-red-200
                            "
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

      {/* ADD / EDIT MODAL */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">

          <div className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:p-6">

            {/* MODAL HEADER */}

            <div className="mb-5 flex items-center justify-between gap-3">

              <h2 className="text-xl font-bold sm:text-2xl">
                {editingMember
                  ? "✏️ แก้ไขสมาชิก"
                  : "➕ สมัครสมาชิก"}
              </h2>

              <button
                onClick={closeForm}
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  text-xl
                  text-slate-500
                  transition
                  hover:bg-slate-100
                "
              >
                ✕
              </button>

            </div>

            {/* NAME */}

            <div className="mb-4">

              <label className="mb-2 block font-medium">
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
                className="
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  p-3
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />

            </div>

            {/* PHONE */}

            <div className="mb-5">

              <label className="mb-2 block font-medium">
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
                className="
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  p-3
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />

            </div>

            {/* NEW MEMBER POINTS */}

            {!editingMember && (

              <div className="mb-5 rounded-lg border border-yellow-100 bg-yellow-50 p-4 text-sm text-yellow-700">

                ⭐ สมาชิกใหม่เริ่มต้นที่{" "}
                <strong>0 Points</strong>

              </div>

            )}

            {/* BUTTONS */}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">

              <button
                onClick={closeForm}
                className="
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  font-medium
                  transition
                  hover:bg-slate-50
                  sm:flex-1
                "
              >
                ยกเลิก
              </button>

              <button
                onClick={saveMember}
                className="
                  h-10
                  w-full
                  rounded-lg
                  bg-blue-600
                  font-bold
                  text-white
                  transition
                  hover:bg-blue-700
                  sm:flex-1
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