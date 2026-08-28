import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/products";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

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

      const response = await fetch(API_URL);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message);
      }

      setProducts(result.data || []);
    } catch (error) {
      console.error("LOAD PRODUCTS ERROR:", error);
      alert("ไม่สามารถโหลดข้อมูลสินค้าได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ======================================
  // OPEN ADD FORM
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
  // OPEN EDIT FORM
  // ======================================

  const openEditForm = (product) => {
    setEditingProduct(product);

    setForm({
      name: product.name || "",
      barcode: product.barcode || "",
      price: product.price || "",
      stock: product.stock ?? "",
      category: product.category || "",
    });

    setShowForm(true);
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

    if (form.price === "" || price < 0 || Number.isNaN(price)) {
      alert("กรุณากรอกราคาสินค้าให้ถูกต้อง");
      return;
    }

    if (stock < 0 || !Number.isInteger(stock) || Number.isNaN(stock)) {
      alert("กรุณากรอกจำนวน Stock เป็นจำนวนเต็ม");
      return;
    }

    try {
      const url = editingProduct ? `${API_URL}/${editingProduct.id}` : API_URL;

      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          barcode,
          price,
          stock,
          category: form.category.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(result.message || "บันทึกสินค้าไม่สำเร็จ");
        return;
      }

      alert(editingProduct ? "แก้ไขสินค้าเรียบร้อย" : "เพิ่มสินค้าเรียบร้อย");

      setShowForm(false);
      setEditingProduct(null);

      setForm({
        name: "",
        barcode: "",
        price: "",
        stock: "",
        category: "",
      });

      await loadProducts();
    } catch (error) {
      console.error("SAVE PRODUCT ERROR:", error);
      alert("ไม่สามารถเชื่อมต่อ Backend ได้");
    }
  };

  // ======================================
  // DELETE PRODUCT
  // ======================================

  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm("ต้องการลบสินค้านี้ใช่หรือไม่?");

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(result.message || "ลบสินค้าไม่สำเร็จ");
        return;
      }

      alert("ลบสินค้าเรียบร้อย");

      await loadProducts();
    } catch (error) {
      console.error("DELETE PRODUCT ERROR:", error);
      alert("ไม่สามารถเชื่อมต่อ Backend ได้");
    }
  };

  // ======================================
  // FILTER PRODUCTS
  // ======================================

  const filteredProducts = products.filter((product) => {
    const keyword = search.toLowerCase();

    return (
      product.name?.toLowerCase().includes(keyword) ||
      product.barcode?.toLowerCase().includes(keyword) ||
      product.category?.toLowerCase().includes(keyword)
    );
  });

  // ======================================
  // SUMMARY
  // ======================================

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum, product) => sum + Number(product.stock || 0),
    0,
  );

  const lowStock = products.filter(
    (product) => Number(product.stock || 0) <= 5,
  ).length;

  // ======================================
  // UI
  // ======================================

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">📦 สินค้า</h1>

          <p className="text-slate-500 mt-1">จัดการสินค้าและสต๊อก</p>
        </div>

        <button
          onClick={openAddForm}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-bold"
        >
          ＋ เพิ่มสินค้า
        </button>
      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-slate-500">สินค้าทั้งหมด</p>

          <p className="text-3xl font-bold mt-2">{totalProducts}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-slate-500">Stock รวม</p>

          <p className="text-3xl font-bold text-blue-600 mt-2">
            {totalStock.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-slate-500">สินค้าใกล้หมด</p>

          <p className="text-3xl font-bold text-red-600 mt-2">{lowStock}</p>
        </div>
      </div>

      {/* SEARCH */}

      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 ค้นหาชื่อสินค้า / Barcode / หมวดหมู่"
          className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* PRODUCT TABLE */}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="font-bold text-lg">รายการสินค้า</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-left p-4">รหัส</th>

                <th className="text-left p-4">สินค้า</th>

                <th className="text-left p-4">Barcode</th>

                <th className="text-left p-4">หมวดหมู่</th>

                <th className="text-right p-4">ราคา</th>

                <th className="text-center p-4">Stock</th>

                <th className="text-center p-4">จัดการ</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center p-10">
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-10 text-slate-400">
                    {search ? "ไม่พบสินค้าที่ค้นหา" : "ยังไม่มีสินค้า"}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-t hover:bg-slate-50">
                    <td className="p-4 font-bold">{product.id}</td>

                    <td className="p-4 font-medium">{product.name}</td>

                    <td className="p-4">{product.barcode}</td>

                    <td className="p-4">{product.category || "-"}</td>

                    <td className="p-4 text-right font-bold">
                      ฿
                      {Number(product.price).toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full ${
                          Number(product.stock) <= 5
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditForm(product)}
                          className="bg-blue-100 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-200"
                        >
                          ✏️
                        </button>

                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200"
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
                {editingProduct ? "✏️ แก้ไขสินค้า" : "➕ เพิ่มสินค้า"}
              </h2>

              <button
                onClick={() => setShowForm(false)}
                className="text-xl text-slate-500"
              >
                ✕
              </button>
            </div>

            {/* NAME */}

            <div className="mb-4">
              <label className="block font-medium mb-2">ชื่อสินค้า</label>

              <input
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                placeholder="เช่น น้ำดื่ม 600ml"
                className="w-full border border-slate-300 rounded-lg p-3"
              />
            </div>

            {/* BARCODE */}

            <div className="mb-4">
              <label className="block font-medium mb-2">Barcode</label>

              <input
                value={form.barcode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    barcode: e.target.value.replace(/\D/g, ""),
                  })
                }
                placeholder="เช่น 8851234567890"
                className="w-full border border-slate-300 rounded-lg p-3"
              />
            </div>

            {/* PRICE */}

            <div className="mb-4">
              <label className="block font-medium mb-2">ราคา (บาท)</label>

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
                className="w-full border border-slate-300 rounded-lg p-3"
              />
            </div>

            {/* STOCK */}

            <div className="mb-4">
              <label className="block font-medium mb-2">จำนวน Stock</label>

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
                className="w-full border border-slate-300 rounded-lg p-3"
              />
            </div>

            {/* CATEGORY */}

            <div className="mb-6">
              <label className="block font-medium mb-2">หมวดหมู่</label>

              <input
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value,
                  })
                }
                placeholder="เช่น เครื่องดื่ม"
                className="w-full border border-slate-300 rounded-lg p-3"
              />
            </div>

            {/* BUTTONS */}

            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border border-slate-300 rounded-lg py-3"
              >
                ยกเลิก
              </button>

              <button
                onClick={saveProduct}
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
