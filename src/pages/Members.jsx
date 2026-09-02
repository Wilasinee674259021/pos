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

      console.log("Loading members from:", API_URL);

      const response = await fetch(API_URL);
      const result = await response.json();

      console.log("Members API response:", result);

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "โหลดข้อมูลสมาชิกไม่สำเร็จ",
        );
      }

      setMembers(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error("Load Members Error:", err);
      setError(err.message || "โหลดข้อมูลสมาชิกไม่สำเร็จ");
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
    const cleanPhone = phone.trim();

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
      console.error("Search Member Error:", err);
      alert("ไม่สามารถค้นหาสมาชิกได้");
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
  // SAVE MEMBER
  // =========================

  const saveMember = async () => {
    const name = form.name.trim();
    const cleanPhone = form.phone.trim();

    if (!name) {
      alert("กรุณากรอกชื่อสมาชิก");
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

      const method = editingMember ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone: cleanPhone,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(result.message || "บันทึกไม่สำเร็จ");
        return;
      }

      alert(
        editingMember
          ? "แก้ไขสมาชิกเรียบร้อย"
          : "สมัครสมาชิกเรียบร้อย",
      );

      setShowForm(false);
      setEditingMember(null);

      setForm({
        name: "",
        phone: "",
      });

      setMember(result.data);
      setPhone(result.data?.phone || "");

      await loadMembers();
    } catch (err) {
      console.error("Save Member Error:", err);
      alert("ไม่สามารถเชื่อมต่อ Backend ได้");
    }
  };

  // =========================
  // DELETE MEMBER
  // =========================

  const deleteMember = async (id) => {
    if (!window.confirm("ต้องการลบสมาชิกคนนี้ใช่หรือไม่?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(result.message || "ลบสมาชิกไม่สำเร็จ");
        return;
      }

      alert("ลบสมาชิกเรียบร้อย");

      setMember(null);
      setPhone("");

      await loadMembers();
    } catch (err) {
      console.error("Delete Member Error:", err);
      alert("ไม่สามารถเชื่อมต่อ Backend ได้");
    }
  };

  // =========================
  // SUMMARY
  // =========================

  const totalPoints = members.reduce(
    (sum, item) => sum + Number(item.points || 0),
    0,
  );

  const membersWithPoints = members.filter(
    (item) => Number(item.points || 0) > 0,
  ).length;

  // =========================
  // UI
  // =========================

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            👤 สมาชิก
          </h1>

          <p className="text-slate-500 mt-1">
            จัดการสมาชิกและ Loyalty Point
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-bold"
        >
          ＋ สมัครสมาชิก
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">
          <p className="font-bold">
            ⚠️ โหลดข้อมูลสมาชิกไม่สำเร็จ
          </p>

          <p className="text-sm mt-1">
            {error}
          </p>

          <button
            onClick={loadMembers}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            🔄 ลองใหม่
          </button>
        </div>
      )}

      {/* SUMMARY */}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-slate-500">
            สมาชิกทั้งหมด
          </p>

          <p className="text-3xl font-bold mt-2">
            {members.length}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-slate-500">
            คะแนนรวม
          </p>

          <p className="text-3xl font-bold text-yellow-600 mt-2">
            ⭐ {totalPoints.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-slate-500">
            สมาชิกที่มีคะแนน
          </p>

          <p className="text-3xl font-bold text-blue-600 mt-2">
            {membersWithPoints}
          </p>
        </div>
      </div>

      {/* SEARCH */}

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="font-bold text-lg mb-4">
          🔍 ค้นหาสมาชิก
        </h2>

        <div className="flex gap-3">
          <input
            value={phone}
            onChange={(e) =>
              setPhone(
                e.target.value.replace(/\D/g, ""),
              )
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchMember();
              }
            }}
            maxLength={10}
            placeholder="กรอกเบอร์โทรศัพท์"
            className="flex-1 border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={searchMember}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg font-bold"
          >
            🔍 ค้นหา
          </button>

          <button
            onClick={() => {
              setMember(null);
              setPhone("");
            }}
            className="border border-slate-300 px-5 rounded-lg hover:bg-slate-50"
          >
            แสดงทั้งหมด
          </button>
        </div>
      </div>

      {/* MEMBER DETAIL */}

      {member && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-500">
                Member ID
              </p>

              <h2 className="text-xl font-bold">
                {member.id}
              </h2>

              <p className="mt-3">
                👤 {member.name}
              </p>

              <p className="text-slate-500">
                📱 {member.phone}
              </p>
            </div>

            <div className="flex items-center gap-5">
              <div className="bg-yellow-50 rounded-xl p-6 text-center">
                <p className="text-slate-500">
                  คะแนนสะสม
                </p>

                <div className="text-4xl font-bold text-yellow-600">
                  ⭐ {Number(member.points || 0)}
                </div>

                <p className="text-sm text-slate-500 mt-1">
                  Points
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() =>
                    openEditForm(member)
                  }
                  className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200"
                >
                  ✏️ แก้ไข
                </button>

                <button
                  onClick={() =>
                    deleteMember(member.id)
                  }
                  className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200"
                >
                  🗑️ ลบ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABLE */}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="font-bold text-lg">
            รายชื่อสมาชิกทั้งหมด
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-left p-4">
                  Member ID
                </th>

                <th className="text-left p-4">
                  ชื่อสมาชิก
                </th>

                <th className="text-left p-4">
                  เบอร์โทรศัพท์
                </th>

                <th className="text-center p-4">
                  คะแนน
                </th>

                <th className="text-center p-4">
                  จัดการ
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center p-10"
                  >
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center p-10 text-slate-400"
                  >
                    ยังไม่มีสมาชิก
                  </td>
                </tr>
              ) : (
                members.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-slate-50"
                  >
                    <td className="p-4 font-bold">
                      {item.id}
                    </td>

                    <td className="p-4">
                      {item.name}
                    </td>

                    <td className="p-4">
                      {item.phone}
                    </td>

                    <td className="p-4 text-center">
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                        ⭐{" "}
                        {Number(item.points || 0)}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            setMember(item)
                          }
                          className="bg-slate-100 text-slate-700 px-3 py-2 rounded-lg"
                        >
                          👁️ ดู
                        </button>

                        <button
                          onClick={() =>
                            openEditForm(item)
                          }
                          className="bg-blue-100 text-blue-600 px-3 py-2 rounded-lg"
                        >
                          ✏️
                        </button>

                        <button
                          onClick={() =>
                            deleteMember(item.id)
                          }
                          className="bg-red-100 text-red-600 px-3 py-2 rounded-lg"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-7 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingMember
                  ? "✏️ แก้ไขสมาชิก"
                  : "➕ สมัครสมาชิก"}
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
                className="w-full border border-slate-300 rounded-lg p-3"
              />
            </div>

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
                placeholder="เช่น 0812345678"
                className="w-full border border-slate-300 rounded-lg p-3"
              />
            </div>

            {!editingMember && (
              <div className="bg-yellow-50 text-yellow-700 rounded-lg p-4 text-sm mb-5">
                ⭐ สมาชิกใหม่เริ่มต้นที่
                <strong> 0 Points</strong>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() =>
                  setShowForm(false)
                }
                className="flex-1 border border-slate-300 rounded-lg py-3"
              >
                ยกเลิก
              </button>

              <button
                onClick={saveMember}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-bold"
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