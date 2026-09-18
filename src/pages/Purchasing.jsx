import React, { useState } from "react";

export default function Purchasing() {
  const [showForm, setShowForm] = useState(false);
  const [receiveNo, setReceiveNo] = useState("SG-2026-002");
  const [receiveDate, setReceiveDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedProductId, setSelectedProductId] = useState("");
  const [inputQty, setInputQty] = useState("");
  const [inputCost, setInputCost] = useState("");
  const [items, setItems] = useState([]);

  // Mock รายการสินค้า
  const products = [
    { id: "1", name: "สินค้า A" },
    { id: "2", name: "สินค้า B" },
  ];

  const handleAddItem = (e) => {
    if (e) e.preventDefault();
    if (!selectedProductId || !inputQty || !inputCost) return;
    const prod = products.find((p) => p.id === selectedProductId);
    setItems((prev) => [
      ...prev,
      {
        id: selectedProductId,
        name: prod ? prod.name : "สินค้า",
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

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setShowForm(false);
  };

  return (
    <div className="p-6 relative">
      <div className="flex justify-between items-center mb-6">
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
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
        >
          + รับสินค้าเข้าสต็อก
        </button>
      </div>

      {/* ================= MODAL รับสินค้าเข้าสต็อก (FIXED OVERLAY) ================= */}
      {showForm && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
          className="flex items-center justify-center bg-black/60 p-4"
        >
          <div 
            style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh' }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
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

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* เลขที่ใบรับสินค้า & วันที่ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 text-center">
                    เลขที่ใบรับสินค้า
                  </label>
                  <input
                    type="text"
                    value={receiveNo}
                    onChange={(e) => setReceiveNo(e.target.value)}
                    className="top-page-input text-center font-medium bg-slate-50"
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
                    className="top-page-input text-center"
                  />
                </div>
              </div>

              {/* ฟอร์มเพิ่มสินค้า */}
              <div className="bg-slate-50 p-3 rounded-xl flex flex-col sm:flex-row gap-2 items-center">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="top-page-input flex-1"
                >
                  <option value="">-- เลือกสินค้า --</option>
                  {products.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="จำนวน"
                  value={inputQty}
                  onChange={(e) => setInputQty(e.target.value)}
                  className="top-page-input sm:w-28 text-center"
                />

                <input
                  type="number"
                  placeholder="ราคาทุน/ชิ้น"
                  value={inputCost}
                  onChange={(e) => setInputCost(e.target.value)}
                  className="top-page-input sm:w-32 text-center"
                />

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full sm:w-auto px-5 h-[38px] bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center justify-center shrink-0 transition-colors"
                >
                  +
                </button>
              </div>

              {/* ตารางรายการสินค้า */}
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

              {/* ราคารวม */}
              <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center">
                <span className="font-semibold text-slate-600">
                  ราคารวมทั้งหมด
                </span>
                <span className="text-2xl font-black text-emerald-600">
                  ฿{Number(totalAmount).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Footer */}
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
