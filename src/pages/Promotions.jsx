import { useEffect, useState } from "react";

const defaultPromotions = [
  {
    id: 1,
    name: "ซื้อครบ 100 บาท ลด 10 บาท",
    type: "ลดเป็นจำนวนเงิน",
    condition: 100,
    discount: 10,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    status: "active",
  },
  {
    id: 2,
    name: "ช็อกโกแลต 2 ชิ้น ราคา 60 บาท",
    type: "ซื้อ X ชิ้น ราคาพิเศษ",
    condition: 2,
    discount: 60,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    status: "active",
  },
];

export default function Promotions() {
  const [promotions, setPromotions] =
    useState(() => {
      const saved =
        localStorage.getItem(
          "pos_promotions"
        );

      return saved
        ? JSON.parse(saved)
        : defaultPromotions;
    });

  const [showForm, setShowForm] =
    useState(false);

  const [editingPromotion, setEditingPromotion] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [form, setForm] = useState({
    name: "",
    type: "ลดเป็นจำนวนเงิน",
    condition: "",
    discount: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    localStorage.setItem(
      "pos_promotions",
      JSON.stringify(promotions)
    );
  }, [promotions]);

  // =========================
  // FORM
  // =========================

  const openAddForm = () => {
    setEditingPromotion(null);

    setForm({
      name: "",
      type: "ลดเป็นจำนวนเงิน",
      condition: "",
      discount: "",
      startDate: "",
      endDate: "",
    });

    setShowForm(true);
  };

  const openEditForm = (promotion) => {
    setEditingPromotion(promotion);

    setForm({
      name: promotion.name,
      type: promotion.type,
      condition: promotion.condition,
      discount: promotion.discount,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
    });

    setShowForm(true);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const savePromotion = () => {
    if (
      !form.name ||
      !form.condition ||
      !form.discount ||
      !form.startDate ||
      !form.endDate
    ) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    if (editingPromotion) {
      setPromotions(
        promotions.map((promotion) =>
          promotion.id ===
          editingPromotion.id
            ? {
                ...promotion,
                name: form.name,
                type: form.type,
                condition:
                  Number(form.condition),
                discount:
                  Number(form.discount),
                startDate:
                  form.startDate,
                endDate:
                  form.endDate,
              }
            : promotion
        )
      );

      alert(
        "แก้ไขโปรโมชั่นเรียบร้อย"
      );
    } else {
      const newPromotion = {
        id: Date.now(),
        name: form.name,
        type: form.type,
        condition:
          Number(form.condition),
        discount:
          Number(form.discount),
        startDate: form.startDate,
        endDate: form.endDate,
        status: "active",
      };

      setPromotions([
        ...promotions,
        newPromotion,
      ]);

      alert(
        "เพิ่มโปรโมชั่นเรียบร้อย"
      );
    }

    setShowForm(false);
  };

  // =========================
  // DELETE
  // =========================

  const deletePromotion = (id) => {
    const confirmDelete =
      window.confirm(
        "ต้องการลบโปรโมชั่นนี้ใช่หรือไม่?"
      );

    if (!confirmDelete) return;

    setPromotions(
      promotions.filter(
        (promotion) =>
          promotion.id !== id
      )
    );
  };

  // =========================
  // STATUS
  // =========================

  const toggleStatus = (id) => {
    setPromotions(
      promotions.map((promotion) =>
        promotion.id === id
          ? {
              ...promotion,
              status:
                promotion.status ===
                "active"
                  ? "inactive"
                  : "active",
            }
          : promotion
      )
    );
  };

  // =========================
  // SEARCH
  // =========================

  const filteredPromotions =
    promotions.filter(
      (promotion) =>
        promotion.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  // =========================
  // UI
  // =========================

  return (
    <div className="p-8 bg-slate-50 min-h-screen">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-7">

        <div>

          <h1 className="text-3xl font-bold text-slate-800">
            🏷️ จัดการโปรโมชั่น
          </h1>

          <p className="text-slate-500 mt-1">
            สร้างและจัดการโปรโมชั่นสำหรับสินค้า
          </p>

        </div>

        <button
          onClick={openAddForm}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700"
        >
          ＋ เพิ่มโปรโมชั่น
        </button>

      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-3 gap-4 mb-6">

        <div className="bg-white rounded-xl p-5 shadow-sm">

          <p className="text-slate-500">
            โปรโมชั่นทั้งหมด
          </p>

          <p className="text-3xl font-bold mt-2">
            {promotions.length}
          </p>

        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">

          <p className="text-slate-500">
            โปรโมชั่นที่เปิดใช้
          </p>

          <p className="text-3xl font-bold text-green-600 mt-2">
            {
              promotions.filter(
                (p) =>
                  p.status === "active"
              ).length
            }
          </p>

        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">

          <p className="text-slate-500">
            โปรโมชั่นปิดใช้
          </p>

          <p className="text-3xl font-bold text-red-500 mt-2">
            {
              promotions.filter(
                (p) =>
                  p.status === "inactive"
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
          placeholder="🔍 ค้นหาชื่อโปรโมชั่น..."
          className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />

      </div>

      {/* TABLE */}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="text-left p-4">
                โปรโมชั่น
              </th>

              <th className="text-left p-4">
                ประเภท
              </th>

              <th className="text-center p-4">
                เงื่อนไข
              </th>

              <th className="text-center p-4">
                ส่วนลด
              </th>

              <th className="text-center p-4">
                ระยะเวลา
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

            {filteredPromotions.map(
              (promotion) => (

                <tr
                  key={promotion.id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="p-4">

                    <div className="font-bold">
                      {promotion.name}
                    </div>

                  </td>

                  <td className="p-4">
                    {promotion.type}
                  </td>

                  <td className="p-4 text-center">

                    {promotion.type ===
                    "ลดเป็นจำนวนเงิน"
                      ? `ซื้อครบ ฿${promotion.condition}`
                      : `ซื้อ ${promotion.condition} ชิ้น`}

                  </td>

                  <td className="p-4 text-center font-bold text-red-500">

                    {promotion.type ===
                    "ลดเป็นเปอร์เซ็นต์"
                      ? `${promotion.discount}%`
                      : `฿${promotion.discount}`}

                  </td>

                  <td className="p-4 text-center text-sm">

                    <div>
                      {promotion.startDate}
                    </div>

                    <div className="text-slate-400">
                      ถึง
                    </div>

                    <div>
                      {promotion.endDate}
                    </div>

                  </td>

                  <td className="p-4 text-center">

                    <button
                      onClick={() =>
                        toggleStatus(
                          promotion.id
                        )
                      }
                      className={
                        promotion.status ===
                        "active"
                          ? "bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                          : "bg-slate-200 text-slate-500 px-3 py-1 rounded-full text-sm"
                      }
                    >
                      {promotion.status ===
                      "active"
                        ? "เปิดใช้"
                        : "ปิดใช้"}
                    </button>

                  </td>

                  <td className="p-4">

                    <div className="flex justify-center gap-2">

                      <button
                        onClick={() =>
                          openEditForm(
                            promotion
                          )
                        }
                        className="bg-blue-100 text-blue-600 px-3 py-2 rounded-lg"
                      >
                        ✏️
                      </button>

                      <button
                        onClick={() =>
                          deletePromotion(
                            promotion.id
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

        {filteredPromotions.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            ไม่พบโปรโมชั่น
          </div>
        )}

      </div>

      {/* =========================
          FORM MODAL
      ========================= */}

      {showForm && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl w-[550px] p-7 shadow-xl">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-2xl font-bold">

                {editingPromotion
                  ? "✏️ แก้ไขโปรโมชั่น"
                  : "➕ เพิ่มโปรโมชั่น"}

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

              {/* NAME */}

              <div>

                <label className="block mb-1 font-medium">
                  ชื่อโปรโมชั่น
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="เช่น ซื้อครบ 100 บาท ลด 10 บาท"
                  className="w-full border rounded-lg p-3"
                />

              </div>

              {/* TYPE */}

              <div>

                <label className="block mb-1 font-medium">
                  ประเภทโปรโมชั่น
                </label>

                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3"
                >

                  <option>
                    ลดเป็นจำนวนเงิน
                  </option>

                  <option>
                    ลดเป็นเปอร์เซ็นต์
                  </option>

                  <option>
                    ซื้อ X ชิ้น ราคาพิเศษ
                  </option>

                </select>

              </div>

              {/* CONDITION */}

              <div>

                <label className="block mb-1 font-medium">
                  เงื่อนไข
                </label>

                <input
                  type="number"
                  name="condition"
                  value={form.condition}
                  onChange={handleChange}
                  placeholder={
                    form.type ===
                    "ซื้อ X ชิ้น ราคาพิเศษ"
                      ? "จำนวนชิ้น"
                      : "จำนวนเงิน"
                  }
                  className="w-full border rounded-lg p-3"
                />

              </div>

              {/* DISCOUNT */}

              <div>

                <label className="block mb-1 font-medium">

                  {form.type ===
                  "ลดเป็นเปอร์เซ็นต์"
                    ? "ส่วนลด (%)"
                    : form.type ===
                      "ซื้อ X ชิ้น ราคาพิเศษ"
                    ? "ราคาพิเศษ"
                    : "ส่วนลด (บาท)"}

                </label>

                <input
                  type="number"
                  name="discount"
                  value={form.discount}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3"
                />

              </div>

              {/* DATE */}

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="block mb-1 font-medium">
                    วันที่เริ่ม
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-3"
                  />

                </div>

                <div>

                  <label className="block mb-1 font-medium">
                    วันที่สิ้นสุด
                  </label>

                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-3"
                  />

                </div>

              </div>

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
                onClick={savePromotion}
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