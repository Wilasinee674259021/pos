
import { useEffect, useMemo, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Stock() {
  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ทั้งหมด");

  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [stockType, setStockType] = useState("in");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* =========================================================
      LOAD PRODUCTS FROM DATABASE
  ========================================================= */

  const loadProducts = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/stock`);

      if (!response.ok) {
        throw new Error("ไม่สามารถโหลดข้อมูลสต๊อกได้");
      }

      const result = await response.json();

      if (result.success) {
        setProducts(result.data || []);
      } else {
        throw new Error(result.message || "ไม่สามารถโหลดข้อมูลสต๊อกได้");
      }
    } catch (error) {
      console.error("LOAD STOCK ERROR:", error);

      alert(
        "ไม่สามารถเชื่อมต่อฐานข้อมูลได้\nกรุณาตรวจสอบ Backend"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  /* =========================================================
      CATEGORY
  ========================================================= */

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
      ),
    ];

    return ["ทั้งหมด", ...uniqueCategories];
  }, [products]);

  /* =========================================================
      FILTER
  ========================================================= */

  const filteredProducts = products.filter((product) => {
    const keyword = search.toLowerCase().trim();

    const productName = String(product.name || "").toLowerCase();
    const productCode = String(product.id || "").toLowerCase();
    const barcode = String(product.barcode || "").toLowerCase();

    const matchSearch =
      productName.includes(keyword) ||
      productCode.includes(keyword) ||
      barcode.includes(keyword);

    const matchCategory =
      category === "ทั้งหมด" ||
      product.category === category;

    return matchSearch && matchCategory;
  });

  /* =========================================================
      SUMMARY
  ========================================================= */

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum, product) => sum + Number(product.stock || 0),
    0
  );

  const lowStockProducts = products.filter(
    (product) => {
      const stock = Number(product.stock || 0);
      const minStock = Number(product.minStock || 10);

      return stock > 0 && stock <= minStock;
    }
  ).length;

  const outOfStockProducts = products.filter(
    (product) => Number(product.stock || 0) === 0
  ).length;

  /* =========================================================
      STATUS
  ========================================================= */

  const getStockStatus = (product) => {
    const stock = Number(product.stock || 0);

    // ตอนนี้ Product model ยังไม่มี minStock
    // จึงใช้ 10 เป็นค่าขั้นต่ำเริ่มต้น
    const minStock = Number(product.minStock || 10);

    if (stock === 0) {
      return {
        label: "หมด",
        className: "bg-red-100 text-red-700",
        stockClass: "text-red-600",
      };
    }

    if (stock <= minStock) {
      return {
        label: "ใกล้หมด",
        className: "bg-orange-100 text-orange-700",
        stockClass: "text-orange-500",
      };
    }

    return {
      label: "ปกติ",
      className: "bg-green-100 text-green-700",
      stockClass: "text-green-600",
    };
  };

  /* =========================================================
      OPEN MODAL
  ========================================================= */

  const openStockModal = (product, type) => {
    setSelectedProduct(product);
    setStockType(type);
    setAmount("");
    setNote("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setSelectedProduct(null);
    setAmount("");
    setNote("");
  };

  /* =========================================================
      UPDATE STOCK
  ========================================================= */

  const updateStock = async () => {
    const quantity = Number(amount);

    if (!amount || !Number.isInteger(quantity) || quantity <= 0) {
      alert("กรุณากรอกจำนวนสินค้าเป็นจำนวนเต็มมากกว่า 0");
      return;
    }

    if (!selectedProduct) {
      return;
    }

    if (
      stockType === "out" &&
      quantity > Number(selectedProduct.stock || 0)
    ) {
      alert(
        `จำนวนสินค้าในสต๊อกไม่เพียงพอ\nเหลือ ${selectedProduct.stock} ชิ้น`
      );
      return;
    }

    try {
      setSaving(true);

      const endpoint =
        stockType === "in"
          ? `${API_URL}/api/stock/in`
          : `${API_URL}/api/stock/out`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity,
          note: note.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "ไม่สามารถอัปเดตสต๊อกได้"
        );
      }

      setShowModal(false);
      setSelectedProduct(null);
      setAmount("");
      setNote("");

      await loadProducts();

      alert(
        stockType === "in"
          ? "รับสินค้าเข้าสต๊อกเรียบร้อย"
          : "ตัดสินค้าออกจากสต๊อกเรียบร้อย"
      );
    } catch (error) {
      console.error("UPDATE STOCK ERROR:", error);

      alert(
        error.message ||
          "ไม่สามารถอัปเดตสต๊อกได้ กรุณาตรวจสอบ Backend"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 lg:p-8">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
            📦 จัดการสต๊อกสินค้า
          </h1>

          <p className="text-sm leading-6 text-gray-500">
            ตรวจสอบ รับเข้า และตัดสินค้าออกจากสต๊อก
          </p>
        </div>
      </div>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* TOTAL PRODUCTS */}

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-500">
                สินค้าทั้งหมด
              </p>

              <p className="mt-1.5 text-2xl font-bold text-gray-800">
                {totalProducts}
              </p>

              <p className="mt-0.5 text-xs text-gray-400">
                รายการสินค้า
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-lg">
              📦
            </div>
          </div>
        </div>

        {/* TOTAL STOCK */}

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-500">
                จำนวนสินค้าคงเหลือ
              </p>

              <p className="mt-1.5 text-2xl font-bold text-blue-600">
                {totalStock}
              </p>

              <p className="mt-0.5 text-xs text-gray-400">
                ชิ้น
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-lg">
              📊
            </div>
          </div>
        </div>

        {/* LOW STOCK */}

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-500">
                สินค้าใกล้หมด
              </p>

              <p className="mt-1.5 text-2xl font-bold text-orange-500">
                {lowStockProducts}
              </p>

              <p className="mt-0.5 text-xs text-gray-400">
                รายการ
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-lg">
              ⚠️
            </div>
          </div>
        </div>

        {/* OUT OF STOCK */}

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-500">
                สินค้าหมด
              </p>

              <p className="mt-1.5 text-2xl font-bold text-red-500">
                {outOfStockProducts}
              </p>

              <p className="mt-0.5 text-xs text-gray-400">
                รายการ
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-lg">
              🚨
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          SEARCH / FILTER
      ===================================================== */}

      <div className="mb-4 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อสินค้า / รหัสสินค้า / Barcode"
              className="!h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 pr-10 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white"
            />

            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="!h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-blue-500 sm:w-48"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (
        <div className="rounded-xl border border-gray-100 bg-white px-5 py-12 text-center shadow-sm">
          <p className="text-sm text-gray-400">
            ⏳ กำลังโหลดข้อมูลสต๊อก...
          </p>
        </div>
      ) : (
        <>
          {/* =================================================
              DESKTOP TABLE
          ================================================= */}

          <div className="hidden overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] table-fixed">
                <colgroup>
                  <col className="w-[13%]" />
                  <col className="w-[25%]" />
                  <col className="w-[15%]" />
                  <col className="w-[12%]" />
                  <col className="w-[13%]" />
                  <col className="w-[22%]" />
                </colgroup>

                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                      รหัสสินค้า
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                      สินค้า
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                      หมวดหมู่
                    </th>

                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">
                      สต๊อก
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
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => {
                      const status = getStockStatus(product);

                      return (
                        <tr
                          key={product.id}
                          className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                        >
                          {/* CODE */}

                          <td className="px-4 py-4 align-middle">
                            <span className="rounded-md bg-gray-100 px-2.5 py-1.5 font-mono text-xs font-semibold text-gray-600">
                              {product.id}
                            </span>
                          </td>

                          {/* PRODUCT */}

                          <td className="px-4 py-4 align-middle">
                            <div className="min-w-0">
                              <p className="break-words text-sm font-semibold leading-5 text-gray-800">
                                {product.name}
                              </p>

                              <p className="mt-0.5 text-xs text-gray-400">
                                สต๊อกขั้นต่ำ 10 ชิ้น
                              </p>
                            </div>
                          </td>

                          {/* CATEGORY */}

                          <td className="px-4 py-4 align-middle">
                            <span className="inline-flex rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                              {product.category || "ไม่ระบุ"}
                            </span>
                          </td>

                          {/* STOCK */}

                          <td className="px-4 py-4 text-center align-middle">
                            <div className="flex flex-col items-center">
                              <span
                                className={`text-xl font-bold ${status.stockClass}`}
                              >
                                {product.stock}
                              </span>

                              <span className="text-xs text-gray-400">
                                ชิ้น
                              </span>
                            </div>
                          </td>

                          {/* STATUS */}

                          <td className="px-4 py-4 text-center align-middle">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </td>

                          {/* ACTION */}

                          <td className="px-4 py-4 align-middle">
                            <div className="flex justify-center gap-1.5">
                              <button
                                onClick={() =>
                                  openStockModal(product, "in")
                                }
                                disabled={saving}
                                className="!min-h-0 h-8 rounded-md border border-green-200 bg-green-50 px-2.5 text-xs font-medium leading-none text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                ＋ รับเข้า
                              </button>

                              <button
                                onClick={() =>
                                  openStockModal(product, "out")
                                }
                                disabled={
                                  saving ||
                                  Number(product.stock || 0) === 0
                                }
                                className="!min-h-0 h-8 rounded-md border border-red-200 bg-red-50 px-2.5 text-xs font-medium leading-none text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                − ตัดออก
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-5 py-10 text-center text-sm text-gray-400"
                      >
                        ไม่พบสินค้า
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* =================================================
              MOBILE CARDS
          ================================================= */}

          <div className="space-y-3 md:hidden">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const status = getStockStatus(product);

                return (
                  <div
                    key={product.id}
                    className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                  >
                    {/* CARD HEADER */}

                    <div className="border-b border-gray-100 p-3.5">
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="min-w-0 flex-1">
                          <div className="mb-2">
                            <span className="rounded-md bg-gray-100 px-2.5 py-1.5 font-mono text-xs font-semibold text-gray-600">
                              {product.id}
                            </span>
                          </div>

                          <h2 className="break-words text-base font-bold leading-5 text-gray-800">
                            {product.name}
                          </h2>

                          <p className="mt-1 text-xs text-gray-400">
                            สต๊อกขั้นต่ำ 10 ชิ้น
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>
                    </div>

                    {/* CARD INFO */}

                    <div className="grid grid-cols-2 gap-px bg-gray-100">
                      <div className="bg-white p-3.5">
                        <p className="text-xs text-gray-400">
                          หมวดหมู่
                        </p>

                        <p className="mt-1 break-words text-sm font-semibold text-gray-700">
                          {product.category || "ไม่ระบุ"}
                        </p>
                      </div>

                      <div className="bg-white p-3.5">
                        <p className="text-xs text-gray-400">
                          สินค้าคงเหลือ
                        </p>

                        <div className="mt-1 flex items-baseline gap-1">
                          <span
                            className={`text-xl font-bold ${status.stockClass}`}
                          >
                            {product.stock}
                          </span>

                          <span className="text-xs text-gray-400">
                            ชิ้น
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ACTION */}

                    <div className="flex gap-2 border-t border-gray-100 p-3.5">
                      <button
                        onClick={() =>
                          openStockModal(product, "in")
                        }
                        disabled={saving}
                        className="!min-h-0 h-9 flex-1 rounded-lg border border-green-200 bg-green-50 px-3 text-sm font-medium leading-none text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ＋ รับเข้า
                      </button>

                      <button
                        onClick={() =>
                          openStockModal(product, "out")
                        }
                        disabled={
                          saving ||
                          Number(product.stock || 0) === 0
                        }
                        className="!min-h-0 h-9 flex-1 rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-medium leading-none text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        − ตัดออก
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-gray-100 bg-white px-5 py-10 text-center text-sm text-gray-400 shadow-sm">
                ไม่พบสินค้า
              </div>
            )}
          </div>
        </>
      )}

      {/* =====================================================
          STOCK MODAL
      ===================================================== */}

      {showModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <div className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5 sm:px-5">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-800">
                  {stockType === "in"
                    ? "📥 รับสินค้าเข้า"
                    : "📤 ตัดสินค้าออก"}
                </h2>

                <p className="mt-0.5 text-xs text-gray-400">
                  {stockType === "in"
                    ? "เพิ่มจำนวนสินค้าเข้าสู่สต๊อก"
                    : "ลดจำนวนสินค้าออกจากสต๊อก"}
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="!min-h-0 h-9 w-9 shrink-0 rounded-lg p-0 text-xl leading-none text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed"
              >
                ×
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="overflow-y-auto p-4 sm:p-5">
              {/* PRODUCT INFO */}

              <div className="mb-4 rounded-xl bg-gray-50 p-3.5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-words text-base font-bold leading-5 text-gray-800">
                      {selectedProduct.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      รหัสสินค้า: {selectedProduct.id}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-400">
                      Barcode: {selectedProduct.barcode}
                    </p>
                  </div>

                  <div className="shrink-0 rounded-lg bg-white px-3 py-2.5 text-center shadow-sm">
                    <p className="text-xs text-gray-400">
                      สต๊อกปัจจุบัน
                    </p>

                    <p
                      className={`mt-0.5 text-xl font-bold ${
                        getStockStatus(selectedProduct).stockClass
                      }`}
                    >
                      {selectedProduct.stock}

                      <span className="ml-1 text-xs font-normal text-gray-400">
                        ชิ้น
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* AMOUNT */}

              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  จำนวนสินค้า
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="กรอกจำนวนสินค้า"
                  className="!h-11 w-full rounded-lg border border-gray-200 px-3 text-base outline-none transition focus:border-blue-500"
                  autoFocus
                  disabled={saving}
                />
              </div>

              {/* NOTE */}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  หมายเหตุ
                </label>

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    stockType === "in"
                      ? "เช่น รับสินค้าจากซัพพลายเออร์"
                      : "เช่น สินค้าชำรุด / หมดอายุ"
                  }
                  className="h-20 w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500"
                  disabled={saving}
                />
              </div>
            </div>

            {/* MODAL FOOTER */}

            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 p-3.5 sm:flex-row sm:justify-end sm:px-5">
              <button
                onClick={closeModal}
                disabled={saving}
                className="!min-h-0 h-10 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium leading-none text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                ยกเลิก
              </button>

              <button
                onClick={updateStock}
                disabled={saving}
                className={`!min-h-0 h-10 w-full rounded-lg px-4 text-sm font-semibold leading-none text-white transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${
                  stockType === "in"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {saving
                  ? "⏳ กำลังบันทึก..."
                  : stockType === "in"
                  ? "📥 ยืนยันรับเข้า"
                  : "📤 ยืนยันตัดออก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
