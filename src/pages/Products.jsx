import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE}/api/products`;

const generateBarcode = () => {
  let base = "885";
  for (let i = 0; i < 9; i++) {
    base += Math.floor(Math.random() * 10);
  }
  const digits = base.split("").map(Number);
  let sum = 0;
  digits.forEach((digit, index) => {
    sum += index % 2 === 0 ? digit : digit * 3;
  });
  const checkDigit = (10 - (sum % 10)) % 10;
  return base + checkDigit;
};

export default function Products() {
  const [products, setProducts] = useState(() => {
    // โหลดข้อมูลเก่าจาก LocalStorage ออกมารอก่อนระหว่างรอ Render ตอบกลับ
    const saved = localStorage.getItem("pos_products");
    return saved ? JSON.parse(saved) : [];
  });
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

  // โหลดข้อมูลจาก Render API
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
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

      if (!response.ok || !result.success) {
        throw new Error(result.message || "โหลดข้อมูลสินค้าไม่สำเร็จ");
      }

      const data = Array.isArray(result.data) ? result.data : [];
      setProducts(data);
      localStorage.setItem("pos_products", JSON.stringify(data));
    } catch (err) {
      console.error("LOAD PRODUCTS ERROR:", err);
      // ถ้า Render sleep หรือ error ให้ใช้ข้อมูลจาก Cache ใน LocalStorage ต่อ
      setError("กำลังเชื่อมต่อเซิร์ฟเวอร์ Render...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

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

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const calculatedCost =
    form.purchaseTotal !== "" &&
    form.purchaseQuantity !== "" &&
    Number(form.purchaseQuantity) > 0
      ? Number(form.purchaseTotal) / Number(form.purchaseQuantity)
      : 0;

  const saveProduct = async () => {
    const name = form.name.trim();
    const barcode = form.barcode.trim();
    const price = Number(form.price);
    let cost = costMode === "calculate" ? calculatedCost : Number(form.cost === "" ? 0 : form.cost);
    const stock = Number(form.stock === "" ? 0 : form.stock);

    if (!name) return alert("กรุณากรอกชื่อสินค้า");
    if (form.price === "" || Number.isNaN(price) || price < 0) return alert("กรุณากรอกราคาสินค้าให้ถูกต้อง");

    const payload = {
      name,
      barcode,
      price,
      cost,
      stock,
      category: form.category.trim(),
    };

    try {
      const url = editingProduct ? `${API_URL}/${editingProduct.id}` : API_URL;
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error("Backend ส่งข้อมูลตอบกลับไม่ใช่ JSON");
      }

      if (!response.ok || !result.success) {
        alert(result.message || "บันทึกสินค้าไม่สำเร็จ");
        return;
      }

      alert(editingProduct ? "แก้ไขสินค้าเรียบร้อย" : "เพิ่มสินค้าเรียบร้อย");
      closeForm();
      await loadProducts(); // ดึงข้อมูลล่าสุดจาก Render
    } catch (err) {
      console.error("SAVE PRODUCT ERROR:", err);
      alert(`ไม่สามารถเชื่อมต่อ Render ได้: ${err.message}`);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("ต้องการลบสินค้านี้ใช่หรือไม่?")) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error("Backend ส่งข้อมูลไม่ใช่ JSON");
      }

      if (!response.ok || !result.success) {
        alert(result.message || "ลบสินค้าไม่สำเร็จ");
        return;
      }

      alert("ลบสินค้าเรียบร้อย");
      await loadProducts();
    } catch (err) {
      console.error("DELETE PRODUCT ERROR:", err);
      alert(`ไม่สามารถเชื่อมต่อ Render ได้: ${err.message}`);
    }
  };

  const filteredProducts = products.filter((product) => {
    const keyword = search.toLowerCase().trim();
    if (!keyword) return true;
    return (
      String(product.name || "").toLowerCase().includes(keyword) ||
      String(product.barcode || "").toLowerCase().includes(keyword) ||
      String(product.category || "").toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-5 lg:p-8">
      <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">📦 สินค้า</h1>
          <p className="mt-1 text-sm text-slate-500">จัดการสินค้า ราคาทุน ราคาขาย และสต๊อก</p>
        </div>
        <button
          onClick={openAddForm}
          className="h-10 rounded-lg bg-blue-600 px-5 font-bold text-white hover:bg-blue-700"
        >
          ＋ เพิ่มสินค้า
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700 border border-amber-200">
          ⚠️ {error} (กำลังโหลดจากความจำเครื่อง)
        </div>
      )}

      <div className="mb-5 rounded-xl bg-white p-4 shadow-sm">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 ค้นหาชื่อสินค้า / Barcode / หมวดหมู่"
          className="h-10 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 text-left">สินค้า</th>
                <th className="p-4 text-left">Barcode</th>
                <th className="p-4 text-left">หมวดหมู่</th>
                <th className="p-4 text-right">ราคาทุน</th>
                <th className="p-4 text-right">ราคาขาย</th>
                <th className="p-4 text-center">Stock</th>
                <th className="p-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading && products.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center">กำลังดึงข้อมูลจาก Render...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400">ยังไม่มีรายการสินค้า</td></tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-t hover:bg-slate-50">
                    <td className="p-4 font-medium">{product.name}</td>
                    <td className="p-4 font-mono text-sm">{product.barcode}</td>
                    <td className="p-4">{product.category || "-"}</td>
                    <td className="p-4 text-right font-bold text-orange-600">฿{Number(product.cost || 0).toLocaleString()}</td>
                    <td className="p-4 text-right font-bold">฿{Number(product.price || 0).toLocaleString()}</td>
                    <td className="p-4 text-center">{product.stock}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => openEditForm(product)} className="mr-2 text-blue-600">✏️</button>
                      <button onClick={() => deleteProduct(product.id)} className="text-red-600">🗑️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">{editingProduct ? "✏️ แก้ไขสินค้า" : "➕ เพิ่มสินค้า"}</h2>
            
            <label className="block text-sm font-medium mb-1">ชื่อสินค้า</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mb-3 w-full rounded-lg border p-2.5 text-sm outline-none"
            />

            <label className="block text-sm font-medium mb-1">Barcode</label>
            <input
              value={form.barcode}
              readOnly
              className="mb-3 w-full rounded-lg border bg-slate-100 p-2.5 font-mono text-sm"
            />

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium mb-1">ราคาทุน</label>
                <input
                  type="number"
                  value={form.cost}
                  onChange={(e) => setForm({ ...form, cost: e.target.value })}
                  className="w-full rounded-lg border p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ราคาขาย</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full rounded-lg border p-2.5 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Stock</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="w-full rounded-lg border p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">หมวดหมู่</label>
                <input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-lg border p-2.5 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={closeForm} className="w-1/2 rounded-lg border py-2 font-medium">ยกเลิก</button>
              <button onClick={saveProduct} className="w-1/2 rounded-lg bg-blue-600 py-2 font-bold text-white">บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
