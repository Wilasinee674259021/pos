import { useEffect, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const API_URL = `${API_BASE}/api/products`;

// ======================================
// GENERATE EAN-13 BARCODE
// ======================================

const generateBarcode = () => {
  // 885 = Thailand prefix
  let base = "885";

  // สุ่มเลขอีก 9 หลัก
  for (let i = 0; i < 9; i++) {
    base += Math.floor(Math.random() * 10);
  }

  // คำนวณ Check Digit ของ EAN-13
  const digits = base.split("").map(Number);

  let sum = 0;

  digits.forEach((digit, index) => {
    sum += index % 2 === 0 ? digit : digit * 3;
  });

  const checkDigit = (10 - (sum % 10)) % 10;

  return base + checkDigit;
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [costMode, setCostMode] = useState("manual");

  const [form, setForm] = useState({
    name: "",
    barcode: "",
    price: "",
    cost: "",
    purchaseTotal: "",
    purchaseQuantity: "",
    stock: "",
    category: "",
  });

  // ======================================
  // LOAD PRODUCTS
  // ======================================

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Loading products from:", API_URL);

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const text = await response.text();

      console.log("Products API response:", text);

      let result;

      try {
        result = JSON.parse(text);
      } catch {
        throw new Error("Backend ส่งข้อมูลไม่ใช่ JSON");
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "โหลดข้อมูลสินค้าไม่สำเร็จ",
        );
      }

      setProducts(
        Array.isArray(result.data)
          ? result.data
          : [],
      );
    } catch (err) {
      console.error("LOAD PRODUCTS ERROR:", err);

      setProducts([]);

      setError(
        err.message ||
          "ไม่สามารถโหลดข้อมูลสินค้าได้",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ======================================
  // ADD FORM
  // ======================================

  const openAddForm = () => {
    setEditingProduct(null);

    setCostMode("manual");

    setForm({
      name: "",
      barcode: generateBarcode(),
      price: "",
      cost: "",
      purchaseTotal: "",
      purchaseQuantity: "",
      stock: "",
      category: "",
    });

    setShowForm(true);
  };

  // ======================================
  // EDIT FORM
  // ======================================

  const openEditForm = (product) => {
    setEditingProduct(product);

    setCostMode("manual");

    setForm({
      name: product.name || "",
      barcode: product.barcode || "",
      price: product.price ?? "",
      cost: product.cost ?? "",
      purchaseTotal: "",
      purchaseQuantity: "",
      stock: product.stock ?? "",
      category: product.category || "",
    });

    setShowForm(true);
  };

  // ======================================
  // CLOSE FORM
  // ======================================

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setCostMode("manual");

    setForm({
      name: "",
      barcode: "",
      price: "",
      cost: "",
      purchaseTotal: "",
      purchaseQuantity: "",
      stock: "",
      category: "",
    });
  };

  // ======================================
  // CHANGE COST MODE
  // ======================================

  const changeCostMode = (mode) => {
    setCostMode(mode);

    if (mode === "manual") {
      setForm((prev) => ({
        ...prev,
        purchaseTotal: "",
        purchaseQuantity: "",
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        cost: "",
      }));
    }
  };

  // ======================================
  // CALCULATE COST
  // ======================================

  const calculatedCost =
    form.purchaseTotal !== "" &&
    form.purchaseQuantity !== "" &&
    Number(form.purchaseQuantity) > 0
      ? Number(form.purchaseTotal) /
        Number(form.purchaseQuantity)
      : 0;

  // ======================================
  // SAVE PRODUCT
  // ======================================

  const saveProduct = async () => {
    const name = form.name.trim();
    const barcode = form.barcode.trim();

    const price = Number(form.price);

    let cost;

    if (costMode === "calculate") {
      cost = calculatedCost;
    } else {
      cost = Number(
        form.cost === "" ? 0 : form.cost,
      );
    }

    const stock = Number(
      form.stock === "" ? 0 : form.stock,
    );

    if (!name) {
      alert("กรุณากรอกชื่อสินค้า");
      return;
    }

    if (!barcode) {
      alert("ไม่พบ Barcode กรุณาลองใหม่");
      return;
    }

    if (
      form.price === "" ||
      Number.isNaN(price) ||
      price < 0
    ) {
      alert("กรุณากรอกราคาสินค้าให้ถูกต้อง");
      return;
    }

    if (costMode === "calculate") {
      if (
        form.purchaseTotal === "" ||
        Number(form.purchaseTotal) < 0
      ) {
        alert("กรุณากรอกราคาซื้อรวมให้ถูกต้อง");
        return;
      }

      if (
        form.purchaseQuantity === "" ||
        Number(form.purchaseQuantity) <= 0
      ) {
        alert("กรุณากรอกจำนวนสินค้าที่ซื้อให้ถูกต้อง");
        return;
      }

      if (!Number.isFinite(calculatedCost)) {
        alert("ไม่สามารถคำนวณต้นทุนได้");
        return;
      }
    }

    if (
      Number.isNaN(cost) ||
      cost < 0
    ) {
      alert("กรุณากรอกราคาทุนให้ถูกต้อง");
      return;
    }

    if (cost > price) {
      alert("ราคาทุนไม่ควรมากกว่าราคาขาย");
      return;
    }

    if (
      Number.isNaN(stock) ||
      stock < 0 ||
      !Number.isInteger(stock)
    ) {
      alert("กรุณากรอก Stock เป็นจำนวนเต็ม");
      return;
    }

    try {
      const url = editingProduct
        ? `${API_URL}/${editingProduct.id}`
        : API_URL;

      const method = editingProduct
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          barcode,
          price,
          cost,
          stock,
          category: form.category.trim(),
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
        alert(
          result.message ||
            "บันทึกสินค้าไม่สำเร็จ",
        );
        return;
      }

      alert(
        editingProduct
          ? "แก้ไขสินค้าเรียบร้อย"
          : "เพิ่มสินค้าเรียบร้อย",
      );

      closeForm();

      await loadProducts();
    } catch (err) {
      console.error(
        "SAVE PRODUCT ERROR:",
        err,
      );

      alert(
        `ไม่สามารถเชื่อมต่อ Backend ได้\n${err.message}`,
      );
    }
  };

  // ======================================
  // DELETE PRODUCT
  // ======================================

  const deleteProduct = async (id) => {
    const confirmed = window.confirm(
      "ต้องการลบสินค้านี้ใช่หรือไม่?",
    );

    if (!confirmed) return;

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
        alert(
          result.message ||
            "ลบสินค้าไม่สำเร็จ",
        );
        return;
      }

      alert("ลบสินค้าเรียบร้อย");

      await loadProducts();
    } catch (err) {
      console.error(
        "DELETE PRODUCT ERROR:",
        err,
      );

      alert(
        `ไม่สามารถเชื่อมต่อ Backend ได้\n${err.message}`,
      );
    }
  };

  // ======================================
  // SEARCH
  // ======================================

  const filteredProducts =
    products.filter((product) => {
      const keyword =
        search.toLowerCase().trim();

      if (!keyword) return true;

      return (
        String(product.name || "")
          .toLowerCase()
          .includes(keyword) ||
        String(product.barcode || "")
          .toLowerCase()
          .includes(keyword) ||
        String(product.category || "")
          .toLowerCase()
          .includes(keyword)
      );
    });

  // ======================================
  // SUMMARY
  // ======================================

  const totalProducts =
    products.length;

  const totalStock =
    products.reduce(
      (sum, product) =>
        sum +
        Number(product.stock || 0),
      0,
    );

  const lowStock =
    products.filter(
      (product) =>
        Number(product.stock || 0) <= 5,
    ).length;

  // ======================================
  // RENDER
  // ======================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-5 lg:p-8">
      {/* HEADER */}

      <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            📦 สินค้า
          </h1>

          <p className="mt-1 text-sm text-slate-500 sm:text-base">
            จัดการสินค้า ราคาทุน ราคาขาย และสต๊อก
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="h-10 w-full rounded-lg bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700 sm:w-auto"
        >
          ＋ เพิ่มสินค้า
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 sm:mb-6">
          <p className="font-bold">
            โหลดข้อมูลสินค้าไม่สำเร็จ
          </p>

          <p className="mt-1 break-words text-sm">
            {error}
          </p>

          <button
            onClick={loadProducts}
            className="mt-3 h-9 rounded-lg bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700"
          >
            🔄 ลองใหม่
          </button>
        </div>
      )}

      {/* SUMMARY */}

      <div className="mb-5 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-slate-500 sm:text-base">
            สินค้าทั้งหมด
          </p>

          <p className="mt-2 text-2xl font-bold sm:text-3xl">
            {totalProducts}
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-slate-500 sm:text-base">
            Stock รวม
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600 sm:text-3xl">
            {totalStock.toLocaleString("th-TH")}
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-slate-500 sm:text-base">
            สินค้าใกล้หมด
          </p>

          <p className="mt-2 text-2xl font-bold text-red-600 sm:text-3xl">
            {lowStock}
          </p>
        </div>
      </div>

      {/* SEARCH */}

      <div className="mb-5 rounded-xl bg-white p-4 shadow-sm sm:mb-6 sm:p-5">
        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="🔍 ค้นหาชื่อสินค้า / Barcode / หมวดหมู่"
          className="h-10 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        />

        {search && (
          <div className="mt-2 text-sm text-slate-500">
            พบ {filteredProducts.length} รายการ
          </div>
        )}
      </div>

      {/* PRODUCT TABLE */}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="border-b p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">
              รายการสินค้า
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
                  ราคาทุน
                </th>

                <th className="whitespace-nowrap p-4 text-right">
                  ราคาขาย
                </th>

                <th className="whitespace-nowrap p-4 text-center">
                  Stock
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
                        กำลังโหลดข้อมูลสินค้า...
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length ===
                0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="p-10 text-center text-slate-400"
                  >
                    <div className="mb-2 text-3xl">
                      📦
                    </div>

                    <div>
                      {search
                        ? "ไม่พบสินค้าที่ค้นหา"
                        : "ยังไม่มีสินค้า"}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(
                  (product) => (
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

                      <td className="whitespace-nowrap p-4 font-mono text-sm">
                        {product.barcode}
                      </td>

                      {/* CATEGORY */}

                      <td className="p-4">
                        <span className="inline-block max-w-[160px] truncate">
                          {product.category ||
                            "-"}
                        </span>
                      </td>

                      {/* COST */}

                      <td className="whitespace-nowrap p-4 text-right font-bold text-orange-600">
                        ฿
                        {Number(
                          product.cost || 0,
                        ).toLocaleString(
                          "th-TH",
                          {
                            minimumFractionDigits: 2,
                          },
                        )}
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
                            Number(
                              product.stock || 0,
                            ) <= 5
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>

                      {/* ACTION */}

                      <td className="p-4">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() =>
                              openEditForm(
                                product,
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 text-sm text-blue-600 transition hover:bg-blue-200"
                            title="แก้ไข"
                          >
                            ✏️
                          </button>

                          <button
                            onClick={() =>
                              deleteProduct(
                                product.id,
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-md bg-red-100 text-sm text-red-600 transition hover:bg-red-200"
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

      {/* MODAL */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <div className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:p-6 lg:p-7">
            {/* MODAL HEADER */}

            <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
              <h2 className="text-xl font-bold sm:text-2xl">
                {editingProduct
                  ? "✏️ แก้ไขสินค้า"
                  : "➕ เพิ่มสินค้า"}
              </h2>

              <button
                onClick={closeForm}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            {/* NAME */}

            <div className="mb-4">
              <label className="mb-2 block font-medium">
                ชื่อสินค้า
              </label>

              <input
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                placeholder="เช่น น้ำดื่ม 600ml"
                className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* BARCODE */}

            <div className="mb-4">
              <label className="mb-2 block font-medium">
                Barcode
              </label>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    value={form.barcode}
                    readOnly
                    className="w-full rounded-lg border border-slate-200 bg-slate-100 p-3 pr-12 font-mono text-sm text-slate-700 outline-none"
                  />

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
                    🔒
                  </span>
                </div>

                {!editingProduct && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        barcode:
                          generateBarcode(),
                      })
                    }
                    className="shrink-0 rounded-lg border border-blue-200 bg-blue-50 px-3 text-sm font-bold text-blue-600 transition hover:bg-blue-100"
                    title="สร้าง Barcode ใหม่"
                  >
                    🔄
                  </button>
                )}
              </div>

              <p className="mt-1 text-xs text-slate-500">
                ระบบสร้าง Barcode อัตโนมัติ
              </p>
            </div>

            {/* COST MODE */}

            <div className="mb-4">
              <label className="mb-2 block font-medium">
                วิธีระบุต้นทุน
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    changeCostMode("manual")
                  }
                  className={`rounded-lg border p-3 text-sm font-semibold transition ${
                    costMode === "manual"
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  ✏️ กรอกต้นทุนเอง
                </button>

                <button
                  type="button"
                  onClick={() =>
                    changeCostMode("calculate")
                  }
                  className={`rounded-lg border p-3 text-sm font-semibold transition ${
                    costMode === "calculate"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  🧮 คำนวณต้นทุน
                </button>
              </div>
            </div>

            {/* MANUAL COST */}

            {costMode === "manual" && (
              <div className="mb-4">
                <label className="mb-2 block font-medium">
                  ราคาทุนต่อชิ้น (บาท)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.cost}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      cost: e.target.value,
                    })
                  }
                  placeholder="0.00"
                  className="w-full rounded-lg border border-orange-300 p-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                />

                <p className="mt-1 text-xs text-slate-500">
                  ราคาที่ร้านซื้อสินค้ามาต่อ 1 ชิ้น
                </p>
              </div>
            )}

            {/* CALCULATE COST */}

            {costMode === "calculate" && (
              <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="mb-3">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    ราคาซื้อรวม (บาท)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.purchaseTotal}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        purchaseTotal:
                          e.target.value,
                      })
                    }
                    placeholder="เช่น 500"
                    className="w-full rounded-lg border border-slate-300 bg-white p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-3">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    จำนวนที่ซื้อ (ชิ้น)
                  </label>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.purchaseQuantity}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        purchaseQuantity:
                          e.target.value,
                      })
                    }
                    placeholder="เช่น 50"
                    className="w-full rounded-lg border border-slate-300 bg-white p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="rounded-lg bg-white p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-500">
                      ต้นทุนต่อชิ้น
                    </span>

                    <span className="text-lg font-bold text-blue-600">
                      ฿
                      {calculatedCost.toLocaleString(
                        "th-TH",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    ราคาซื้อรวม ÷ จำนวนที่ซื้อ
                  </p>
                </div>
              </div>
            )}

            {/* PRICE */}

            <div className="mb-4">
              <label className="mb-2 block font-medium">
                ราคาขาย (บาท)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price: e.target.value,
                  })
                }
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* STOCK */}

            <div className="mb-4">
              <label className="mb-2 block font-medium">
                จำนวน Stock
              </label>

              <input
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(e) =>
                  setForm({
                    ...form,
                    stock: e.target.value,
                  })
                }
                placeholder="0"
                className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* CATEGORY */}

            <div className="mb-6">
              <label className="mb-2 block font-medium">
                หมวดหมู่
              </label>

              <input
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category:
                      e.target.value,
                  })
                }
                placeholder="เช่น เครื่องดื่ม"
                className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* BUTTONS */}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
              <button
                onClick={closeForm}
                className="h-10 w-full rounded-lg border border-slate-300 font-medium transition hover:bg-slate-50 sm:flex-1"
              >
                ยกเลิก
              </button>

              <button
                onClick={saveProduct}
                className="h-10 w-full rounded-lg bg-blue-600 font-bold text-white transition hover:bg-blue-700 sm:flex-1"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}