
import { useEffect, useMemo, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const API_URL = `${API_BASE}/api/products`;
const STOCK_API_URL = `${API_BASE}/api/stock`;

export default function Stock() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ทั้งหมด");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [movementType, setMovementType] = useState("in");

  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  // ======================================
  // LOAD PRODUCTS
  // ======================================

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Loading stock from:", API_URL);

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const text = await response.text();

      console.log("Stock API response:", text);

      let result;

      try {
        result = JSON.parse(text);
      } catch {
        throw new Error("Backend ส่งข้อมูลไม่ใช่ JSON");
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "โหลดข้อมูลสต๊อกไม่สำเร็จ",
        );
      }

      setProducts(
        Array.isArray(result.data)
          ? result.data
          : [],
      );
    } catch (err) {
      console.error("LOAD STOCK ERROR:", err);

      setProducts([]);

      setError(
        err.message ||
          "ไม่สามารถโหลดข้อมูลสต๊อกได้",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ======================================
  // CATEGORIES
  // ======================================

  const categories = useMemo(() => {
    const list = products
      .map((product) => product.category)
      .filter(Boolean);

    return ["ทั้งหมด", ...new Set(list)];
  }, [products]);

  // ======================================
  // FILTER
  // ======================================

  const filteredProducts = products.filter(
    (product) => {
      const keyword = search
        .toLowerCase()
        .trim();

      const matchSearch =
        !keyword ||
        String(product.id || "")
          .toLowerCase()
          .includes(keyword) ||
        String(product.name || "")
          .toLowerCase()
          .includes(keyword) ||
        String(product.barcode || "")
          .toLowerCase()
          .includes(keyword) ||
        String(product.category || "")
          .toLowerCase()
          .includes(keyword);

      const matchCategory =
        category === "ทั้งหมด" ||
        product.category === category;

      return matchSearch && matchCategory;
    },
  );

  // ======================================
  // SUMMARY
  // ======================================

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum, product) =>
      sum + Number(product.stock || 0),
    0,
  );

  const lowStock = products.filter(
    (product) =>
      Number(product.stock || 0) > 0 &&
      Number(product.stock || 0) <= 5,
  ).length;

  const outOfStock = products.filter(
    (product) =>
      Number(product.stock || 0) === 0,
  ).length;

  // ======================================
  // OPEN STOCK FORM
  // ======================================

  const openStockForm = (product, type) => {
    setSelectedProduct(product);
    setMovementType(type);
    setQuantity("");
    setNote("");
    setShowForm(true);
  };

  // ======================================
  // CLOSE STOCK FORM
  // ======================================

  const closeStockForm = () => {
    setShowForm(false);
    setSelectedProduct(null);
    setQuantity("");
    setNote("");
    setMovementType("in");
  };

  // ======================================
  // STOCK IN / OUT
  // ======================================

  const saveStockMovement = async () => {
    if (!selectedProduct) {
      return;
    }

    const amount = Number(quantity);

    if (
      !quantity ||
      Number.isNaN(amount) ||
      amount <= 0 ||
      !Number.isInteger(amount)
    ) {
      alert("กรุณากรอกจำนวนเป็นจำนวนเต็มมากกว่า 0");
      return;
    }

    const currentStock = Number(
      selectedProduct.stock || 0,
    );

    if (
      movementType === "out" &&
      amount > currentStock
    ) {
      alert(
        `สต๊อกไม่เพียงพอ\nคงเหลือ ${currentStock} ชิ้น`,
      );
      return;
    }

    try {
      setSaving(true);

      const endpoint =
        movementType === "in"
          ? `${STOCK_API_URL}/in`
          : `${STOCK_API_URL}/out`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity: amount,
          note: note.trim(),
        }),
      });

      const text = await response.text();

      let result;

      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(
          "Backend ส่งข้อมูลไม่ใช่ JSON",
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "บันทึกสต๊อกไม่สำเร็จ",
        );
      }

      alert(
        movementType === "in"
          ? "รับเข้าสินค้าเรียบร้อย"
          : "จ่ายออกสินค้าเรียบร้อย",
      );

      closeStockForm();

      await loadProducts();
    } catch (err) {
      console.error(
        "STOCK MOVEMENT ERROR:",
        err,
      );

      alert(
        `ไม่สามารถบันทึกสต๊อกได้\n${err.message}`,
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================
  // UI
  // ======================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-5 lg:p-8">

      {/* HEADER */}

      <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">

        <div className="min-w-0">

          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            📦 จัดการสต๊อก
          </h1>

          <p className="mt-1 text-sm text-slate-500 sm:text-base">
            ตรวจสอบและจัดการจำนวนสินค้าคงเหลือ
          </p>

        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 sm:mb-6">

          <p className="font-bold">
            โหลดข้อมูลสต๊อกไม่สำเร็จ
          </p>

          <p className="mt-1 break-words text-sm">
            {error}
          </p>

          <button
            onClick={loadProducts}
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

      {/* SUMMARY */}

      <div className="mb-5 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">

        {/* TOTAL PRODUCTS */}

        <div className="rounded-xl bg-white p-4 shadow-sm sm:p-5">

          <p className="text-sm text-slate-500 sm:text-base">
            สินค้าทั้งหมด
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-800 sm:text-3xl">
            {totalProducts}
          </p>

          <p className="mt-1 text-sm text-slate-400">
            รายการ
          </p>

        </div>

        {/* TOTAL STOCK */}

        <div className="rounded-xl bg-white p-4 shadow-sm sm:p-5">

          <p className="text-sm text-slate-500 sm:text-base">
            Stock รวม
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600 sm:text-3xl">
            {totalStock.toLocaleString("th-TH")}
          </p>

          <p className="mt-1 text-sm text-slate-400">
            ชิ้น
          </p>

        </div>

        {/* LOW STOCK */}

        <div className="rounded-xl bg-white p-4 shadow-sm sm:p-5">

          <p className="text-sm text-slate-500 sm:text-base">
            สินค้าใกล้หมด
          </p>

          <p className="mt-2 text-2xl font-bold text-orange-500 sm:text-3xl">
            {lowStock}
          </p>

          <p className="mt-1 text-sm text-slate-400">
            รายการ
          </p>

        </div>

        {/* OUT OF STOCK */}

        <div className="rounded-xl bg-white p-4 shadow-sm sm:p-5">

          <p className="text-sm text-slate-500 sm:text-base">
            สินค้าหมด
          </p>

          <p className="mt-2 text-2xl font-bold text-red-600 sm:text-3xl">
            {outOfStock}
          </p>

          <p className="mt-1 text-sm text-slate-400">
            รายการ
          </p>

        </div>

      </div>

      {/* SEARCH + CATEGORY */}

      <div className="mb-5 rounded-xl bg-white p-4 shadow-sm sm:mb-6 sm:p-5">

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

          <div className="sm:col-span-2">

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="🔍 ค้นหาชื่อสินค้า / Barcode / รหัสสินค้า"
              className="
                h-10
                w-full
                rounded-lg
                border
                border-slate-300
                px-4
                text-sm
                outline-none
                transition
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-500
              "
            />

          </div>

          <div>

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="
                h-10
                w-full
                rounded-lg
                border
                border-slate-300
                bg-white
                px-4
                text-sm
                outline-none
                transition
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-500
              "
            >

              {categories.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ),
              )}

            </select>

          </div>

        </div>

        {(search ||
          category !== "ทั้งหมด") && (
          <div className="mt-2 text-sm text-slate-500">
            พบ {filteredProducts.length} รายการ
          </div>
        )}

      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">

        {/* TABLE HEADER */}

        <div className="border-b p-4 sm:p-5">

          <div className="flex items-center justify-between gap-3">

            <h2 className="text-lg font-bold">
              รายการสต๊อก
            </h2>

            <span className="text-sm text-slate-400">
              {filteredProducts.length} รายการ
            </span>

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1000px]">

            <thead className="bg-slate-100">

              <tr>

                <th className="whitespace-nowrap p-4 text-left">
                  รหัส
                </th>

                <th className="whitespace-nowrap p-4 text-left">
                  สินค้า
                </th>

                <th className="whitespace-nowrap p-4 text-left">
                  Barcode
                </th>

                <th className="whitespace-nowrap p-4 text-left">
                  หมวดหมู่
                </th>

                <th className="whitespace-nowrap p-4 text-right">
                  ราคา
                </th>

                <th className="whitespace-nowrap p-4 text-center">
                  Stock
                </th>

                <th className="whitespace-nowrap p-4 text-center">
                  สถานะ
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
                    colSpan="8"
                    className="p-10 text-center text-slate-500"
                  >

                    <div className="flex flex-col items-center gap-2">

                      <div className="text-2xl">
                        ⏳
                      </div>

                      <div>
                        กำลังโหลดข้อมูลสต๊อก...
                      </div>

                    </div>

                  </td>

                </tr>

              ) : filteredProducts.length === 0 ? (

                <tr>

                  <td
                    colSpan="8"
                    className="p-10 text-center text-slate-400"
                  >

                    <div className="mb-2 text-3xl">
                      📦
                    </div>

                    <div>
                      {search ||
                      category !== "ทั้งหมด"
                        ? "ไม่พบสินค้าที่ค้นหา"
                        : "ยังไม่มีสินค้า"}
                    </div>

                  </td>

                </tr>

              ) : (

                filteredProducts.map(
                  (product) => {

                    const stock = Number(
                      product.stock || 0,
                    );

                    let statusText = "ปกติ";

                    let statusClass =
                      "bg-green-100 text-green-700";

                    if (stock === 0) {
                      statusText = "หมด";
                      statusClass =
                        "bg-red-100 text-red-700";
                    } else if (stock <= 5) {
                      statusText = "ใกล้หมด";
                      statusClass =
                        "bg-orange-100 text-orange-700";
                    }

                    return (
                      <tr
                        key={product.id}
                        className="border-t transition hover:bg-slate-50"
                      >

                        {/* ID */}

                        <td className="whitespace-nowrap p-4 font-bold">
                          {product.id}
                        </td>

                        {/* NAME */}

                        <td className="max-w-[220px] p-4 font-medium">

                          <div
                            className="truncate"
                            title={product.name}
                          >
                            {product.name}
                          </div>

                        </td>

                        {/* BARCODE */}

                        <td className="whitespace-nowrap p-4">
                          {product.barcode}
                        </td>

                        {/* CATEGORY */}

                        <td className="p-4">

                          <span className="inline-block max-w-[160px] truncate">
                            {product.category || "-"}
                          </span>

                        </td>

                        {/* PRICE */}

                        <td className="whitespace-nowrap p-4 text-right font-bold">

                          ฿
                          {Number(
                            product.price || 0,
                          ).toLocaleString(
                            "th-TH",
                            {
                              minimumFractionDigits: 2,
                            },
                          )}

                        </td>

                        {/* STOCK */}

                        <td className="p-4 text-center">

                          <span
                            className={`inline-block min-w-[55px] rounded-full px-3 py-1 text-sm font-bold ${
                              stock === 0
                                ? "bg-red-100 text-red-700"
                                : stock <= 5
                                ? "bg-orange-100 text-orange-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {stock}
                          </span>

                        </td>

                        {/* STATUS */}

                        <td className="p-4 text-center">

                          <span
                            className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${statusClass}`}
                          >
                            {statusText}
                          </span>

                        </td>

                        {/* ACTION */}

                        <td className="p-4">

                          <div className="flex justify-center gap-1.5">

                            <button
                              onClick={() =>
                                openStockForm(
                                  product,
                                  "in",
                                )
                              }
                              className="
                                flex
                                h-8
                                items-center
                                justify-center
                                rounded-md
                                bg-green-100
                                px-3
                                text-sm
                                font-bold
                                text-green-700
                                transition
                                hover:bg-green-200
                              "
                            >
                              ＋ รับเข้า
                            </button>

                            <button
                              onClick={() =>
                                openStockForm(
                                  product,
                                  "out",
                                )
                              }
                              disabled={stock === 0}
                              className="
                                flex
                                h-8
                                items-center
                                justify-center
                                rounded-md
                                bg-red-100
                                px-3
                                text-sm
                                font-bold
                                text-red-700
                                transition
                                hover:bg-red-200
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                              "
                            >
                              － จ่ายออก
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  },
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* STOCK MODAL */}

      {showForm && selectedProduct && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">

          <div className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:p-6 lg:p-7">

            {/* MODAL HEADER */}

            <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">

              <div>

                <h2 className="text-xl font-bold sm:text-2xl">

                  {movementType === "in"
                    ? "📥 รับเข้าสินค้า"
                    : "📤 จ่ายออกสินค้า"}

                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  {selectedProduct.id} -{" "}
                  {selectedProduct.name}

                </p>

              </div>

              <button
                onClick={closeStockForm}
                disabled={saving}
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  text-lg
                  text-slate-500
                  transition
                  hover:bg-slate-100
                  hover:text-slate-800
                "
              >
                ✕
              </button>

            </div>

            {/* CURRENT STOCK */}

            <div className="mb-5 rounded-xl bg-slate-50 p-4">

              <div className="flex items-center justify-between">

                <span className="text-sm text-slate-500">
                  Stock ปัจจุบัน
                </span>

                <span className="text-xl font-bold text-slate-800">
                  {Number(
                    selectedProduct.stock || 0,
                  )}{" "}
                  ชิ้น
                </span>

              </div>

            </div>

            {/* QUANTITY */}

            <div className="mb-4">

              <label className="mb-2 block font-medium">
                จำนวน
              </label>

              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value)
                }
                placeholder="ระบุจำนวน"
                inputMode="numeric"
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
                autoFocus
              />

            </div>

            {/* NOTE */}

            <div className="mb-6">

              <label className="mb-2 block font-medium">
                หมายเหตุ
              </label>

              <textarea
                value={note}
                onChange={(e) =>
                  setNote(e.target.value)
                }
                placeholder={
                  movementType === "in"
                    ? "เช่น รับสินค้าจาก Supplier"
                    : "เช่น สินค้าชำรุด / ปรับยอด"
                }
                rows="3"
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

            {/* BUTTONS */}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">

              <button
                onClick={closeStockForm}
                disabled={saving}
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
                onClick={saveStockMovement}
                disabled={saving}
                className={`
                  h-10
                  w-full
                  rounded-lg
                  font-bold
                  text-white
                  transition
                  sm:flex-1
                  ${
                    movementType === "in"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                `}
              >
                {saving
                  ? "กำลังบันทึก..."
                  : movementType === "in"
                  ? "💾 ยืนยันรับเข้า"
                  : "💾 ยืนยันจ่ายออก"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}
