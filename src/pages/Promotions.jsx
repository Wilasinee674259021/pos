import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Promotions() {
  const [promotions, setPromotions] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    type: "ลดเป็นจำนวนเงิน",
    condition: "",
    discount: "",
    startDate: "",
    endDate: "",
  });

  // ======================================
  // LOAD PROMOTIONS
  // ======================================

  const fetchPromotions = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/promotions`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "ไม่สามารถโหลดโปรโมชั่นได้"
        );
      }

      setPromotions(result.data || []);
    } catch (error) {
      console.error("FETCH PROMOTIONS ERROR:", error);

      alert(
        "ไม่สามารถโหลดข้อมูลโปรโมชั่นจากฐานข้อมูลได้\n" +
          error.message
      );

      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  // ======================================
  // OPEN ADD
  // ======================================

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

  // ======================================
  // OPEN EDIT
  // ======================================

  const openEditModal = (promotion) => {
    setEditingPromotion(promotion);

    setForm({
      name: promotion.name || "",
      type: promotion.type || "ลดเป็นจำนวนเงิน",
      condition: promotion.condition ?? "",
      discount: promotion.discount ?? "",
      startDate: promotion.startDate
        ? String(promotion.startDate).slice(0, 10)
        : "",
      endDate: promotion.endDate
        ? String(promotion.endDate).slice(0, 10)
        : "",
    });

    setShowModal(true);
  };

  // ======================================
  // FORM CHANGE
  // ======================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ======================================
  // SAVE
  // ======================================

  const handleSave = async () => {
    if (
      !form.name.trim() ||
      form.condition === "" ||
      form.discount === "" ||
      !form.startDate ||
      !form.endDate
    ) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    const condition = Number(form.condition);
    const discount = Number(form.discount);

    if (Number.isNaN(condition) || condition < 0) {
      alert("เงื่อนไขโปรโมชั่นต้องไม่ติดลบ");
      return;
    }

    if (Number.isNaN(discount) || discount < 0) {
      alert("ส่วนลด / ราคาพิเศษต้องไม่ติดลบ");
      return;
    }

    if (form.startDate > form.endDate) {
      alert("วันที่เริ่มต้องไม่มากกว่าวันที่สิ้นสุด");
      return;
    }

    try {
      setSaving(true);

      const promotionData = {
        name: form.name.trim(),
        type: form.type,
        condition,
        discount,
        startDate: form.startDate,
        endDate: form.endDate,
      };

      // ======================================
      // EDIT
      // ======================================

      if (editingPromotion) {
        const response = await fetch(
          `${API_URL}/api/promotions/${editingPromotion.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(promotionData),
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "แก้ไขโปรโมชั่นไม่สำเร็จ"
          );
        }

        alert("แก้ไขโปรโมชั่นเรียบร้อย");
      }

      // ======================================
      // ADD
      // ======================================

      else {
        const response = await fetch(
          `${API_URL}/api/promotions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(promotionData),
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "เพิ่มโปรโมชั่นไม่สำเร็จ"
          );
        }

        alert("เพิ่มโปรโมชั่นเรียบร้อย");
      }

      // โหลดข้อมูลจาก PostgreSQL ใหม่
      await fetchPromotions();

      setShowModal(false);
      setEditingPromotion(null);
    } catch (error) {
      console.error("SAVE PROMOTION ERROR:", error);

      alert(
        "ไม่สามารถบันทึกโปรโมชั่นได้\n" +
          error.message
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================
  // DELETE
  // ======================================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "คุณต้องการลบโปรโมชั่นนี้ใช่หรือไม่?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API_URL}/api/promotions/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "ลบโปรโมชั่นไม่สำเร็จ"
        );
      }

      alert("ลบโปรโมชั่นเรียบร้อย");

      // โหลดข้อมูลจาก PostgreSQL ใหม่
      await fetchPromotions();
    } catch (error) {
      console.error("DELETE PROMOTION ERROR:", error);

      alert(
        "ไม่สามารถลบโปรโมชั่นได้\n" +
          error.message
      );
    }
  };

  // ======================================
  // TOGGLE STATUS
  // ======================================

  const toggleStatus = async (promotion) => {
    const newStatus =
      promotion.status === "เปิดใช้งาน"
        ? "ปิดใช้งาน"
        : "เปิดใช้งาน";

    try {
      const response = await fetch(
        `${API_URL}/api/promotions/${promotion.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "เปลี่ยนสถานะโปรโมชั่นไม่สำเร็จ"
        );
      }

      // โหลดข้อมูลใหม่จาก DB
      await fetchPromotions();
    } catch (error) {
      console.error(
        "TOGGLE PROMOTION STATUS ERROR:",
        error
      );

      alert(
        "ไม่สามารถเปลี่ยนสถานะโปรโมชั่นได้\n" +
          error.message
      );
    }
  };

  // ======================================
  // FILTER
  // ======================================

  const filteredPromotions = promotions.filter(
    (promotion) =>
      String(promotion.name || "")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  // ======================================
  // SUMMARY
  // ======================================

  const activeCount = promotions.filter(
    (item) => item.status === "เปิดใช้งาน"
  ).length;

  const inactiveCount = promotions.filter(
    (item) => item.status === "ปิดใช้งาน"
  ).length;

  // ======================================
  // FORMAT DATE
  // ======================================

  const formatDate = (date) => {
    if (!date) return "-";

    const dateString = String(date).slice(0, 10);
    const parts = dateString.split("-");

    if (parts.length !== 3) return dateString;

    const [year, month, day] = parts;

    return `${day}/${month}/${year}`;
  };

  // ======================================
  // TYPE LABEL
  // ======================================

  const getTypeLabel = (type) => {
    if (type === "ลดเป็นจำนวนเงิน") {
      return "ส่วนลดตามยอดซื้อ";
    }

    if (type === "ลดเป็นเปอร์เซ็นต์") {
      return "ส่วนลดเป็นเปอร์เซ็นต์";
    }

    return "ราคาพิเศษตามจำนวน";
  };

  // ======================================
  // CONDITION
  // ======================================

  const getConditionText = (promotion) => {
    if (
      promotion.type === "ลดเป็นจำนวนเงิน" ||
      promotion.type === "ลดเป็นเปอร์เซ็นต์"
    ) {
      return (
        <div className="flex flex-col">
          <span className="text-xs text-gray-400">
            เมื่อซื้อครบ
          </span>

          <span className="font-semibold text-gray-800">
            ฿
            {Number(
              promotion.condition
            ).toLocaleString()}
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-col">
        <span className="text-xs text-gray-400">
          จำนวนสินค้า
        </span>

        <span className="font-semibold text-gray-800">
          {promotion.condition} ชิ้น
        </span>
      </div>
    );
  };

  // ======================================
  // DISCOUNT
  // ======================================

  const getDiscountText = (promotion) => {
    if (promotion.type === "ลดเป็นเปอร์เซ็นต์") {
      return `${promotion.discount}%`;
    }

    return `฿${Number(
      promotion.discount
    ).toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 lg:p-8">
      {/* HEADER */}
      <div className="mb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
              โปรโมชั่น
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              จัดการโปรโมชั่นและส่วนลดของร้านค้า
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="!min-h-0 h-10 w-full rounded-lg bg-blue-600 px-4 text-sm font-semibold leading-none text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
          >
            + เพิ่มโปรโมชั่น
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            โปรโมชั่นทั้งหมด
          </p>

          <div className="mt-1 flex items-end justify-between">
            <p className="text-2xl font-bold text-gray-800">
              {promotions.length}
            </p>

            <span className="text-xs text-gray-400">
              รายการ
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            กำลังใช้งาน
          </p>

          <div className="mt-1 flex items-end justify-between">
            <p className="text-2xl font-bold text-green-600">
              {activeCount}
            </p>

            <span className="text-xs text-gray-400">
              รายการ
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            ปิดใช้งาน
          </p>

          <div className="mt-1 flex items-end justify-between">
            <p className="text-2xl font-bold text-gray-500">
              {inactiveCount}
            </p>

            <span className="text-xs text-gray-400">
              รายการ
            </span>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="mb-4 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="ค้นหาชื่อโปรโมชั่น..."
            className="!h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 pr-10 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white"
          />

          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="rounded-xl border border-gray-100 bg-white px-5 py-12 text-center text-sm text-gray-400 shadow-sm">
          กำลังโหลดข้อมูลโปรโมชั่น...
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] table-fixed">
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                      โปรโมชั่น
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                      ประเภท
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                      เงื่อนไข
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                      ส่วนลด
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                      ระยะเวลา
                    </th>

                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">
                      สถานะ
                    </th>

                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">
                      จัดการ
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPromotions.length > 0 ? (
                    filteredPromotions.map(
                      (promotion) => (
                        <tr
                          key={promotion.id}
                          className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                        >
                          <td className="px-4 py-4 align-middle">
                            <p className="max-w-[280px] break-words text-sm font-semibold leading-5 text-gray-800">
                              {promotion.name}
                            </p>
                          </td>

                          <td className="px-4 py-4 align-middle">
                            <span className="inline-flex max-w-full rounded-md bg-blue-50 px-2.5 py-1 text-center text-xs font-medium leading-4 text-blue-700">
                              {getTypeLabel(
                                promotion.type
                              )}
                            </span>
                          </td>

                          <td className="px-4 py-4 align-middle">
                            {getConditionText(
                              promotion
                            )}
                          </td>

                          <td className="px-4 py-4 align-middle">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-400">
                                ลด/ราคา
                              </span>

                              <span className="mt-0.5 text-base font-bold text-red-600">
                                {getDiscountText(
                                  promotion
                                )}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4 align-middle">
                            <div className="flex flex-col gap-0.5 text-sm">
                              <span className="text-gray-700">
                                {formatDate(
                                  promotion.startDate
                                )}
                              </span>

                              <span className="text-xs text-gray-400">
                                ถึง
                              </span>

                              <span className="text-gray-700">
                                {formatDate(
                                  promotion.endDate
                                )}
                              </span>
                            </div>
                          </td>

                          {/* STATUS - ปรับเฉพาะตรงนี้ */}
                          <td className="px-4 py-4 text-center align-middle">
                            <button
                              onClick={() =>
                                toggleStatus(
                                  promotion
                                )
                              }
                              className={`!min-h-0 inline-flex h-7 items-center justify-center whitespace-nowrap rounded-full px-2.5 text-xs font-semibold leading-none ${
                                promotion.status ===
                                "เปิดใช้งาน"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {promotion.status}
                            </button>
                          </td>

                          <td className="px-4 py-4 align-middle">
                            <div className="flex justify-center gap-1.5">
                              <button
                                onClick={() =>
                                  openEditModal(
                                    promotion
                                  )
                                }
                                className="!min-h-0 h-8 rounded-md border border-blue-200 bg-blue-50 px-2.5 text-xs font-medium leading-none text-blue-600 transition hover:bg-blue-100"
                              >
                                แก้ไข
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    promotion.id
                                  )
                                }
                                className="!min-h-0 h-8 rounded-md border border-red-200 bg-red-50 px-2.5 text-xs font-medium leading-none text-red-600 transition hover:bg-red-100"
                              >
                                ลบ
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-5 py-10 text-center text-sm text-gray-400"
                      >
                        ไม่พบโปรโมชั่น
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE */}
          <div className="space-y-3 md:hidden">
            {filteredPromotions.length > 0 ? (
              filteredPromotions.map(
                (promotion) => (
                  <div
                    key={promotion.id}
                    className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                  >
                    <div className="border-b border-gray-100 p-3.5">
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="min-w-0 flex-1">
                          <h2 className="break-words text-base font-bold leading-5 text-gray-800">
                            {promotion.name}
                          </h2>
                        </div>

                        {/* STATUS - ปรับเฉพาะตรงนี้ */}
                        <button
                          onClick={() =>
                            toggleStatus(
                              promotion
                            )
                          }
                          className={`!min-h-0 h-7 shrink-0 whitespace-nowrap rounded-full px-2.5 text-xs font-semibold leading-none ${
                            promotion.status ===
                            "เปิดใช้งาน"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {promotion.status}
                        </button>
                      </div>

                      <div className="mt-2.5">
                        <span className="inline-flex rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium leading-4 text-blue-700">
                          {getTypeLabel(
                            promotion.type
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-px bg-gray-100">
                      <div className="bg-white p-3.5">
                        <p className="text-xs text-gray-400">
                          เงื่อนไข
                        </p>

                        <div className="mt-1">
                          {getConditionText(
                            promotion
                          )}
                        </div>
                      </div>

                      <div className="bg-white p-3.5">
                        <p className="text-xs text-gray-400">
                          ส่วนลด / ราคา
                        </p>

                        <p className="mt-1 text-lg font-bold text-red-600">
                          {getDiscountText(
                            promotion
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 p-3.5">
                      <p className="text-xs text-gray-400">
                        ระยะเวลาโปรโมชั่น
                      </p>

                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-sm text-gray-700">
                        <span className="rounded-md bg-gray-50 px-2.5 py-1.5">
                          {formatDate(
                            promotion.startDate
                          )}
                        </span>

                        <span className="text-gray-400">
                          →
                        </span>

                        <span className="rounded-md bg-gray-50 px-2.5 py-1.5">
                          {formatDate(
                            promotion.endDate
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 border-t border-gray-100 p-3.5">
                      <button
                        onClick={() =>
                          openEditModal(
                            promotion
                          )
                        }
                        className="!min-h-0 h-9 flex-1 rounded-lg border border-blue-200 bg-blue-50 px-3 text-sm font-medium leading-none text-blue-600 transition hover:bg-blue-100"
                      >
                        แก้ไข
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            promotion.id
                          )
                        }
                        className="!min-h-0 h-9 flex-1 rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-medium leading-none text-red-600 transition hover:bg-red-100"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                )
              )
            ) : (
              <div className="rounded-xl border border-gray-100 bg-white px-5 py-10 text-center text-sm text-gray-400 shadow-sm">
                ไม่พบโปรโมชั่น
              </div>
            )}
          </div>
        </>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <div className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5 sm:px-5">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-800">
                  {editingPromotion
                    ? "แก้ไขโปรโมชั่น"
                    : "เพิ่มโปรโมชั่น"}
                </h2>

                <p className="mt-0.5 text-xs text-gray-400">
                  กรอกข้อมูลโปรโมชั่นให้ครบถ้วน
                </p>
              </div>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="!min-h-0 h-9 w-9 shrink-0 rounded-lg p-0 text-xl leading-none text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-5">
              <div className="space-y-4">
                {/* NAME */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    ชื่อโปรโมชั่น
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="เช่น ซื้อครบ 100 บาท ลด 10 บาท"
                    className="!h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                {/* TYPE */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    ประเภทโปรโมชั่น
                  </label>

                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="!h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
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

                {/* CONDITION / DISCOUNT */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      เงื่อนไข
                    </label>

                    <input
                      type="number"
                      name="condition"
                      value={form.condition}
                      onChange={handleChange}
                      min="0"
                      placeholder="เช่น 100"
                      className="!h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      ส่วนลด / ราคาพิเศษ
                    </label>

                    <input
                      type="number"
                      name="discount"
                      value={form.discount}
                      onChange={handleChange}
                      min="0"
                      placeholder="เช่น 10"
                      className="!h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* DATE */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      วันที่เริ่ม
                    </label>

                    <input
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      className="!h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      วันที่สิ้นสุด
                    </label>

                    <input
                      type="date"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleChange}
                      className="!h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 p-3.5 sm:flex-row sm:justify-end sm:px-5">
              <button
                onClick={() =>
                  setShowModal(false)
                }
                disabled={saving}
                className="!min-h-0 h-10 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium leading-none text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                ยกเลิก
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="!min-h-0 h-10 w-full rounded-lg bg-blue-600 px-4 text-sm font-semibold leading-none text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {saving
                  ? "กำลังบันทึก..."
                  : editingPromotion
                  ? "บันทึกการแก้ไข"
                  : "เพิ่มโปรโมชั่น"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}