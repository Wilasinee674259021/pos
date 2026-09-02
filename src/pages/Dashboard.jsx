import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState({
    totalSales: 0,
    billCount: 0,
    lowStockProducts: 0,
    recentBills: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/sales/dashboard`
      );

      if (!response.ok) {
        throw new Error(
          "ไม่สามารถเชื่อมต่อ Dashboard API ได้"
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message ||
            "ไม่สามารถโหลดข้อมูล Dashboard ได้"
        );
      }

      const data = result.data || {};

      // =====================================================
      // รวมบิลที่ซ้ำกัน
      // =====================================================
      const bills = Array.isArray(data.recentBills)
        ? data.recentBills
        : [];

      const billMap = new Map();

      bills.forEach((bill) => {
        const billId =
          bill.id ||
          bill.billNumber ||
          bill.receiptNumber ||
          bill.saleId;

        if (!billId) return;

        const key = String(billId);

        if (!billMap.has(key)) {
          billMap.set(key, {
            ...bill,
            id: billId,
          });
        }
      });

      const uniqueBills = Array.from(
        billMap.values()
      );

      // =====================================================
      // จำนวนบิล
      // ถ้า API ส่ง billCount มา ให้ใช้ค่าจาก PostgreSQL
      // ถ้าไม่มี ให้ใช้จำนวนบิลที่กรองซ้ำแล้ว
      // =====================================================
      const billCount =
        data.billCount !== undefined &&
        data.billCount !== null
          ? Number(data.billCount)
          : uniqueBills.length;

      setDashboard({
        totalSales: Number(data.totalSales || 0),

        billCount,

        lowStockProducts: Number(
          data.lowStockProducts || 0
        ),

        recentBills: uniqueBills,
      });
    } catch (err) {
      console.error("Dashboard Error:", err);

      setError(
        err.message || "เกิดข้อผิดพลาด"
      );
    } finally {
      setLoading(false);
    }
  };

  // โหลดครั้งแรก + อัปเดตทุก 5 วินาที
  useEffect(() => {
    loadDashboard();

    const interval = setInterval(() => {
      loadDashboard();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString(
      "th-TH",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  const formatTime = (date) => {
    if (!date) return "-";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return "-";
    }

    return d.toLocaleTimeString(
      "th-TH",
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
    );
  };

  const getPaymentName = (method) => {
    if (method === "cash") {
      return "เงินสด";
    }

    if (method === "qr") {
      return "QR Payment";
    }

    if (method === "card") {
      return "บัตร";
    }

    return method || "-";
  };

  // =====================================================
  // นับช่องทางการชำระเงินจาก "บิลที่ไม่ซ้ำ"
  // =====================================================
  const cashBills =
    dashboard.recentBills.filter(
      (bill) => bill.paymentMethod === "cash"
    ).length;

  const qrBills =
    dashboard.recentBills.filter(
      (bill) => bill.paymentMethod === "qr"
    ).length;

  const cardBills =
    dashboard.recentBills.filter(
      (bill) => bill.paymentMethod === "card"
    ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Dashboard
          </h1>

          <p className="text-slate-500 mt-1">
            ภาพรวมระบบร้านค้าประจำวัน
          </p>
        </div>

        <div className="flex items-center gap-3">

          <div className="flex items-center gap-2 text-sm text-green-600">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            อัปเดตอัตโนมัติ
          </div>

          <button
            onClick={loadDashboard}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition disabled:opacity-50"
          >
            {loading
              ? "กำลังโหลด..."
              : "↻ รีเฟรช"}
          </button>

        </div>

      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-red-600">

          <div className="font-semibold">
            เกิดข้อผิดพลาด
          </div>

          <div className="text-sm mt-1">
            {error}
          </div>

        </div>
      )}

      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        {/* SALES */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-slate-500 text-sm">
                ยอดขายวันนี้
              </p>

              <h2 className="text-3xl font-bold text-slate-800 mt-2">
                ฿
                {loading
                  ? "..."
                  : formatMoney(
                      dashboard.totalSales
                    )}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">
              💰
            </div>

          </div>

          <p className="text-green-500 text-sm mt-4">
            ● ข้อมูลจากฐานข้อมูลจริง
          </p>

        </div>

        {/* BILLS */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-slate-500 text-sm">
                จำนวนบิลวันนี้
              </p>

              <h2 className="text-3xl font-bold text-slate-800 mt-2">
                {loading
                  ? "..."
                  : dashboard.billCount.toLocaleString(
                      "th-TH"
                    )}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-2xl">
              🧾
            </div>

          </div>

          <p className="text-green-500 text-sm mt-4">
            ● จำนวนบิลจริงจาก PostgreSQL
          </p>

        </div>

        {/* PROFIT */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-slate-500 text-sm">
                กำไรวันนี้
              </p>

              <h2 className="text-3xl font-bold text-green-600 mt-2">
                -
              </h2>
            </div>

            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-2xl">
              📈
            </div>

          </div>

          <p className="text-slate-400 text-sm mt-4">
            รอข้อมูลต้นทุนสินค้า
          </p>

        </div>

        {/* LOW STOCK */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-slate-500 text-sm">
                สินค้าใกล้หมด
              </p>

              <h2 className="text-3xl font-bold text-red-500 mt-2">
                {loading
                  ? "..."
                  : dashboard.lowStockProducts.toLocaleString(
                      "th-TH"
                    )}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-2xl">
              📦
            </div>

          </div>

          <p className="text-red-400 text-sm mt-4">
            Stock ≤ 10
          </p>

        </div>

      </div>

      {/* SALES + PAYMENT */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">

        {/* SALES */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">

          <div className="flex items-center justify-between mb-6">

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                ยอดขายวันนี้
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                ข้อมูลจากรายการขายจริง
              </p>
            </div>

            <span className="px-3 py-1 rounded-lg bg-green-50 text-green-600 text-sm">
              Real-time
            </span>

          </div>

          <div className="h-56 flex items-center justify-center">

            <div className="text-center">

              <p className="text-sm text-slate-400">
                ยอดขายรวมวันนี้
              </p>

              <p className="text-5xl font-bold text-slate-800 mt-3">
                ฿
                {loading
                  ? "..."
                  : formatMoney(
                      dashboard.totalSales
                    )}
              </p>

              <p className="text-slate-400 mt-4">
                {dashboard.billCount.toLocaleString(
                  "th-TH"
                )}{" "}
                บิล
              </p>

            </div>

          </div>

        </div>

        {/* PAYMENT */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">

          <h2 className="text-xl font-bold text-slate-800">
            ช่องทางการชำระเงิน
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            จำนวนบิลวันนี้
          </p>

          <div className="space-y-4 mt-7">

            {/* CASH */}
            <div className="flex justify-between items-center p-4 rounded-xl bg-slate-50">

              <span className="text-slate-600">
                💵 เงินสด
              </span>

              <span className="font-semibold">
                {cashBills} บิล
              </span>

            </div>

            {/* QR */}
            <div className="flex justify-between items-center p-4 rounded-xl bg-slate-50">

              <span className="text-slate-600">
                📱 QR Payment
              </span>

              <span className="font-semibold">
                {qrBills} บิล
              </span>

            </div>

            {/* CARD */}
            <div className="flex justify-between items-center p-4 rounded-xl bg-slate-50">

              <span className="text-slate-600">
                💳 บัตร
              </span>

              <span className="font-semibold">
                {cardBills} บิล
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* RECENT BILLS */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

        <div className="p-6 flex items-center justify-between">

          <div>
            <h2 className="text-xl font-bold text-slate-800">
              🧾 บิลล่าสุด
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              แสดงบิลไม่ซ้ำกัน
            </p>
          </div>

          <span className="px-3 py-1 rounded-lg bg-green-50 text-green-600 text-sm">
            ● Live
          </span>

        </div>

        {dashboard.recentBills.length === 0 ? (

          <div className="p-10 text-center">

            <div className="text-4xl">
              🧾
            </div>

            <p className="font-semibold text-slate-600 mt-3">
              ยังไม่มีบิลวันนี้
            </p>

            <p className="text-sm text-slate-400 mt-1">
              เมื่อมีการขาย บิลจะแสดงที่นี่ทันที
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="border-t border-b border-slate-100 bg-slate-50">

                  <th className="text-left p-4 text-sm font-semibold text-slate-500">
                    เลขที่บิล
                  </th>

                  <th className="text-left p-4 text-sm font-semibold text-slate-500">
                    เวลา
                  </th>

                  <th className="text-left p-4 text-sm font-semibold text-slate-500">
                    ช่องทาง
                  </th>

                  <th className="text-right p-4 text-sm font-semibold text-slate-500">
                    ยอดรวม
                  </th>

                  <th className="text-center p-4 text-sm font-semibold text-slate-500">
                    สถานะ
                  </th>

                </tr>
              </thead>

              <tbody>

                {dashboard.recentBills.map(
                  (bill) => (

                    <tr
                      key={String(bill.id)}
                      className="border-b border-slate-100 hover:bg-slate-50 transition"
                    >

                      {/* BILL */}
                      <td className="p-4">
                        <span className="font-semibold text-slate-700">
                          {bill.id}
                        </span>
                      </td>

                      {/* TIME */}
                      <td className="p-4 text-slate-500">
                        {formatTime(
                          bill.createdAt
                        )}
                      </td>

                      {/* PAYMENT */}
                      <td className="p-4">

                        <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-sm">
                          {getPaymentName(
                            bill.paymentMethod
                          )}
                        </span>

                      </td>

                      {/* TOTAL */}
                      <td className="p-4 text-right">

                        <span className="font-bold text-slate-800">
                          ฿
                          {formatMoney(
                            bill.totalAmount
                          )}
                        </span>

                      </td>

                      {/* STATUS */}
                      <td className="p-4 text-center">

                        <span className="px-3 py-1 rounded-lg bg-green-50 text-green-600 text-sm">
                          สำเร็จ
                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}