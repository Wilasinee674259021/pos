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

function paymentLabel(method) {
  if (method === "cash") return "เงินสด";
  if (method === "qr") return "QR Payment";
  if (method === "card") return "บัตร";
  return method || "-";
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
          result.message ||
            "ไม่สามารถโหลดข้อมูล Dashboard ได้"
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
        err.message ||
          "ไม่สามารถเชื่อมต่อ Backend ได้"
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

  const summaryCards = [
    {
      title: "ยอดขาย",
      value: `฿${formatMoney(dashboard.totalSales)}`,
      subtitle: "ยอดขายสุทธิ",
      icon: "💰",
      valueClass: "text-green-600",
      iconBg: "bg-green-50",
    },
    {
      title: "จำนวนบิล",
      value: Number(
        dashboard.billCount || 0
      ).toLocaleString("th-TH"),
      subtitle: "รายการขาย",
      icon: "🧾",
      valueClass: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      title: "กำไรขั้นต้น",
      value: `฿${formatMoney(
        dashboard.grossProfit
      )}`,
      subtitle: "ยอดขาย - ต้นทุนสินค้า",
      icon: "📈",
      valueClass: "text-indigo-600",
      iconBg: "bg-indigo-50",
    },
    {
      title: "กำไรสุทธิ",
      value: `฿${formatMoney(
        dashboard.netProfit
      )}`,
      subtitle: "หักค่าใช้จ่ายแล้ว",
      icon: "💵",
      valueClass:
        Number(dashboard.netProfit || 0) >= 0
          ? "text-green-600"
          : "text-red-600",
      iconBg:
        Number(dashboard.netProfit || 0) >= 0
          ? "bg-green-50"
          : "bg-red-50",
    },
  ];

  const financeCards = [
    {
      title: "ต้นทุนสินค้า",
      value: `฿${formatMoney(
        dashboard.totalCost
      )}`,
      subtitle: "",
      icon: "📦",
      valueClass: "text-orange-600",
      iconBg: "bg-orange-50",
    },
    {
      title: "ค่าใช้จ่าย",
      value: `฿${formatMoney(
        dashboard.totalExpense
      )}`,
      subtitle: `${dashboard.expenseCount || 0} รายการ`,
      icon: "💸",
      valueClass: "text-red-600",
      iconBg: "bg-red-50",
    },
    {
      title: "ยอดซื้อสินค้า",
      value: `฿${formatMoney(
        dashboard.purchaseTotal
      )}`,
      subtitle: `${dashboard.purchaseCount || 0} ใบสั่งซื้อ`,
      icon: "🛒",
      valueClass: "text-purple-600",
      iconBg: "bg-purple-50",
    },
    {
      title: "สินค้าใกล้หมด",
      value: `${Number(
        dashboard.lowStockCount || 0
      ).toLocaleString("th-TH")} รายการ`,
      subtitle: "ควรตรวจสอบสต็อก",
      icon: "⚠️",
      valueClass: "text-red-600",
      iconBg: "bg-red-50",
    },
  ];

  const paymentCards = [
    {
      title: "เงินสด",
      value: dashboard.paymentSummary.cash,
      icon: "💵",
      valueClass: "text-green-600",
    },
    {
      title: "QR Payment",
      value: dashboard.paymentSummary.qr,
      icon: "📱",
      valueClass: "text-blue-600",
    },
    {
      title: "บัตร",
      value: dashboard.paymentSummary.card,
      icon: "💳",
      valueClass: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-4 sm:px-5 sm:py-6 lg:px-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl sm:h-11 sm:w-11">
                📊
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-800 sm:text-2xl lg:text-3xl">
                  Dashboard
                </h1>

                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                  ภาพรวมระบบ Convenience POS
                </p>
              </div>
            </div>

            <button
              onClick={loadDashboard}
              disabled={loading}
              className="
                flex
                h-10
                w-full
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-blue-600
                px-4
                text-sm
                font-medium
                text-white
                transition
                hover:bg-blue-700
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-50
                sm:w-auto
              "
            >
              <span>{loading ? "⏳" : "🔄"}</span>

              <span>
                {loading
                  ? "กำลังโหลด..."
                  : "รีเฟรชข้อมูล"}
              </span>
            </button>

          </div>
        </div>

        {/* FILTER */}
        <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm sm:p-5">

          <div className="mb-3">
            <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
              เลือกช่วงเวลา
            </h2>

            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              เลือกช่วงเวลาที่ต้องการดูข้อมูล
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">

            {[
              ["today", "วันนี้"],
              ["yesterday", "เมื่อวาน"],
              ["thisMonth", "เดือนนี้"],
              ["lastMonth", "เดือนที่แล้ว"],
              ["thisYear", "ปีนี้"],
              ["custom", "กำหนดเอง"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => {
                  if (value === "custom") {
                    setFilter("custom");
                  } else {
                    updateFilter(value);
                  }
                }}
                className={`
                  min-h-0
                  rounded-md
                  px-2.5
                  py-1
                  text-[11px]
                  font-medium
                  leading-5
                  transition
                  sm:px-3
                  sm:py-1
                  sm:text-xs
                  ${
                    filter === value
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }
                `}
              >
                {label}
              </button>
            ))}

          </div>

          {/* CUSTOM DATE */}
          {filter === "custom" && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600 sm:text-sm">
                  วันที่เริ่มต้น
                </label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setFilter("custom");
                  }}
                  className="
                    h-10
                    w-full
                    rounded-lg
                    border
                    border-slate-200
                    bg-slate-50
                    px-3
                    text-sm
                    text-slate-700
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:bg-white
                    focus:ring-2
                    focus:ring-blue-500/10
                  "
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600 sm:text-sm">
                  วันที่สิ้นสุด
                </label>

                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setFilter("custom");
                  }}
                  className="
                    h-10
                    w-full
                    rounded-lg
                    border
                    border-slate-200
                    bg-slate-50
                    px-3
                    text-sm
                    text-slate-700
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:bg-white
                    focus:ring-2
                    focus:ring-blue-500/10
                  "
                />
              </div>

            </div>
          )}

          <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 sm:px-4 sm:text-sm">
            📅 วันที่{" "}
            <span className="font-semibold text-slate-800">
              {startDate}
            </span>{" "}
            ถึง{" "}
            <span className="font-semibold text-slate-800">
              {endDate}
            </span>
          </div>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">

            <div className="flex items-start gap-3">
              <div className="text-xl">
                ⚠️
              </div>

              <div className="min-w-0 flex-1">
                <div className="font-semibold">
                  เกิดข้อผิดพลาด
                </div>

                <div className="mt-1 break-words text-sm">
                  {error}
                </div>

                <div className="mt-2 break-all text-xs text-red-600">
                  Backend: {API_URL}
                </div>

                <button
                  onClick={loadDashboard}
                  className="
                    mt-3
                    rounded-lg
                    bg-red-600
                    px-4
                    py-2
                    text-sm
                    font-medium
                    text-white
                    hover:bg-red-700
                  "
                >
                  ลองใหม่
                </button>
              </div>
            </div>

          </div>
        )}

        {/* MAIN SUMMARY */}
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">

          {summaryCards.map((card) => (
            <div
              key={card.title}
              className="
                rounded-2xl
                bg-white
                p-4
                shadow-sm
                transition
                hover:shadow-md
                sm:p-5
              "
            >
              <div className="flex items-start justify-between gap-2">

                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-slate-500 sm:text-sm">
                    {card.title}
                  </p>

                  <p
                    className={`
                      mt-2
                      break-words
                      text-lg
                      font-bold
                      sm:text-2xl
                      ${card.valueClass}
                    `}
                  >
                    {card.value}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">
                    {card.subtitle}
                  </p>
                </div>

                <div
                  className={`
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    text-lg
                    sm:h-10
                    sm:w-10
                    sm:text-xl
                    ${card.iconBg}
                  `}
                >
                  {card.icon}
                </div>

              </div>
            </div>
          ))}

        </div>

        {/* FINANCE */}
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">

          {financeCards.map((card) => (
            <div
              key={card.title}
              className="
                rounded-2xl
                bg-white
                p-4
                shadow-sm
                transition
                hover:shadow-md
                sm:p-5
              "
            >
              <div className="flex items-start justify-between gap-2">

                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-slate-500 sm:text-sm">
                    {card.title}
                  </p>

                  <p
                    className={`
                      mt-2
                      break-words
                      text-base
                      font-bold
                      sm:text-xl
                      ${card.valueClass}
                    `}
                  >
                    {card.value}
                  </p>

                  {card.subtitle && (
                    <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">
                      {card.subtitle}
                    </p>
                  )}
                </div>

                <div
                  className={`
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    text-base
                    sm:h-10
                    sm:w-10
                    sm:text-lg
                    ${card.iconBg}
                  `}
                >
                  {card.icon}
                </div>

              </div>
            </div>
          ))}

        </div>

        {/* STOCK */}
        <div className="mb-5 grid gap-3 sm:grid-cols-2 sm:gap-4">

          <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-lg sm:h-11 sm:w-11">
                📥
              </div>

              <div className="min-w-0">
                <p className="text-xs text-slate-500 sm:text-sm">
                  สินค้าเข้า
                </p>

                <p className="mt-1 text-xl font-bold text-green-600 sm:text-2xl">
                  {Number(
                    dashboard.stockIn || 0
                  ).toLocaleString("th-TH")}{" "}
                  ชิ้น
                </p>

                <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">
                  จากการรับสินค้า/เพิ่มสต็อก
                </p>
              </div>

            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-lg sm:h-11 sm:w-11">
                📤
              </div>

              <div className="min-w-0">
                <p className="text-xs text-slate-500 sm:text-sm">
                  สินค้าออก
                </p>

                <p className="mt-1 text-xl font-bold text-orange-600 sm:text-2xl">
                  {Number(
                    dashboard.stockOut || 0
                  ).toLocaleString("th-TH")}{" "}
                  ชิ้น
                </p>

                <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">
                  จากการขายสินค้า
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* PAYMENT SUMMARY */}
        <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm sm:p-5 lg:p-6">

          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
                ยอดขายตามช่องทางชำระเงิน
              </h2>

              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                สรุปยอดรวมแต่ละช่องทาง
              </p>
            </div>

            <div className="text-sm font-semibold text-slate-700 sm:text-base">
              รวม{" "}
              <span className="text-blue-600">
                ฿{formatMoney(paymentTotal)}
              </span>
            </div>

          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4">

            {paymentCards.map((card) => (
              <div
                key={card.title}
                className="rounded-xl bg-slate-50 p-3 sm:p-4"
              >
                <div className="mb-2 text-lg sm:text-xl">
                  {card.icon}
                </div>

                <p className="truncate text-[11px] text-slate-500 sm:text-sm">
                  {card.title}
                </p>

                <p
                  className={`
                    mt-1
                    break-words
                    text-sm
                    font-bold
                    sm:text-xl
                    ${card.valueClass}
                  `}
                >
                  ฿{formatMoney(card.value)}
                </p>
              </div>
            ))}

          </div>

        </div>

        {/* RECENT BILLS */}
        <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm sm:p-5 lg:p-6">

          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
              รายการขายล่าสุด
            </h2>

            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              แสดงสูงสุด 10 รายการ
            </p>
          </div>

          {dashboard.recentBills.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">
              ไม่พบรายการขายในช่วงเวลานี้
            </div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="space-y-3 md:hidden">

                {dashboard.recentBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400">
                          เลขที่บิล
                        </p>

                        <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                          {bill.id}
                        </p>
                      </div>

                      <div className="shrink-0 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                        {paymentLabel(
                          bill.paymentMethod
                        )}
                      </div>

                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-200 pt-3">

                      <div>
                        <p className="text-[10px] text-slate-400">
                          วันที่
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          {bill.createdAt
                            ? new Date(
                                bill.createdAt
                              ).toLocaleString(
                                "th-TH"
                              )
                            : "-"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] text-slate-400">
                          ส่วนลด
                        </p>

                        <p className="mt-1 text-xs font-medium text-red-600">
                          ฿
                          {formatMoney(
                            bill.discountAmount
                          )}
                        </p>
                      </div>

                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">

                      <span className="text-xs text-slate-500">
                        ยอดสุทธิ
                      </span>

                      <span className="text-base font-bold text-green-600">
                        ฿
                        {formatMoney(
                          bill.netTotal
                        )}
                      </span>

                    </div>

                  </div>
                ))}

              </div>

              {/* DESKTOP */}
              <div className="hidden overflow-x-auto md:block">

                <table className="w-full min-w-[700px]">

                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs text-slate-500 sm:text-sm">

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

                    {dashboard.recentBills.map(
                      (bill) => (
                        <tr
                          key={bill.id}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                        >

                          <td className="px-3 py-3 font-medium text-slate-800">
                            {bill.id}
                          </td>

                          <td className="px-3 py-3 text-sm text-slate-600">
                            {bill.createdAt
                              ? new Date(
                                  bill.createdAt
                                ).toLocaleString(
                                  "th-TH"
                                )
                              : "-"}
                          </td>

                          <td className="px-3 py-3 text-sm">
                            {paymentLabel(
                              bill.paymentMethod
                            )}
                          </td>

                          <td className="px-3 py-3 text-right text-sm font-medium text-red-600">
                            ฿
                            {formatMoney(
                              bill.discountAmount
                            )}
                          </td>

                          <td className="px-3 py-3 text-right text-sm font-bold text-green-600">
                            ฿
                            {formatMoney(
                              bill.netTotal
                            )}
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>
            </>
          )}

        </div>

        {/* LOW STOCK */}
        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5 lg:p-6">

          <div className="mb-4 flex items-start gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-lg sm:h-11 sm:w-11">
              ⚠️
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
                สินค้าใกล้หมด
              </h2>

              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                สินค้าที่มีสต็อกไม่เกิน 10 ชิ้น
              </p>
            </div>

          </div>

          {dashboard.lowStockProducts.length === 0 ? (
            <div className="rounded-xl bg-green-50 p-6 text-center text-sm font-medium text-green-700">
              ✅ ไม่มีสินค้าใกล้หมด
            </div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="space-y-3 md:hidden">

                {dashboard.lowStockProducts.map(
                  (product) => (
                    <div
                      key={product.id}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-400">
                            รหัสสินค้า
                          </p>

                          <p className="mt-1 font-semibold text-slate-800">
                            {product.id}
                          </p>

                          <p className="mt-1 truncate text-sm text-slate-600">
                            {product.name}
                          </p>
                        </div>

                        <div
                          className={`
                            shrink-0
                            rounded-lg
                            px-3
                            py-2
                            text-center
                            ${
                              Number(
                                product.stock
                              ) <= 5
                                ? "bg-red-50 text-red-600"
                                : "bg-orange-50 text-orange-600"
                            }
                          `}
                        >
                          <p className="text-[10px]">
                            คงเหลือ
                          </p>

                          <p className="mt-0.5 text-sm font-bold">
                            {Number(
                              product.stock || 0
                            ).toLocaleString(
                              "th-TH"
                            )}{" "}
                            ชิ้น
                          </p>
                        </div>

                      </div>

                      <div className="mt-3 border-t border-slate-200 pt-3">
                        <p className="text-[10px] text-slate-400">
                          Barcode
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          {product.barcode || "-"}
                        </p>
                      </div>

                    </div>
                  )
                )}

              </div>

              {/* DESKTOP */}
              <div className="hidden overflow-x-auto md:block">

                <table className="w-full min-w-[600px]">

                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs text-slate-500 sm:text-sm">

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

                    {dashboard.lowStockProducts.map(
                      (product) => (
                        <tr
                          key={product.id}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                        >

                          <td className="px-3 py-3 font-semibold text-slate-800">
                            {product.id}
                          </td>

                          <td className="px-3 py-3 text-sm text-slate-700">
                            {product.name}
                          </td>

                          <td className="px-3 py-3 text-sm text-slate-500">
                            {product.barcode || "-"}
                          </td>

                          <td
                            className={`
                              px-3
                              py-3
                              text-right
                              text-sm
                              font-bold
                              ${
                                Number(
                                  product.stock
                                ) <= 5
                                  ? "text-red-600"
                                  : "text-orange-600"
                              }
                            `}
                          >
                            {Number(
                              product.stock || 0
                            ).toLocaleString(
                              "th-TH"
                            )}{" "}
                            ชิ้น
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}