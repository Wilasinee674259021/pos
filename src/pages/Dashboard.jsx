import { useEffect, useMemo, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const emptyDashboard = {
  totalSales: 0,
  billCount: 0,
  totalCost: 0,
  totalExpense: 0,
  grossProfit: 0,
  netProfit: 0,
  purchaseTotal: 0,
  stockIn: 0,
  stockOut: 0,
  lowStockCount: 0,
  lowStockProducts: [],
  paymentSummary: {
    cash: 0,
    qr: 0,
    card: 0,
  },
  recentBills: [],
  expenseCount: 0,
  purchaseCount: 0,
};

function formatMoney(value) {
  return Number(value || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getToday() {
  return formatDate(new Date());
}

function getYesterday() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return formatDate(date);
}

function getMonthStart() {
  return formatDate(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
}

function getMonthEnd() {
  return formatDate(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  );
}

function getLastMonthStart() {
  return formatDate(
    new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
  );
}

function getLastMonthEnd() {
  return formatDate(
    new Date(new Date().getFullYear(), new Date().getMonth(), 0)
  );
}

function getYearStart() {
  return formatDate(
    new Date(new Date().getFullYear(), 0, 1)
  );
}

function getYearEnd() {
  return formatDate(
    new Date(new Date().getFullYear(), 11, 31)
  );
}

export default function Dashboard() {
  const [filter, setFilter] = useState("today");

  const [startDate, setStartDate] = useState(getToday());
  const [endDate, setEndDate] = useState(getToday());

  const [dashboard, setDashboard] = useState(emptyDashboard);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const updateFilter = (value) => {
    setFilter(value);

    if (value === "today") {
      const today = getToday();
      setStartDate(today);
      setEndDate(today);
    }

    if (value === "yesterday") {
      const yesterday = getYesterday();
      setStartDate(yesterday);
      setEndDate(yesterday);
    }

    if (value === "thisMonth") {
      setStartDate(getMonthStart());
      setEndDate(getMonthEnd());
    }

    if (value === "lastMonth") {
      setStartDate(getLastMonthStart());
      setEndDate(getLastMonthEnd());
    }

    if (value === "thisYear") {
      setStartDate(getYearStart());
      setEndDate(getYearEnd());
    }
  };

  const loadDashboard = async () => {
    try {
      setError("");

      const params = new URLSearchParams({
        startDate,
        endDate,
      });

      const response = await fetch(
        `${API_URL}/api/dashboard?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(
          `โหลด Dashboard ไม่สำเร็จ (${response.status})`
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || "ไม่สามารถโหลดข้อมูล Dashboard ได้"
        );
      }

      setDashboard({
        ...emptyDashboard,
        ...result.data,
        paymentSummary: {
          ...emptyDashboard.paymentSummary,
          ...(result.data?.paymentSummary || {}),
        },
        lowStockProducts:
          result.data?.lowStockProducts || [],
        recentBills:
          result.data?.recentBills || [],
      });
    } catch (err) {
      console.error("DASHBOARD ERROR:", err);

      setError(
        err.message || "ไม่สามารถเชื่อมต่อ Backend ได้"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadDashboard();
  }, [startDate, endDate]);

  const paymentTotal = useMemo(() => {
    return (
      Number(dashboard.paymentSummary.cash || 0) +
      Number(dashboard.paymentSummary.qr || 0) +
      Number(dashboard.paymentSummary.card || 0)
    );
  }, [dashboard.paymentSummary]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Dashboard
            </h1>

            <p className="mt-1 text-gray-500">
              ภาพรวมระบบ Convenience POS
            </p>
          </div>

          <button
            onClick={loadDashboard}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "กำลังโหลด..." : "รีเฟรชข้อมูล"}
          </button>
        </div>

        {/* FILTER */}
        <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            เลือกช่วงเวลา
          </h2>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateFilter("today")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                filter === "today"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              วันนี้
            </button>

            <button
              onClick={() => updateFilter("yesterday")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                filter === "yesterday"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              เมื่อวาน
            </button>

            <button
              onClick={() => updateFilter("thisMonth")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                filter === "thisMonth"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              เดือนนี้
            </button>

            <button
              onClick={() => updateFilter("lastMonth")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                filter === "lastMonth"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              เดือนที่แล้ว
            </button>

            <button
              onClick={() => updateFilter("thisYear")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                filter === "thisYear"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              ปีนี้
            </button>

            <button
              onClick={() => setFilter("custom")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                filter === "custom"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              กำหนดเอง
            </button>
          </div>

          {filter === "custom" && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  วันที่เริ่มต้น
                </label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setFilter("custom");
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  วันที่สิ้นสุด
                </label>

                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setFilter("custom");
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
            แสดงข้อมูลวันที่{" "}
            <span className="font-semibold text-gray-800">
              {startDate}
            </span>{" "}
            ถึง{" "}
            <span className="font-semibold text-gray-800">
              {endDate}
            </span>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="font-semibold">
              เกิดข้อผิดพลาด
            </div>

            <div className="mt-1 text-sm">
              {error}
            </div>

            <div className="mt-2 text-sm">
              Backend:
              <span className="ml-1 font-medium">
                {API_URL}
              </span>
            </div>

            <button
              onClick={loadDashboard}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              ลองใหม่
            </button>
          </div>
        )}

        {/* MAIN SUMMARY */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              ยอดขาย
            </p>

            <p className="mt-2 text-2xl font-bold text-green-600">
              ฿{formatMoney(dashboard.totalSales)}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              ยอดขายสุทธิ
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              จำนวนบิล
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-600">
              {Number(dashboard.billCount || 0).toLocaleString("th-TH")}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              รายการขาย
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              กำไรขั้นต้น
            </p>

            <p className="mt-2 text-2xl font-bold text-indigo-600">
              ฿{formatMoney(dashboard.grossProfit)}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              ยอดขาย - ต้นทุนสินค้า
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              กำไรสุทธิ
            </p>

            <p
              className={`mt-2 text-2xl font-bold ${
                Number(dashboard.netProfit || 0) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              ฿{formatMoney(dashboard.netProfit)}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              หักค่าใช้จ่ายแล้ว
            </p>
          </div>

        </div>

        {/* FINANCE */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              ต้นทุนสินค้า
            </p>

            <p className="mt-2 text-xl font-bold text-orange-600">
              ฿{formatMoney(dashboard.totalCost)}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              ค่าใช้จ่าย
            </p>

            <p className="mt-2 text-xl font-bold text-red-600">
              ฿{formatMoney(dashboard.totalExpense)}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              {dashboard.expenseCount || 0} รายการ
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              ยอดซื้อสินค้า
            </p>

            <p className="mt-2 text-xl font-bold text-purple-600">
              ฿{formatMoney(dashboard.purchaseTotal)}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              {dashboard.purchaseCount || 0} ใบสั่งซื้อ
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              สินค้าใกล้หมด
            </p>

            <p className="mt-2 text-xl font-bold text-red-600">
              {Number(dashboard.lowStockCount || 0).toLocaleString("th-TH")} รายการ
            </p>
          </div>

        </div>

        {/* STOCK */}
        <div className="mb-6 grid gap-4 md:grid-cols-2">

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              สินค้าเข้า
            </p>

            <p className="mt-2 text-2xl font-bold text-green-600">
              {Number(dashboard.stockIn || 0).toLocaleString("th-TH")} ชิ้น
            </p>

            <p className="mt-1 text-xs text-gray-400">
              จากการรับสินค้า/เพิ่มสต็อก
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              สินค้าออก
            </p>

            <p className="mt-2 text-2xl font-bold text-orange-600">
              {Number(dashboard.stockOut || 0).toLocaleString("th-TH")} ชิ้น
            </p>

            <p className="mt-1 text-xs text-gray-400">
              จากการขายสินค้า
            </p>
          </div>

        </div>

        {/* PAYMENT SUMMARY */}
        <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">

          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              ยอดขายตามช่องทางชำระเงิน
            </h2>

            <p className="text-sm text-gray-500">
              รวม ฿{formatMoney(paymentTotal)}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                เงินสด
              </p>

              <p className="mt-2 text-xl font-bold text-green-600">
                ฿{formatMoney(dashboard.paymentSummary.cash)}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                QR Payment
              </p>

              <p className="mt-2 text-xl font-bold text-blue-600">
                ฿{formatMoney(dashboard.paymentSummary.qr)}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                บัตร
              </p>

              <p className="mt-2 text-xl font-bold text-purple-600">
                ฿{formatMoney(dashboard.paymentSummary.card)}
              </p>
            </div>

          </div>
        </div>

        {/* RECENT BILLS */}
        <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">

          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              รายการขายล่าสุด
            </h2>

            <p className="text-sm text-gray-500">
              แสดงสูงสุด 10 รายการ
            </p>
          </div>

          {dashboard.recentBills.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-8 text-center text-gray-500">
              ไม่พบรายการขายในช่วงเวลานี้
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[700px]">

                <thead>
                  <tr className="border-b text-left text-sm text-gray-500">

                    <th className="px-3 py-3">
                      เลขที่บิล
                    </th>

                    <th className="px-3 py-3">
                      วันที่
                    </th>

                    <th className="px-3 py-3">
                      ช่องทางชำระ
                    </th>

                    <th className="px-3 py-3 text-right">
                      ส่วนลด
                    </th>

                    <th className="px-3 py-3 text-right">
                      ยอดสุทธิ
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {dashboard.recentBills.map((bill) => (
                    <tr
                      key={bill.id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >

                      <td className="px-3 py-3 font-medium text-gray-800">
                        {bill.id}
                      </td>

                      <td className="px-3 py-3 text-sm text-gray-600">
                        {bill.createdAt
                          ? new Date(bill.createdAt).toLocaleString("th-TH")
                          : "-"}
                      </td>

                      <td className="px-3 py-3">
                        {bill.paymentMethod === "cash"
                          ? "เงินสด"
                          : bill.paymentMethod === "qr"
                          ? "QR Payment"
                          : bill.paymentMethod === "card"
                          ? "บัตร"
                          : bill.paymentMethod || "-"}
                      </td>

                      <td className="px-3 py-3 text-right text-red-600">
                        ฿{formatMoney(bill.discountAmount)}
                      </td>

                      <td className="px-3 py-3 text-right font-semibold text-green-600">
                        ฿{formatMoney(bill.netTotal)}
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* LOW STOCK */}
        <div className="rounded-xl bg-white p-5 shadow-sm">

          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              สินค้าใกล้หมด
            </h2>

            <p className="text-sm text-gray-500">
              สินค้าที่มีสต็อกไม่เกิน 10 ชิ้น
            </p>
          </div>

          {dashboard.lowStockProducts.length === 0 ? (
            <div className="rounded-lg bg-green-50 p-6 text-center text-green-700">
              ไม่มีสินค้าใกล้หมด
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[600px]">

                <thead>
                  <tr className="border-b text-left text-sm text-gray-500">

                    <th className="px-3 py-3">
                      รหัสสินค้า
                    </th>

                    <th className="px-3 py-3">
                      ชื่อสินค้า
                    </th>

                    <th className="px-3 py-3">
                      Barcode
                    </th>

                    <th className="px-3 py-3 text-right">
                      คงเหลือ
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {dashboard.lowStockProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b last:border-0"
                    >

                      <td className="px-3 py-3 font-medium">
                        {product.id}
                      </td>

                      <td className="px-3 py-3">
                        {product.name}
                      </td>

                      <td className="px-3 py-3 text-gray-500">
                        {product.barcode}
                      </td>

                      <td
                        className={`px-3 py-3 text-right font-bold ${
                          Number(product.stock) <= 5
                            ? "text-red-600"
                            : "text-orange-600"
                        }`}
                      >
                        {Number(product.stock || 0).toLocaleString("th-TH")} ชิ้น
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
