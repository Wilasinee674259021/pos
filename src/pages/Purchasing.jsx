import React, { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE}/api/products`;

export default function Purchasing() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [receiveNo, setReceiveNo] = useState("SG-2026-002");
  const [receiveDate, setReceiveDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedProductId, setSelectedProductId] = useState("");
  const [inputQty, setInputQty] = useState("");
  const [inputCost, setInputCost] = useState("");
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);

  // ประวัติการรับสินค้าตัวอย่างในหน้าหลัก
  const [purchases, setPurchases] = useState([
    {
      id: "SG-2026-001",
      date: "2026-09-15",
      itemsCount: 3,
      total: 4500,
      status: "สำเร็จ",
    },
  ]);

  // ดึงข้อมูลสินค้าจาก Backend API เดียวกันกับหน้า Products
  const loadProducts = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        result = {};
      }

      if (response.ok && result.success && Array.isArray(result.data)) {
        setProducts(result.data);
      } else {
        // Fallback จาก LocalStorage หากเชื่อม Backend ไม่ได้
        const local =
          localStorage.getItem("pos_products") ||
          localStorage.getItem("products");
        if (local) setProducts(JSON.parse(local));
      }
    } catch (err) {
      console.error("Purchasing load products error:", err);
      // Fallback จาก LocalStorage
      const local =
        localStorage.getItem("pos_products") ||
        localStorage.getItem("products");
      if (local) setProducts(JSON.parse(local));
    }
  };

  useEffect(() => {
    loadProducts();
  }, [showForm]);

  // เมื่อเลือกสินค้าใน Dropdown จะ auto fill ราคาทุนให้อัตโนมัติ
  const handleSelectProduct = (e) => {
    const pId = e.target.value;
    setSelectedProductId(pId);
    const prod = products.find((p) => String(p.id) === String(pId));
    if (prod && (prod.cost || prod.costPrice)) {
      setInputCost(prod.cost || prod.costPrice);
    }
  };

  const handleAddItem = (e) => {
    if (e) e.preventDefault();
    if (!selectedProductId || !inputQty || !inputCost) return;

    const prod = products.find(
      (p) => String(p.id) === String(selectedProductId)
    );
    setItems((prev) => [
      ...prev,
      {
        id: selectedProductId,
        name: prod ? prod.name || prod.title : "สินค้า",
        qty: Number(inputQty),
        cost: Number(inputCost),
      },
    ]);
    setSelectedProductId("");
    setInputQty("");
    setInputCost("");
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.qty * item.cost,
    0
  );

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (items.length === 0) return;

    // อัปเดตสต็อกไปยัง Backend API
    for (const item of items) {
      const targetProd = products.find(
        (p) => String(p.id) === String(item.id)
      );
      if (targetProd) {
        const newStock = Number(targetProd.stock || 0) + Number(item.qty);
        try {
          await fetch(`${API_URL}/${item.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              ...targetProd,
              cost: Number(item.cost), // อัปเดตราคาทุนใหม่ตามใบรับ
              stock: newStock,
            }),
          });
        } catch (err) {
          console.error("Update stock error:", err);
        }
      }
    }

    // บันทึกประวัติหน้า Purchasing
    setPurchases([
      {
        id: receiveNo,
        date: receiveDate,
        itemsCount: items.length,
        total: totalAmount,
        status: "สำเร็จ",
      },
      ...purchases,
    ]);

    setItems([]);
    setShowForm(false);
    await loadProducts(); // รีโหลดข้อมูลสินค้าล่าสุด
  };

  const filteredPurchases = purchases.filter((p) =>
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 relative space-y-6">
      {/* Header หน้าหลัก */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            การสั่งซื้อและรับสินค้า
          </h1>
          <p className="text-slate-500 text-sm">
            จัดการรายการสั่งซื้อและรับสินค้าเข้าสต็อก
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition-colors flex items-center gap-2"
        >
          <span>+</span> รับสินค้าเข้าสต็อก
        </button>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
        <input
          type="text"
          placeholder="ค้นหาเลขที่ใบรับสินค้า..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-72 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
      </div>

      {/* ตารางประวัติการรับสินค้า หน้าหลัก */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
            <tr>
              <th className="py-3.5 px-4">เลขที่ใบรับสินค้า</th>
              <th className="py-3.5 px-4">วันที่รับ</th>
              <th className="py-3.5 px-4 text-center">จำนวนรายการ</th>
              <th className="py-3.5 px-4 text-right">ยอดรวม</th>
              <th className="py-3.5 px-4 text-center">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPurchases.length > 0 ? (
              filteredPurchases.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {row.id}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{row.date}</td>
                  <td className="py-3.5 px-4 text-center">{row.itemsCount}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                    ฿{row.total.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  ไม่พบประวัติการรับสินค้า
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL รับสินค้าเข้าสต็อก ================= */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
          }}
          className="flex items-center justify-center bg-black/60 p-4"
        >
          <div
            style={{ width: "100%", maxWidth: "800px", maxHeight: "90vh" }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
              <h2 className="text-lg font-bold text-slate-800">
                จัดการการสั่งซื้อและรับสินค้าเข้าสต็อก
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 text-center">
                    เลขที่ใบรับสินค้า
                  </label>
                  <input
                    type="text"
                    value={receiveNo}
                    onChange={(e) => setReceiveNo(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-center font-medium bg-slate-50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 text-center">
                    วันที่รับสินค้า
                  </label>
                  <input
                    type="date"
                    value={receiveDate}
                    onChange={(e) => setReceiveDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-center outline-none"
                  />
                </div>
              </div>

              {/* ฟอร์มเลือกสินค้า */}
              <div className="bg-slate-50 p-3 rounded-xl flex flex-col sm:flex-row gap-2 items-center">
                <select
                  value={selectedProductId}
                  onChange={handleSelectProduct}
                  style={{ width: "100%", minWidth: "200px" }}
                  className="rounded-lg border border-slate-300 p-2 text-sm outline-none flex-1 bg-white"
                >
                  <option value="">-- เลือกสินค้า --</option>
                  {products.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} {item.barcode ? `(${item.barcode})` : ""}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="จำนวน"
                  value={inputQty}
                  onChange={(e) => setInputQty(e.target.value)}
                  style={{ width: "120px" }}
                  className="rounded-lg border border-slate-300 p-2 text-sm text-center outline-none shrink-0 bg-white"
                />

                <input
                  type="number"
                  placeholder="ราคาทุน/ชิ้น"
                  value={inputCost}
                  onChange={(e) => setInputCost(e.target.value)}
                  style={{ width: "140px" }}
                  className="rounded-lg border border-slate-300 p-2 text-sm text-center outline-none shrink-0 bg-white"
                />

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full sm:w-auto px-5 h-[38px] bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center justify-center shrink-0 transition-colors"
                >
                  +
                </button>
              </div>

              {/* ตารางรายการสินค้าที่เลือกใน Modal */}
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">รายการสินค้า</th>
                      <th className="py-3 px-4 text-center">จำนวน</th>
                      <th className="py-3 px-4 text-center">ราคาทุน</th>
                      <th className="py-3 px-4 text-right">รวม</th>
                      <th className="py-3 px-4 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.length > 0 ? (
                      items.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-medium text-slate-800">
                            {item.name}
                          </td>
                          <td className="py-3 px-4 text-center">{item.qty}</td>
                          <td className="py-3 px-4 text-center">
                            ฿{Number(item.cost).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-800">
                            ฿{(item.qty * item.cost).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-6 text-center text-slate-400"
                        >
                          ยังไม่มีรายการสินค้า
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* สรุปรวมเงิน */}
              <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center">
                <span className="font-semibold text-slate-600">
                  ราคารวมทั้งหมด
                </span>
                <span className="text-2xl font-black text-emerald-600">
                  ฿{Number(totalAmount).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
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
