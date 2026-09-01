import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState({
    totalSales: 0,
    billCount: 0,
    lowStockProducts: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/sales/dashboard`
      );

      if (!response.ok) {
        throw new Error("ไม่สามารถเชื่อมต่อ Dashboard API ได้");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || "ไม่สามารถโหลดข้อมูล Dashboard ได้"
        );
      }

      setDashboard({
        totalSales: Number(result.data?.totalSales || 0),
        billCount: Number(result.data?.billCount || 0),
        lowStockProducts: Number(
          result.data?.lowStockProducts || 0
        ),
      });
    } catch (err) {
      console.error("Dashboard Error:", err);
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="p-8">
      {/* HEADER */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Dashboard
        </h1>

        <p className="text-slate-500 mt-1">
          ภาพรวมระบบร้านค้าประจำวัน
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* ยอดขาย */}

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-slate-500">
            ยอดขายวันนี้
          </p>

          <h2 className="text-3xl font-bold mt-2">
            ฿
            {loading
              ? "..."
              : formatMoney(dashboard.totalSales)}
          </h2>

          <p className="text-slate-400 text-sm mt-2">
            ยอดขายจากรายการขายจริง
          </p>
        </div>

        {/* จำนวนบิล */}

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-slate-500">
            จำนวนบิล
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {loading
              ? "..."
              : dashboard.billCount.toLocaleString("th-TH")}
          </h2>

          <p className="text-slate-400 text-sm mt-2">
            จำนวนรายการขายวันนี้
          </p>
        </div>

        {/* กำไร */}

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-slate-500">
            กำไรวันนี้
          </p>

          <h2 className="text-3xl font-bold mt-2 text-green-600">
            -
          </h2>

          <p className="text-slate-400 text-sm mt-2">
            ยังไม่มีข้อมูลต้นทุนสินค้า
          </p>
        </div>

        {/* สินค้าใกล้หมด */}

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-slate-500">
            สินค้าใกล้หมด
          </p>

          <h2 className="text-3xl font-bold mt-2 text-red-500">
            {loading
              ? "..."
              : dashboard.lowStockProducts.toLocaleString(
                  "th-TH"
                )}
          </h2>

          <p className="text-red-500 text-sm mt-2">
            สินค้าที่มี Stock ≤ 10
          </p>
        </div>
      </div>

      {/* REFRESH */}

      <div className="mt-6">
        <button
          onClick={loadDashboard}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {loading ? "กำลังโหลด..." : "รีเฟรชข้อมูล"}
        </button>
      </div>
    </div>
  );
}