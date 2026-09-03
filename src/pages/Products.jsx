import { useEffect, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const API_URL = `${API_BASE}/api/products`;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState({
    name: "",
    barcode: "",
    price: "",
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
  // ADD PRODUCT
  // ======================================

  const openAddForm = () => {
    setEditingProduct(null);

    setForm({
      name: "",
      barcode: "",
      price: "",
      stock: "",
      category: "",
    });

    setShowForm(true);
  };

  // ======================================
  // EDIT PRODUCT
  // ======================================

  const openEditForm = (product) => {
    setEditingProduct(product);

    setForm({
      name: product.name || "",
      barcode: product.barcode || "",
      price: product.price ?? "",
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

    setForm({
      name: "",
      barcode: "",
      price: "",
      stock: "",
      category: "",
    });
  };

  // ======================================
  // SAVE PRODUCT
  // ======================================

  const saveProduct = async () => {
    const name = form.name.trim();
    const barcode = form.barcode.trim();
    const price = Number(form.price);
    const stock = Number(form.stock || 0);

    if (!name) {
      alert("กรุณากรอกชื่อสินค้า");
      return;
    }

    if (!barcode) {
      alert("กรุณากรอก Barcode");
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
      console.error("SAVE PRODUCT ERROR:", err);

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
      console.error("DELETE PRODUCT ERROR:", err);

      alert(
        `ไม่สามารถเชื่อมต่อ Backend ได้\n${err.message}`,
      );
    }
  };

  // ======================================
  // FILTER
  // ======================================

  const filteredProducts = products.filter(
    (product) => {
      const keyword = search
        .toLowerCase()
        .trim();

      if (!keyword) {
        return true;
      }

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
      Number(product.stock || 0) <= 5,
  ).length;

  // ======================================
  // UI
  // ======================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-5 lg:p-8">

      {/* ==================================
          HEADER
      ================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 sm:mb-6">

        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            📦 สินค้า
          </h1>

          <p className="text-sm sm:text-base text-slate-500 mt-1">
            จัดการสินค้าและสต๊อก
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-bold transition"
        >
          ＋ เพิ่มสินค้า
        </button>

      </div>

      {/* ==================================
          ERROR
      ================================== */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-5 sm:mb-6">

          <p className="font-bold">
            โหลดข้อมูลสินค้าไม่สำเร็จ
          </p>

          <p className="text-sm mt-1 break-words">
            {error}
          </p>

          <button
            onClick={loadProducts}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold"
          >
            🔄 ลองใหม่
          </button>

        </div>
      )}

      {/* ==================================
          SUMMARY
      ================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">

        {/* TOTAL PRODUCTS */}

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5">

          <p className="text-sm sm:text-base text-slate-500">
            สินค้าทั้งหมด
          </p>

          <p className="text-2xl sm:text-3xl font-bold mt-2">
            {totalProducts}
          </p>

        </div>

        {/* TOTAL STOCK */}

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5">

          <p className="text-sm sm:text-base text-slate-500">
            Stock รวม
          </p>

          <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">
            {totalStock.toLocaleString(
              "th-TH",
            )}
          </p>

        </div>

        {/* LOW STOCK */}

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5">

          <p className="text-sm sm:text-base text-slate-500">
            สินค้าใกล้หมด
          </p>

          <p className="text-2xl sm:text-3xl font-bold text-red-600 mt-2">
            {lowStock}
          </p>

        </div>

      </div>

      {/* ==================================
          SEARCH
      ================================== */}

      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 mb-5 sm:mb-6">

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="🔍 ค้นหาชื่อสินค้า / Barcode / หมวดหมู่"
          className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />

        {search && (
          <div className="text-sm text-slate-500 mt-2">
            พบ {filteredProducts.length} รายการ
          </div>
        )}

      </div>

      {/* ==================================
          TABLE
      ================================== */}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        <div className="p-4 sm:p-5 border-b">

          <div className="flex items-center justify-between gap-3">

            <h2 className="font-bold text-lg">
              รายการสินค้า
            </h2>

            <span className="text-sm text-slate-400">
              {filteredProducts.length} รายการ
            </span>

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[850px]">

            <thead className="bg-slate-100">

              <tr>

                <th className="text-left p-4 whitespace-nowrap">
                  รหัส
                </th>

                <th className="text-left p-4 whitespace-nowrap">
                  สินค้า
                </th>

                <th className="text-left p-4 whitespace-nowrap">
                  Barcode
                </th>

                <th className="text-left p-4 whitespace-nowrap">
                  หมวดหมู่
                </th>

                <th className="text-right p-4 whitespace-nowrap">
                  ราคา
                </th>

                <th className="text-center p-4 whitespace-nowrap">
                  Stock
                </th>

                <th className="text-center p-4 whitespace-nowrap">
                  จัดการ
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="7"
                    className="text-center p-10 text-slate-500"
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

              ) : filteredProducts.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="text-center p-10 text-slate-400"
                  >
                    <div className="text-3xl mb-2">
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
                      className="border-t hover:bg-slate-50 transition"
                    >

                      {/* ID */}

                      <td className="p-4 font-bold whitespace-nowrap">
                        {product.id}
                      </td>

                      {/* NAME */}

                      <td className="p-4 font-medium max-w-[220px]">
                        <div
                          className="truncate"
                          title={product.name}
                        >
                          {product.name}
                        </div>
                      </td>

                      {/* BARCODE */}

                      <td className="p-4 whitespace-nowrap">
                        {product.barcode}
                      </td>

                      {/* CATEGORY */}

                      <td className="p-4">
                        <span className="inline-block max-w-[160px] truncate">
                          {product.category || "-"}
                        </span>
                      </td>

                      {/* PRICE */}

                      <td className="p-4 text-right font-bold whitespace-nowrap">
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
                          className={`inline-block min-w-[55px] px-3 py-1 rounded-full text-sm font-bold ${
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

                        <div className="flex justify-center gap-2">

                          <button
                            onClick={() =>
                              openEditForm(
                                product,
                              )
                            }
                            className="bg-blue-100 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-200 transition"
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
                            className="bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition"
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

      {/* ==================================
          ADD / EDIT MODAL
      ================================== */}

      {showForm && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">

          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto p-4 sm:p-6 lg:p-7 shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6">

              <h2 className="text-xl sm:text-2xl font-bold">
                {editingProduct
                  ? "✏️ แก้ไขสินค้า"
                  : "➕ เพิ่มสินค้า"}
              </h2>

              <button
                onClick={closeForm}
                className="flex-shrink-0 w-9 h-9 rounded-lg text-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
              >
                ✕
              </button>

            </div>

            {/* NAME */}

            <div className="mb-4">

              <label className="block font-medium mb-2">
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
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* BARCODE */}

            <div className="mb-4">

              <label className="block font-medium mb-2">
                Barcode
              </label>

              <input
                value={form.barcode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    barcode:
                      e.target.value.replace(
                        /\D/g,
                        "",
                      ),
                  })
                }
                placeholder="เช่น 8851234567890"
                inputMode="numeric"
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* PRICE */}

            <div className="mb-4">

              <label className="block font-medium mb-2">
                ราคา (บาท)
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
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* STOCK */}

            <div className="mb-4">

              <label className="block font-medium mb-2">
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
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* CATEGORY */}

            <div className="mb-6">

              <label className="block font-medium mb-2">
                หมวดหมู่
              </label>

              <input
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value,
                  })
                }
                placeholder="เช่น เครื่องดื่ม"
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* BUTTONS */}

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">

              <button
                onClick={closeForm}
                className="w-full sm:flex-1 border border-slate-300 rounded-lg py-3 hover:bg-slate-50 font-medium transition"
              >
                ยกเลิก
              </button>

              <button
                onClick={saveProduct}
                className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-bold transition"
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