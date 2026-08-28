export default function Dashboard() {
  return (
    <div className="p-8">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Dashboard
        </h1>

        <p className="text-slate-500 mt-1">
          ภาพรวมระบบร้านค้าประจำวัน
        </p>
      </div>

      <div className="grid grid-cols-4 gap-5">

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-slate-500">
            ยอดขายวันนี้
          </p>

          <h2 className="text-3xl font-bold mt-2">
            ฿125,450
          </h2>

          <p className="text-green-600 text-sm mt-2">
            ↑ 12.5% จากเมื่อวาน
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-slate-500">
            จำนวนบิล
          </p>

          <h2 className="text-3xl font-bold mt-2">
            1,284
          </h2>

          <p className="text-green-600 text-sm mt-2">
            ↑ 8.2%
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-slate-500">
            กำไรวันนี้
          </p>

          <h2 className="text-3xl font-bold mt-2 text-green-600">
            ฿32,540
          </h2>

          <p className="text-slate-400 text-sm mt-2">
            Margin 25.9%
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-slate-500">
            สินค้าใกล้หมด
          </p>

          <h2 className="text-3xl font-bold mt-2 text-red-500">
            18
          </h2>

          <p className="text-red-500 text-sm mt-2">
            ต้องตรวจสอบ
          </p>
        </div>

      </div>

    </div>
  );
}
