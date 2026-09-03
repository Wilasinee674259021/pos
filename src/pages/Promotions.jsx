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
    status: "เปิดใช้งาน",
  },
  {
    id: 2,
    name: "ช็อกโกแลต 2 ชิ้น ราคา 60 บาท",
    type: "ซื้อ X ชิ้น ราคาพิเศษ",
    condition: 2,
    discount: 60,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    status: "เปิดใช้งาน",
  },
];

export default function Promotions() {
  const [promotions, setPromotions] = useState(() => {
    const saved = localStorage.getItem("pos_promotions");
    return saved ? JSON.parse(saved) : defaultPromotions;
  });

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);

  const [form, setForm] = useState({
    name: "",
    type: "ลดเป็นจำนวนเงิน",
    condition: "",
    discount: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    localStorage.setItem("pos_promotions", JSON.stringify(promotions));
  }, [promotions]);

  const openAddModal = () => {
    setEditingPromotion(null);

    setForm({
      name: "",
      type: "ลดเป็นจำนวนเงิน",
      condition: "",
      discount: "",
      startDate: "",
      endDate: "",
    });

    setShowModal(true);
  };

  const openEditModal = (promotion) => {
    setEditingPromotion(promotion);

    setForm({
      name: promotion.name,
      type: promotion.type,
      condition: promotion.condition,
      discount: promotion.discount,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
    });

    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
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
      setPromotions((prev) =>
        prev.map((item) =>
          item.id === editingPromotion.id
            ? {
                ...item,
                ...form,
                condition: Number(form.condition),
                discount: Number(form.discount),
              }
            : item
        )
      );
    } else {
      const newPromotion = {
        id: Date.now(),
        ...form,
        condition: Number(form.condition),
        discount: Number(form.discount),
        status: "เปิดใช้งาน",
      };

      setPromotions((prev) => [...prev, newPromotion]);
    }

    setShowModal(false);
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "คุณต้องการลบโปรโมชั่นนี้ใช่หรือไม่?"
    );

    if (!confirmDelete) return;

    setPromotions((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleStatus = (id) => {
    setPromotions((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                item.status === "เปิดใช้งาน"
                  ? "ปิดใช้งาน"
                  : "เปิดใช้งาน",
            }
          : item
      )
    );
  };

  const filteredPromotions = promotions.filter((promotion) =>
    promotion.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = promotions.filter(
    (item) => item.status === "เปิดใช้งาน"
  ).length;

  const inactiveCount = promotions.filter(
    (item) => item.status === "ปิดใช้งาน"
  ).length;

  const formatDate = (date) => {
    if (!date) return "-";

    const [year, month, day] = date.split("-");

    return `${day}/${month}/${year}`;
  };

  const getTypeLabel = (type) => {
    if (type === "ลดเป็นจำนวนเงิน") {
      return "ส่วนลดตามยอดซื้อ";
    }

    return "ราคาพิเศษตามจำนวน";
  };

  const getConditionText = (promotion) => {
    if (promotion.type === "ลดเป็นจำนวนเงิน") {
      return (
        <div className="flex flex-col">
          <span className="text-xs text-gray-400">เมื่อซื้อครบ</span>
          <span className="font-semibold text-gray-800">
            ฿{Number(promotion.condition).toLocaleString()}
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-col">
        <span className="text-xs text-gray-400">จำนวนสินค้า</span>
        <span className="font-semibold text-gray-800">
          {promotion.condition} ชิ้น
        </span>
      </div>
    );
  };

  const getDiscountText = (promotion) => {
    if (promotion.type === "ลดเป็นเปอร์เซ็นต์") {
      return `${promotion.discount}%`;
    }

    return `฿${Number(promotion.discount).toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-5 md:p-6 lg:p-8">
      {/* HEADER */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
              โปรโมชั่น
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              จัดการโปรโมชั่นและส่วนลดของร้านค้า
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
          >
            + เพิ่มโปรโมชั่น
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">โปรโมชั่นทั้งหมด</p>

          <div className="mt-2 flex items-end justify-between">
            <p className="text-3xl font-bold text-gray-800">
              {promotions.length}
            </p>

            <span className="text-sm text-gray-400">รายการ</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">กำลังใช้งาน</p>

          <div className="mt-2 flex items-end justify-between">
            <p className="text-3xl font-bold text-green-600">
              {activeCount}
            </p>

            <span className="text-sm text-gray-400">รายการ</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">ปิดใช้งาน</p>

          <div className="mt-2 flex items-end justify-between">
            <p className="text-3xl font-bold text-gray-500">
              {inactiveCount}
            </p>

            <span className="text-sm text-gray-400">รายการ</span>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อโปรโมชั่น..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white"
          />

          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] table-fixed">
            <colgroup>
              <col className="w-[25%]" />
              <col className="w-[16%]" />
              <col className="w-[13%]" />
              <col className="w-[11%]" />
              <col className="w-[17%]" />
              <col className="w-[9%]" />
              <col className="w-[9%]" />
            </colgroup>

            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500">
                  โปรโมชั่น
                </th>

                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500">
                  ประเภท
                </th>

                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500">
                  เงื่อนไข
                </th>

                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500">
                  ส่วนลด
                </th>

                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500">
                  ระยะเวลา
                </th>

                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500">
                  สถานะ
                </th>

                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500">
                  จัดการ
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredPromotions.length > 0 ? (
                filteredPromotions.map((promotion) => (
                  <tr
                    key={promotion.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    {/* NAME */}
                    <td className="px-5 py-5 align-middle">
                      <div className="max-w-[280px]">
                        <p className="break-words text-sm font-semibold leading-6 text-gray-800">
                          {promotion.name}
                        </p>
                      </div>
                    </td>

                    {/* TYPE */}
                    <td className="px-4 py-5 align-middle">
                      <span className="inline-flex max-w-full rounded-lg bg-blue-50 px-3 py-2 text-center text-xs font-medium leading-5 text-blue-700">
                        {getTypeLabel(promotion.type)}
                      </span>
                    </td>

                    {/* CONDITION */}
                    <td className="px-4 py-5 align-middle">
                      {getConditionText(promotion)}
                    </td>

                    {/* DISCOUNT */}
                    <td className="px-4 py-5 align-middle">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400">
                          ลด/ราคา
                        </span>

                        <span className="mt-1 text-base font-bold text-red-600">
                          {getDiscountText(promotion)}
                        </span>
                      </div>
                    </td>

                    {/* DATE */}
                    <td className="px-4 py-5 align-middle">
                      <div className="flex flex-col gap-1 text-sm">
                        <span className="text-gray-700">
                          {formatDate(promotion.startDate)}
                        </span>

                        <span className="text-xs text-gray-400">
                          ถึง
                        </span>

                        <span className="text-gray-700">
                          {formatDate(promotion.endDate)}
                        </span>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-5 text-center align-middle">
                      <button
                        onClick={() => toggleStatus(promotion.id)}
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                          promotion.status === "เปิดใช้งาน"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {promotion.status}
                      </button>
                    </td>

                    {/* ACTION */}
                    <td className="px-4 py-5 align-middle">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditModal(promotion)}
                          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
                        >
                          แก้ไข
                        </button>

                        <button
                          onClick={() => handleDelete(promotion.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100"
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-sm text-gray-400"
                  >
                    ไม่พบโปรโมชั่น
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARDS */}
      <div className="space-y-4 md:hidden">
        {filteredPromotions.length > 0 ? (
          filteredPromotions.map((promotion) => (
            <div
              key={promotion.id}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              {/* CARD HEADER */}
              <div className="border-b border-gray-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="break-words text-base font-bold leading-6 text-gray-800">
                      {promotion.name}
                    </h2>
                  </div>

                  <button
                    onClick={() => toggleStatus(promotion.id)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                      promotion.status === "เปิดใช้งาน"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {promotion.status}
                  </button>
                </div>

                <div className="mt-3">
                  <span className="inline-flex rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                    {getTypeLabel(promotion.type)}
                  </span>
                </div>
              </div>

              {/* CARD CONTENT */}
              <div className="grid grid-cols-2 gap-px bg-gray-100">
                <div className="bg-white p-4">
                  <p className="text-xs text-gray-400">เงื่อนไข</p>

                  <div className="mt-1">
                    {getConditionText(promotion)}
                  </div>
                </div>

                <div className="bg-white p-4">
                  <p className="text-xs text-gray-400">ส่วนลด / ราคา</p>

                  <p className="mt-1 text-lg font-bold text-red-600">
                    {getDiscountText(promotion)}
                  </p>
                </div>
              </div>

              {/* DATE */}
              <div className="border-t border-gray-100 p-4">
                <p className="text-xs text-gray-400">ระยะเวลาโปรโมชั่น</p>

                <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                  <span className="rounded-lg bg-gray-50 px-3 py-2">
                    {formatDate(promotion.startDate)}
                  </span>

                  <span className="text-gray-400">→</span>

                  <span className="rounded-lg bg-gray-50 px-3 py-2">
                    {formatDate(promotion.endDate)}
                  </span>
                </div>
              </div>

              {/* ACTION */}
              <div className="flex gap-2 border-t border-gray-100 p-4">
                <button
                  onClick={() => openEditModal(promotion)}
                  className="flex-1 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                >
                  แก้ไข
                </button>

                <button
                  onClick={() => handleDelete(promotion.id)}
                  className="flex-1 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
                >
                  ลบ
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white px-5 py-12 text-center text-sm text-gray-400 shadow-sm">
            ไม่พบโปรโมชั่น
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {editingPromotion
                    ? "แก้ไขโปรโมชั่น"
                    : "เพิ่มโปรโมชั่น"}
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  กรอกข้อมูลโปรโมชั่นให้ครบถ้วน
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="overflow-y-auto p-5 sm:p-6">
              <div className="space-y-5">
                {/* NAME */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    ชื่อโปรโมชั่น
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="เช่น ซื้อครบ 100 บาท ลด 10 บาท"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                {/* TYPE */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    ประเภทโปรโมชั่น
                  </label>

                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="ลดเป็นจำนวนเงิน">
                      ลดเป็นจำนวนเงิน
                    </option>

                    <option value="ลดเป็นเปอร์เซ็นต์">
                      ลดเป็นเปอร์เซ็นต์
                    </option>

                    <option value="ซื้อ X ชิ้น ราคาพิเศษ">
                      ซื้อ X ชิ้น ราคาพิเศษ
                    </option>
                  </select>
                </div>

                {/* CONDITION + DISCOUNT */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      เงื่อนไข
                    </label>

                    <input
                      type="number"
                      name="condition"
                      value={form.condition}
                      onChange={handleChange}
                      min="0"
                      placeholder="เช่น 100"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      ส่วนลด / ราคาพิเศษ
                    </label>

                    <input
                      type="number"
                      name="discount"
                      value={form.discount}
                      onChange={handleChange}
                      min="0"
                      placeholder="เช่น 10"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* DATE */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      วันที่เริ่ม
                    </label>

                    <input
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      วันที่สิ้นสุด
                    </label>

                    <input
                      type="date"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 p-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                onClick={() => setShowModal(false)}
                className="w-full rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 sm:w-auto"
              >
                ยกเลิก
              </button>

              <button
                onClick={handleSave}
                className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
              >
                {editingPromotion ? "บันทึกการแก้ไข" : "เพิ่มโปรโมชั่น"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}