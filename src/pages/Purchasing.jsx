import { useEffect, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const API_PRODUCTS_URL = `${API_BASE}/api/products`;

const defaultSuppliers = [
  {
    id: 1,
    name: "บริษัท ไทยเบฟเวอเรจ จำกัด",
    phone: "02-123-4567",
  },
  {
    id: 2,
    name: "บริษัท ซีพี ออลล์ จำกัด",
    phone: "02-345-6789",
  },
  {
    id: 3,
    name: "บริษัท ยูนิลีเวอร์ ไทย เทรดดิ้ง จำกัด",
    phone: "02-555-8888",
  },
];

export default function Purchasing() {
  const [suppliers] = useState(defaultSuppliers);

  const [purchases, setPurchases] = useState(() => {
    const saved = localStorage.getItem("pos_purchases");
    return saved ? JSON.parse(saved) : [];
  });

  const [stock, setStock] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [items, setItems] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [cost, setCost] = useState("");

  const [search, setSearch] = useState("");

  // =========================
  // LOAD PRODUCTS FROM BACKEND
  // =========================
  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await fetch(API_PRODUCTS_URL, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error("Backend ส่งข้อมูลไม่ใช่ JSON");
      }

      if (response.ok && result.success && Array.isArray(result.data)) {
        setStock(result.data);
      } else {
        setStock([]);
      }
    } catch (err) {
      console.error("LOAD PRODUCTS ERROR IN PURCHASING:", err);
      setStock([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem("pos_purchases", JSON.stringify(purchases));
  }, [purchases]);

  /* =========================
      SUMMARY
  ========================= */

  const totalPurchases = purchases.length;

  const totalItems = purchases.reduce(
    (sum, purchase) => sum + Number(purchase.totalItems || 0),
    0
  );

  const totalCost = purchases.reduce(
    (sum, purchase) => sum + Number(purchase.totalCost || 0),
    0
  );

  const currentFormTotal = items.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0
  );

  /* =========================
      ADD ITEM
  ========================= */

  const addItem = () => {
    if (!selectedProduct) {
      alert("กรุณาเลือกสินค้า");
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      alert("กรุณากรอกจำนวนสินค้า");
      return;
    }

    if (!cost || Number(cost) < 0) {
      alert("กรุณากรอกราคาทุน");
      return;
    }

    const product = stock.find(
      (item) => String(item.id) === String(selectedProduct)
    );

    if (!product) {
      alert("ไม่พบสินค้านี้ในระบบ");
      return;
    }

    const newItem = {
      id: Date.now(),
      productId: product.id,
      barcode: product.barcode,
      name: product.name,
      quantity: Number(quantity),
      cost: Number(cost),
      total: Number(quantity) * Number(cost),
      currentStock: Number(product.stock || 0),
      currentPrice: Number(product.price || 0),
      category: product.category || "",
    };

    setItems((prev) => [...prev, newItem]);

    setSelectedProduct("");
    setQuantity("");
    setCost("");
  };

  /* =========================
      REMOVE ITEM
  ========================= */

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  /* =========================
      SAVE PURCHASE
  ========================= */

  const savePurchase = async () => {
    if (!selectedSupplier) {
      alert("กรุณาเลือก Supplier");
      return;
    }

    if (!invoiceNumber.trim()) {
      alert("กรุณากรอกเลขที่ใบรับสินค้า");
      return;
    }

    if (items.length === 0) {
      alert("กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ");
      return;
    }

    const supplier = suppliers.find(
      (item) => item.id === Number(selectedSupplier)
    );

    const purchaseTotalItems = items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const purchaseTotalCost = items.reduce(
      (sum, item) => sum + item.total,
      0
    );

    /* =========================
        UPDATE BACKEND STOCK & COST
    ========================= */

    try {
      for (const item of items) {
        const newStock = item.currentStock + item.quantity;
        const newCost = item.cost;

        const response = await fetch(`${API_PRODUCTS_URL}/${item.productId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: item.name,
            barcode: item.barcode,
            price: item.currentPrice,
            cost: newCost,
            stock: newStock,
            category: item.category,
          }),
        });

        if (!response.ok) {
          throw new Error(`อัปเดตสินค้า ${item.name} ไม่สำเร็จ`);
        }
      }

      /* =========================
          CREATE PURCHASE
      ========================= */

      const newPurchase = {
        id: Date.now(),
        invoiceNumber,
        supplier: supplier?.name || "-",
        date: purchaseDate,
        totalItems: purchaseTotalItems,
        totalCost: purchaseTotalCost,
        items,
      };

      setPurchases((prev) => [newPurchase, ...prev]);

      alert("บันทึกการรับสินค้าเรียบร้อย\nสต๊อกและต้นทุนสินค้าถูกอัปเดตเข้าระบบแล้ว");

      await loadProducts();
      closeForm();
    } catch (err) {
      console.error("SAVE PURCHASE ERROR:", err);
      alert(`เกิดข้อผิดพลาดในการอัปเดตสต๊อกไปยัง Backend:\n${err.message}`);
    }
  };

  /* =========================
      CLOSE FORM
  ========================= */

  const closeForm = () => {
    setShowForm(false);

    setSelectedSupplier("");
    setInvoiceNumber("");

    setPurchaseDate(
      new Date().toISOString().split("T")[0]
    );

    setItems([]);
    setSelectedProduct("");
    setQuantity("");
    setCost("");
  };

  /* =========================
      SEARCH
  ========================= */

  const filteredPurchases = purchases.filter((purchase) => {
    const keyword = search.toLowerCase().trim();

    return (
      (purchase.invoiceNumber || "")
        .toLowerCase()
        .includes(keyword) ||
      (purchase.supplier || "")
        .toLowerCase()
        .includes(keyword)
    );
  });

  /* =========================
      DATE
  ========================= */

  const formatDate = (date) => {
    if (!date) return "-";

    const [year, month, day] = date.split("-");

    return `${day}/${month}/${year}`;
  };

  /* =========================
      VIEW ITEMS
  ========================= */

  const viewItems = (purchase) => {
    if (!purchase.items?.length) {
      alert("ไม่มีรายการสินค้า");
      return;
    }

    alert(
      purchase.items
        .map(
          (item) =>
            `${item.barcode || ""} ${item.name} × ${item.quantity} ชิ้น`
        )
        .join("\n")
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 lg:p-8">
      {/* HEADER */}
      <div className="mb-5 sm:mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold leading-tight text-gray-800 sm:text-3xl">
              🚚 จัดซื้อ / รับสินค้า
            </h1>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              จัดการการสั่งซื้อและรับสินค้าเข้าสต๊อก
            </p>
          </div>

          <button
            onClick={() => {
              loadProducts();
              setShowForm(true);
            }}
            className="!min-h-0 h-10 w-full rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto sm:px-5"
          >
            ＋ รับสินค้าเข้า
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500 sm:text-sm">
                รายการรับสินค้าทั้งหมด
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-800 sm:text-3xl">
                {totalPurchases}
              </p>
              <p className="mt-1 text-xs text-gray-400">รายการ</p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-lg sm:h-11 sm:w-11 sm:rounded-xl sm:text-xl">
              🚚
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500 sm:text-sm">
                จำนวนสินค้าที่รับเข้า
              </p>
              <p className="mt-2 text-2xl font-bold text-blue-600 sm:text-3xl">
                {totalItems}
              </p>
              <p className="mt-1 text-xs text-gray-400">ชิ้น</p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-lg sm:h-11 sm:w-11 sm:rounded-xl sm:text-xl">
              📦
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500 sm:text-sm">
                มูลค่าการจัดซื้อ
              </p>
              <p className="mt-2 break-all text-2xl font-bold text-green-600 sm:text-3xl">
                ฿{totalCost.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-gray-400">บาท</p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-lg sm:h-11 sm:w-11 sm:rounded-xl sm:text-xl">
              💰
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="mb-4 rounded-xl border border-gray-100 bg-white p-3 shadow-sm sm:mb-5 sm:rounded-2xl sm:p-4">
        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาเลขที่ใบรับสินค้า / Supplier"
            className="!h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 pr-10 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white sm:rounded-xl sm:px-4"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 sm:right-4">
            🔍
          </span>
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm md:block md:rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] table-fixed">
            <colgroup>
              <col className="w-[17%]" />
              <col className="w-[29%]" />
              <col className="w-[14%]" />
              <col className="w-[12%]" />
              <col className="w-[15%]" />
              <col className="w-[13%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 lg:px-5">
                  เลขที่ใบรับสินค้า
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 lg:px-4">
                  Supplier
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 lg:px-4">
                  วันที่
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 lg:px-4">
                  จำนวน
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500 lg:px-4">
                  มูลค่า
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 lg:px-4">
                  รายละเอียด
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length > 0 ? (
                filteredPurchases.map((purchase) => (
                  <tr
                    key={purchase.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-4 align-middle lg:px-5">
                      <span className="inline-flex max-w-full break-all rounded-md bg-gray-100 px-2.5 py-1.5 font-mono text-xs font-semibold text-gray-700">
                        {purchase.invoiceNumber}
                      </span>
                    </td>
                    <td className="px-3 py-4 align-middle lg:px-4">
                      <p className="break-words text-sm font-semibold leading-5 text-gray-800">
                        {purchase.supplier}
                      </p>
                    </td>
                    <td className="px-3 py-4 text-center align-middle lg:px-4">
                      <span className="text-sm text-gray-600">
                        {formatDate(purchase.date)}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-center align-middle lg:px-4">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-gray-800">
                          {purchase.totalItems}
                        </span>
                        <span className="text-xs text-gray-400">ชิ้น</span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-right align-middle lg:px-4">
                      <span className="text-sm font-bold text-green-600">
                        ฿{Number(purchase.totalCost).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-center align-middle lg:px-4">
                      <button
                        onClick={() => viewItems(purchase)}
                        className="!min-h-0 h-8 rounded-md border border-blue-200 bg-blue-50 px-3 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
                      >
                        👁️ ดูสินค้า
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-sm text-gray-400"
                  >
                    ยังไม่มีประวัติการรับสินค้า
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARDS */}
      <div className="space-y-3 md:hidden">
        {filteredPurchases.length > 0 ? (
          filteredPurchases.map((purchase) => (
            <div
              key={purchase.id}
              className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
            >
              <div className="border-b border-gray-100 p-3 sm:p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="mb-1.5 text-xs text-gray-400">
                      เลขที่ใบรับสินค้า
                    </p>
                    <span className="inline-flex max-w-full break-all rounded-md bg-gray-100 px-2.5 py-1.5 font-mono text-xs font-semibold text-gray-700">
                      {purchase.invoiceNumber}
                    </span>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-gray-400">วันที่</p>
                    <p className="mt-1 text-xs font-medium text-gray-700 sm:text-sm">
                      {formatDate(purchase.date)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-100 p-3 sm:p-4">
                <p className="text-xs text-gray-400">Supplier</p>
                <p className="mt-1 break-words text-sm font-semibold leading-5 text-gray-800">
                  {purchase.supplier}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-px bg-gray-100">
                <div className="bg-white p-3 sm:p-4">
                  <p className="text-xs text-gray-400">จำนวนสินค้า</p>
                  <p className="mt-1 text-base font-bold text-gray-800 sm:text-lg">
                    {purchase.totalItems}
                    <span className="ml-1 text-xs font-normal text-gray-400">
                      ชิ้น
                    </span>
                  </p>
                </div>
                <div className="bg-white p-3 sm:p-4">
                  <p className="text-xs text-gray-400">มูลค่ารวม</p>
                  <p className="mt-1 break-all text-base font-bold text-green-600 sm:text-lg">
                    ฿{Number(purchase.totalCost).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 p-3 sm:p-4">
                <button
                  onClick={() => viewItems(purchase)}
                  className="!min-h-0 h-9 w-full rounded-lg border border-blue-200 bg-blue-50 px-4 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                >
                  👁️ ดูรายการสินค้า
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-gray-100 bg-white px-5 py-12 text-center text-sm text-gray-400 shadow-sm">
            ยังไม่มีประวัติการรับสินค้า
          </div>
        )}
      </div>

      {/* RECEIVE MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
              <div className="min-w-0">
                <h2 className="text-lg font-bold leading-tight text-gray-800 sm:text-xl">
                  🚚 รับสินค้าเข้า
                </h2>
                <p className="mt-0.5 text-xs text-gray-400">
                  บันทึกข้อมูลสินค้าและเพิ่มจำนวนเข้าสู่สต๊อก
                </p>
              </div>
              <button
                onClick={closeForm}
                className="!min-h-0 h-8 w-8 shrink-0 rounded-lg p-0 text-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="overflow-y-auto p-4 sm:p-6">
              {/* BASIC INFO */}
              <div className="mb-5">
                <h3 className="mb-3 text-sm font-bold text-gray-800">
                  ข้อมูลการรับสินค้า
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                      Supplier
                    </label>
                    <select
                      value={selectedSupplier}
                      onChange={(e) => setSelectedSupplier(e.target.value)}
                      className="!h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500"
                    >
                      <option value="">-- เลือก Supplier --</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                      เลขที่ใบรับสินค้า
                    </label>
                    <input
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      placeholder="เช่น PO-2026-001"
                      className="!h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none transition focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                      วันที่รับสินค้า
                    </label>
                    <input
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="!h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none transition focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* ADD PRODUCT */}
              <div className="mb-5 rounded-2xl bg-gray-50 p-4">
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-gray-800">เพิ่มสินค้า</h3>
                  <p className="mt-0.5 text-xs text-gray-400">
                    เลือกสินค้า กรอกจำนวน และราคาทุนต่อชิ้น
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12">
                  <div className="sm:col-span-5">
                    <select
                      value={selectedProduct}
                      onChange={(e) => {
                        const prodId = e.target.value;
                        setSelectedProduct(prodId);
                        const prod = stock.find((p) => String(p.id) === String(prodId));
                        if (prod && prod.cost !== undefined) {
                          setCost(prod.cost);
                        }
                      }}
                      className="!h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                      disabled={loadingProducts}
                    >
                      <option value="">
                        {loadingProducts
                          ? "กำลังโหลด..."
                          : "-- เลือกสินค้า --"}
                      </option>
                      {stock.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.barcode || product.id} - {product.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="จำนวน"
                      className="!h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      placeholder="ราคาทุน/ชิ้น"
                      className="!h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <button
                      onClick={addItem}
                      className="!min-h-0 h-10 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      ＋
                    </button>
                  </div>
                </div>
              </div>

              {/* ITEMS TABLE */}
              {items.length > 0 ? (
                <div className="mb-2">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-800">
                      รายการสินค้า ({items.length})
                    </h3>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500">
                          <tr>
                            <th className="px-3 py-2.5 font-semibold">สินค้า</th>
                            <th className="px-3 py-2.5 text-center font-semibold">จำนวน</th>
                            <th className="px-3 py-2.5 text-right font-semibold">ราคาทุน</th>
                            <th className="px-3 py-2.5 text-right font-semibold">รวม</th>
                            <th className="w-10 px-2 py-2.5"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {items.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50/50">
                              <td className="px-3 py-2.5">
                                <p className="font-semibold text-gray-800">{item.name}</p>
                                <p className="text-xs font-mono text-gray-400">{item.barcode}</p>
                              </td>
                              <td className="px-3 py-2.5 text-center text-gray-700">
                                {item.quantity}
                              </td>
                              <td className="px-3 py-2.5 text-right text-gray-700">
                                ฿{item.cost.toLocaleString()}
                              </td>
                              <td className="px-3 py-2.5 text-right font-bold text-gray-800">
                                ฿{item.total.toLocaleString()}
                              </td>
                              <td className="px-2 py-2.5 text-center">
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="!min-h-0 h-7 w-7 rounded-lg p-0 text-red-500 hover:bg-red-50"
                                >
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-xl bg-gray-50 p-3">
                    <span className="text-sm font-semibold text-gray-600">
                      รวมทั้งสิ้น
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      ฿{currentFormTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                  <div className="text-2xl">📦</div>
                  <p className="mt-2 text-xs font-medium text-gray-600">
                    ยังไม่มีสินค้าในรายการ
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    เลือกสินค้าแล้วกดปุ่ม ＋ เพื่อเพิ่มรายการ
                  </p>
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-3">
              <button
                onClick={closeForm}
                className="!min-h-0 h-9 rounded-xl border border-gray-200 bg-white px-4 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
              >
                ยกเลิก
              </button>
              <button
                onClick={savePurchase}
                className="!min-h-0 h-9 rounded-xl bg-green-600 px-4 text-xs font-semibold text-white transition hover:bg-green-700"
              >
                💾 ยืนยันรับสินค้า
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
