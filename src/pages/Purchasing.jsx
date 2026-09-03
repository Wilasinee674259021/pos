import { useEffect, useState } from "react";

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

  const [stock, setStock] = useState(() => {
    const saved = localStorage.getItem("pos_stock");
    return saved ? JSON.parse(saved) : [];
  });

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

  useEffect(() => {
    localStorage.setItem("pos_purchases", JSON.stringify(purchases));
  }, [purchases]);

  /* =========================
      SUMMARY
  ========================= */

  const totalPurchases = purchases.length;

  const totalItems = purchases.reduce(
    (sum, purchase) => sum + Number(purchase.totalItems),
    0
  );

  const totalCost = purchases.reduce(
    (sum, purchase) => sum + Number(purchase.totalCost),
    0
  );

  const currentFormTotal = items.reduce(
    (sum, item) => sum + Number(item.total),
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
      (item) => item.id === Number(selectedProduct)
    );

    if (!product) {
      alert("ไม่พบสินค้านี้ในสต๊อก");
      return;
    }

    const newItem = {
      id: Date.now(),
      productId: product.id,
      code: product.code,
      name: product.name,
      quantity: Number(quantity),
      cost: Number(cost),
      total: Number(quantity) * Number(cost),
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

  const savePurchase = () => {
    if (!selectedSupplier) {
      alert("กรุณาเลือก Supplier");
      return;
    }

    if (!invoiceNumber) {
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
        UPDATE STOCK
    ========================= */

    const updatedStock = stock.map((product) => {
      const purchaseItems = items.filter(
        (item) => item.productId === product.id
      );

      if (purchaseItems.length === 0) {
        return product;
      }

      const addedQuantity = purchaseItems.reduce(
        (sum, item) => sum + Number(item.quantity),
        0
      );

      return {
        ...product,
        stock: Number(product.stock) + addedQuantity,
      };
    });

    setStock(updatedStock);

    localStorage.setItem(
      "pos_stock",
      JSON.stringify(updatedStock)
    );

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

    alert(
      "บันทึกการรับสินค้าเรียบร้อย\nสินค้าได้ถูกเพิ่มเข้าสู่สต๊อกแล้ว"
    );

    closeForm();
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
      purchase.invoiceNumber
        .toLowerCase()
        .includes(keyword) ||
      purchase.supplier
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
            `${item.code || ""} ${item.name} × ${item.quantity} ชิ้น`
        )
        .join("\n")
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-5 md:p-6 lg:p-8">
      {/* =========================
          HEADER
      ========================= */}

      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
              🚚 จัดซื้อ / รับสินค้า
            </h1>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              จัดการการสั่งซื้อและรับสินค้าเข้าสต๊อก
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
          >
            ＋ รับสินค้าเข้า
          </button>
        </div>
      </div>

      {/* =========================
          SUMMARY
      ========================= */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* TOTAL PURCHASE */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                รายการรับสินค้าทั้งหมด
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-800">
                {totalPurchases}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                รายการ
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
              🚚
            </div>
          </div>
        </div>

        {/* TOTAL ITEMS */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                จำนวนสินค้าที่รับเข้า
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-600">
                {totalItems}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                ชิ้น
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
              📦
            </div>
          </div>
        </div>

        {/* TOTAL COST */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-500">
                มูลค่าการจัดซื้อ
              </p>

              <p className="mt-2 break-all text-2xl font-bold text-green-600 sm:text-3xl">
                ฿{totalCost.toLocaleString()}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                บาท
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-xl">
              💰
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          SEARCH
      ========================= */}

      <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาเลขที่ใบรับสินค้า / Supplier"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-11 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white"
          />

          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
        </div>
      </div>

      {/* =========================
          DESKTOP TABLE
      ========================= */}

      <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] table-fixed">
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
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500">
                  เลขที่ใบรับสินค้า
                </th>

                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500">
                  Supplier
                </th>

                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500">
                  วันที่
                </th>

                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500">
                  จำนวน
                </th>

                <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500">
                  มูลค่า
                </th>

                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500">
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
                    {/* INVOICE */}
                    <td className="px-5 py-5 align-middle">
                      <span className="inline-flex rounded-lg bg-gray-100 px-3 py-2 font-mono text-xs font-semibold text-gray-700">
                        {purchase.invoiceNumber}
                      </span>
                    </td>

                    {/* SUPPLIER */}
                    <td className="px-4 py-5 align-middle">
                      <p className="break-words text-sm font-semibold leading-6 text-gray-800">
                        {purchase.supplier}
                      </p>
                    </td>

                    {/* DATE */}
                    <td className="px-4 py-5 text-center align-middle">
                      <span className="text-sm text-gray-600">
                        {formatDate(purchase.date)}
                      </span>
                    </td>

                    {/* ITEMS */}
                    <td className="px-4 py-5 text-center align-middle">
                      <div className="flex flex-col items-center">
                        <span className="text-base font-bold text-gray-800">
                          {purchase.totalItems}
                        </span>

                        <span className="text-xs text-gray-400">
                          ชิ้น
                        </span>
                      </div>
                    </td>

                    {/* COST */}
                    <td className="px-4 py-5 text-right align-middle">
                      <span className="text-base font-bold text-green-600">
                        ฿{Number(purchase.totalCost).toLocaleString()}
                      </span>
                    </td>

                    {/* DETAIL */}
                    <td className="px-4 py-5 text-center align-middle">
                      <button
                        onClick={() => viewItems(purchase)}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
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

      {/* =========================
          MOBILE CARDS
      ========================= */}

      <div className="space-y-4 md:hidden">
        {filteredPurchases.length > 0 ? (
          filteredPurchases.map((purchase) => (
            <div
              key={purchase.id}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              {/* CARD HEADER */}
              <div className="border-b border-gray-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="mb-2 text-xs text-gray-400">
                      เลขที่ใบรับสินค้า
                    </p>

                    <span className="inline-flex max-w-full break-all rounded-lg bg-gray-100 px-3 py-2 font-mono text-xs font-semibold text-gray-700">
                      {purchase.invoiceNumber}
                    </span>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-xs text-gray-400">
                      วันที่
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-700">
                      {formatDate(purchase.date)}
                    </p>
                  </div>
                </div>
              </div>

              {/* SUPPLIER */}
              <div className="border-b border-gray-100 p-4">
                <p className="text-xs text-gray-400">
                  Supplier
                </p>

                <p className="mt-1 break-words text-sm font-semibold leading-6 text-gray-800">
                  {purchase.supplier}
                </p>
              </div>

              {/* INFO */}
              <div className="grid grid-cols-2 gap-px bg-gray-100">
                <div className="bg-white p-4">
                  <p className="text-xs text-gray-400">
                    จำนวนสินค้า
                  </p>

                  <p className="mt-1 text-lg font-bold text-gray-800">
                    {purchase.totalItems}
                    <span className="ml-1 text-xs font-normal text-gray-400">
                      ชิ้น
                    </span>
                  </p>
                </div>

                <div className="bg-white p-4">
                  <p className="text-xs text-gray-400">
                    มูลค่ารวม
                  </p>

                  <p className="mt-1 break-all text-lg font-bold text-green-600">
                    ฿{Number(purchase.totalCost).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* ACTION */}
              <div className="border-t border-gray-100 p-4">
                <button
                  onClick={() => viewItems(purchase)}
                  className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                >
                  👁️ ดูรายการสินค้า
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white px-5 py-12 text-center text-sm text-gray-400 shadow-sm">
            ยังไม่มีประวัติการรับสินค้า
          </div>
        )}
      </div>

      {/* =========================
          RECEIVE MODAL
      ========================= */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-gray-800 sm:text-xl">
                  🚚 รับสินค้าเข้า
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  บันทึกข้อมูลสินค้าและเพิ่มจำนวนเข้าสู่สต๊อก
                </p>
              </div>

              <button
                onClick={closeForm}
                className="rounded-lg p-2 text-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="overflow-y-auto p-4 sm:p-6">
              {/* =========================
                  BASIC INFO
              ========================= */}

              <div className="mb-6">
                <h3 className="mb-4 text-sm font-bold text-gray-800">
                  ข้อมูลการรับสินค้า
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* SUPPLIER */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Supplier
                    </label>

                    <select
                      value={selectedSupplier}
                      onChange={(e) =>
                        setSelectedSupplier(e.target.value)
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                    >
                      <option value="">
                        -- เลือก Supplier --
                      </option>

                      {suppliers.map((supplier) => (
                        <option
                          key={supplier.id}
                          value={supplier.id}
                        >
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* INVOICE */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      เลขที่ใบรับสินค้า
                    </label>

                    <input
                      value={invoiceNumber}
                      onChange={(e) =>
                        setInvoiceNumber(e.target.value)
                      }
                      placeholder="เช่น PO-2026-001"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                    />
                  </div>

                  {/* DATE */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      วันที่รับสินค้า
                    </label>

                    <input
                      type="date"
                      value={purchaseDate}
                      onChange={(e) =>
                        setPurchaseDate(e.target.value)
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* =========================
                  ADD PRODUCT
              ========================= */}

              <div className="mb-6 rounded-2xl bg-gray-50 p-4 sm:p-5">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-gray-800">
                    เพิ่มสินค้า
                  </h3>

                  <p className="mt-1 text-xs text-gray-400">
                    เลือกสินค้า กรอกจำนวน และราคาทุนต่อชิ้น
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                  {/* PRODUCT */}
                  <div className="md:col-span-5">
                    <label className="mb-2 block text-xs font-medium text-gray-500 md:hidden">
                      สินค้า
                    </label>

                    <select
                      value={selectedProduct}
                      onChange={(e) =>
                        setSelectedProduct(e.target.value)
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="">
                        -- เลือกสินค้า --
                      </option>

                      {stock.map((product) => (
                        <option
                          key={product.id}
                          value={product.id}
                        >
                          {product.code} - {product.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* QUANTITY */}
                  <div className="md:col-span-3">
                    <label className="mb-2 block text-xs font-medium text-gray-500 md:hidden">
                      จำนวน
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(e.target.value)
                      }
                      placeholder="จำนวน"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* COST */}
                  <div className="md:col-span-3">
                    <label className="mb-2 block text-xs font-medium text-gray-500 md:hidden">
                      ราคาทุน / ชิ้น
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={cost}
                      onChange={(e) =>
                        setCost(e.target.value)
                      }
                      placeholder="ราคาทุน / ชิ้น"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* ADD */}
                  <div className="md:col-span-1">
                    <button
                      onClick={addItem}
                      className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      ＋
                    </button>
                  </div>
                </div>
              </div>

              {/* =========================
                  ITEMS
              ========================= */}

              {items.length > 0 ? (
                <div className="mb-6">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">
                        รายการสินค้า
                      </h3>

                      <p className="mt-1 text-xs text-gray-400">
                        {items.length} รายการ
                      </p>
                    </div>
                  </div>

                  {/* DESKTOP ITEMS TABLE */}
                  <div className="hidden overflow-hidden rounded-xl border border-gray-200 md:block">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[700px]">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                              สินค้า
                            </th>

                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">
                              จำนวน
                            </th>

                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                              ราคาทุน
                            </th>

                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                              รวม
                            </th>

                            <th className="w-16 px-4 py-3"></th>
                          </tr>
                        </thead>

                        <tbody>
                          {items.map((item) => (
                            <tr
                              key={item.id}
                              className="border-t border-gray-100"
                            >
                              <td className="px-4 py-4">
                                <div>
                                  <p className="break-words text-sm font-semibold text-gray-800">
                                    {item.name}
                                  </p>

                                  <p className="mt-1 text-xs text-gray-400">
                                    {item.code}
                                  </p>
                                </div>
                              </td>

                              <td className="px-4 py-4 text-center text-sm text-gray-700">
                                {item.quantity}
                              </td>

                              <td className="px-4 py-4 text-right text-sm text-gray-700">
                                ฿{item.cost.toLocaleString()}
                              </td>

                              <td className="px-4 py-4 text-right text-sm font-bold text-gray-800">
                                ฿{item.total.toLocaleString()}
                              </td>

                              <td className="px-4 py-4 text-center">
                                <button
                                  onClick={() =>
                                    removeItem(item.id)
                                  }
                                  className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
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

                  {/* MOBILE ITEMS CARDS */}
                  <div className="space-y-3 md:hidden">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-gray-200 bg-white p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="break-words text-sm font-semibold leading-6 text-gray-800">
                              {item.name}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              {item.code}
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              removeItem(item.id)
                            }
                            className="shrink-0 rounded-lg p-2 text-red-500 hover:bg-red-50"
                          >
                            🗑️
                          </button>
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <div className="rounded-lg bg-gray-50 p-3">
                            <p className="text-xs text-gray-400">
                              จำนวน
                            </p>

                            <p className="mt-1 text-sm font-bold text-gray-800">
                              {item.quantity}
                            </p>
                          </div>

                          <div className="rounded-lg bg-gray-50 p-3">
                            <p className="text-xs text-gray-400">
                              ราคาทุน
                            </p>

                            <p className="mt-1 break-all text-sm font-bold text-gray-800">
                              ฿{item.cost.toLocaleString()}
                            </p>
                          </div>

                          <div className="rounded-lg bg-green-50 p-3">
                            <p className="text-xs text-gray-400">
                              รวม
                            </p>

                            <p className="mt-1 break-all text-sm font-bold text-green-600">
                              ฿{item.total.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* TOTAL */}
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 p-4">
                    <span className="text-sm font-semibold text-gray-600">
                      รวมทั้งสิ้น
                    </span>

                    <span className="break-all text-xl font-bold text-green-600">
                      ฿{currentFormTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mb-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-10 text-center">
                  <div className="text-3xl">📦</div>

                  <p className="mt-3 text-sm font-medium text-gray-600">
                    ยังไม่มีสินค้าในรายการ
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    เลือกสินค้าแล้วกดปุ่ม ＋ เพื่อเพิ่มรายการ
                  </p>
                </div>
              )}
            </div>

            {/* =========================
                MODAL FOOTER
            ========================= */}

            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 p-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                onClick={closeForm}
                className="w-full rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 sm:w-auto"
              >
                ยกเลิก
              </button>

              <button
                onClick={savePurchase}
                className="w-full rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 sm:w-auto"
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