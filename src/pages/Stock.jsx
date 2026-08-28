import { useEffect, useState } from "react";

const defaultProducts = [
  {
    id: 1,
    code: "P001",
    name: "น้ำดื่ม 600ml",
    category: "เครื่องดื่ม",
    stock: 50,
    minStock: 10,
  },
  {
    id: 2,
    code: "P002",
    name: "กาแฟกระป๋อง",
    category: "เครื่องดื่ม",
    stock: 30,
    minStock: 10,
  },
  {
    id: 3,
    code: "P003",
    name: "ขนมปัง",
    category: "อาหาร",
    stock: 25,
    minStock: 5,
  },
  {
    id: 4,
    code: "P004",
    name: "นม UHT",
    category: "เครื่องดื่ม",
    stock: 40,
    minStock: 10,
  },
  {
    id: 5,
    code: "P005",
    name: "มันฝรั่งทอด",
    category: "ขนม",
    stock: 20,
    minStock: 5,
  },
];

export default function Stock() {
  const [products, setProducts] = useState(() => {
    const saved =
      localStorage.getItem("pos_stock");

    return saved
      ? JSON.parse(saved)
      : defaultProducts;
  });

  const [search, setSearch] = useState("");

  const [category, setCategory] =
    useState("ทั้งหมด");

  const [showModal, setShowModal] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [stockType, setStockType] =
    useState("in");

  const [amount, setAmount] =
    useState("");

  const [note, setNote] =
    useState("");

  useEffect(() => {
    localStorage.setItem(
      "pos_stock",
      JSON.stringify(products)
    );
  }, [products]);

  // =========================
  // FILTER
  // =========================

  const filteredProducts =
    products.filter((product) => {
      const matchSearch =
        product.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        product.code
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchCategory =
        category === "ทั้งหมด" ||
        product.category === category;

      return (
        matchSearch &&
        matchCategory
      );
    });

  // =========================
  // SUMMARY
  // =========================

  const totalProducts =
    products.length;

  const totalStock =
    products.reduce(
      (sum, product) =>
        sum + Number(product.stock),
      0
    );

  const lowStockProducts =
    products.filter(
      (product) =>
        product.stock > 0 &&
        product.stock <= product.minStock
    ).length;

  const outOfStockProducts =
    products.filter(
      (product) =>
        product.stock === 0
    ).length;

  // =========================
  // OPEN STOCK MODAL
  // =========================

  const openStockModal = (
    product,
    type
  ) => {
    setSelectedProduct(product);
    setStockType(type);
    setAmount("");
    setNote("");
    setShowModal(true);
  };

  // =========================
  // UPDATE STOCK
  // =========================

  const updateStock = () => {
    const quantity =
      Number(amount);

    if (
      !amount ||
      quantity <= 0
    ) {
      alert(
        "กรุณากรอกจำนวนที่ถูกต้อง"
      );
      return;
    }

    if (
      stockType === "out" &&
      quantity >
        selectedProduct.stock
    ) {
      alert(
        "จำนวนสินค้าในสต๊อกไม่เพียงพอ"
      );
      return;
    }

    setProducts(
      products.map((product) => {
        if (
          product.id !==
          selectedProduct.id
        ) {
          return product;
        }

        const newStock =
          stockType === "in"
            ? product.stock +
              quantity
            : product.stock -
              quantity;

        return {
          ...product,
          stock: newStock,
        };
      })
    );

    setShowModal(false);

    alert(
      stockType === "in"
        ? "รับสินค้าเข้าสต๊อกเรียบร้อย"
        : "ตัดสินค้าออกจากสต๊อกเรียบร้อย"
    );
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">

      {/* HEADER */}

      <div className="mb-7">

        <h1 className="text-3xl font-bold text-slate-800">
          📦 จัดการสต๊อกสินค้า
        </h1>

        <p className="text-slate-500 mt-1">
          ตรวจสอบ รับเข้า และตัดสินค้าออกจากสต๊อก
        </p>

      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-4 gap-4 mb-6">

        <div className="bg-white rounded-2xl p-5 shadow-sm">

          <p className="text-slate-500">
            สินค้าทั้งหมด
          </p>

          <p className="text-3xl font-bold mt-2">
            {totalProducts}
          </p>

        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">

          <p className="text-slate-500">
            จำนวนสินค้าคงเหลือ
          </p>

          <p className="text-3xl font-bold text-blue-600 mt-2">
            {totalStock}
          </p>

          <p className="text-sm text-slate-400">
            ชิ้น
          </p>

        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">

          <p className="text-slate-500">
            ใกล้หมด
          </p>

          <p className="text-3xl font-bold text-orange-500 mt-2">
            {lowStockProducts}
          </p>

          <p className="text-sm text-slate-400">
            รายการ
          </p>

        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">

          <p className="text-slate-500">
            สินค้าหมด
          </p>

          <p className="text-3xl font-bold text-red-500 mt-2">
            {outOfStockProducts}
          </p>

          <p className="text-sm text-slate-400">
            รายการ
          </p>

        </div>

      </div>

      {/* SEARCH */}

      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">

        <div className="flex gap-3">

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="🔍 ค้นหาชื่อสินค้า / รหัสสินค้า"
            className="flex-1 border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={category}
            onChange={(e) =>
              setCategory(
                e.target.value
              )
            }
            className="border border-slate-300 rounded-lg px-4"
          >

            <option>
              ทั้งหมด
            </option>

            <option>
              เครื่องดื่ม
            </option>

            <option>
              อาหาร
            </option>

            <option>
              ขนม
            </option>

          </select>

        </div>

      </div>

      {/* TABLE */}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="text-left p-4">
                รหัสสินค้า
              </th>

              <th className="text-left p-4">
                สินค้า
              </th>

              <th className="text-left p-4">
                หมวดหมู่
              </th>

              <th className="text-center p-4">
                สต๊อก
              </th>

              <th className="text-center p-4">
                สถานะ
              </th>

              <th className="text-center p-4">
                จัดการ
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredProducts.map(
              (product) => {

                const isOut =
                  product.stock === 0;

                const isLow =
                  product.stock > 0 &&
                  product.stock <=
                    product.minStock;

                return (
                  <tr
                    key={product.id}
                    className="border-t hover:bg-slate-50"
                  >

                    <td className="p-4 font-medium">
                      {product.code}
                    </td>

                    <td className="p-4">

                      <div className="font-bold">
                        {product.name}
                      </div>

                    </td>

                    <td className="p-4">
                      {product.category}
                    </td>

                    <td className="p-4 text-center">

                      <span
                        className={
                          isOut
                            ? "text-red-600 font-bold text-lg"
                            : isLow
                            ? "text-orange-500 font-bold text-lg"
                            : "text-green-600 font-bold text-lg"
                        }
                      >
                        {product.stock}
                      </span>

                      <span className="text-slate-400 ml-1">
                        ชิ้น
                      </span>

                    </td>

                    <td className="p-4 text-center">

                      {isOut ? (

                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                          หมด
                        </span>

                      ) : isLow ? (

                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                          ใกล้หมด
                        </span>

                      ) : (

                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                          ปกติ
                        </span>

                      )}

                    </td>

                    <td className="p-4">

                      <div className="flex justify-center gap-2">

                        <button
                          onClick={() =>
                            openStockModal(
                              product,
                              "in"
                            )
                          }
                          className="bg-green-100 text-green-700 px-3 py-2 rounded-lg"
                        >
                          ＋ รับเข้า
                        </button>

                        <button
                          onClick={() =>
                            openStockModal(
                              product,
                              "out"
                            )
                          }
                          className="bg-red-100 text-red-700 px-3 py-2 rounded-lg"
                        >
                          − ตัดออก
                        </button>

                      </div>

                    </td>

                  </tr>
                );
              }
            )}

          </tbody>

        </table>

        {filteredProducts.length === 0 && (

          <div className="text-center py-12 text-slate-400">
            ไม่พบสินค้า
          </div>

        )}

      </div>

      {/* =========================
          STOCK MODAL
      ========================= */}

      {showModal && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl w-[500px] p-7 shadow-xl">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-2xl font-bold">

                {stockType === "in"
                  ? "📥 รับสินค้าเข้า"
                  : "📤 ตัดสินค้าออก"}

              </h2>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="text-xl text-slate-500"
              >
                ✕
              </button>

            </div>

            {/* PRODUCT */}

            <div className="bg-slate-100 rounded-xl p-4 mb-5">

              <div className="font-bold text-lg">
                {selectedProduct?.name}
              </div>

              <div className="text-sm text-slate-500">
                รหัสสินค้า:{" "}
                {selectedProduct?.code}
              </div>

              <div className="text-sm mt-2">

                สต๊อกปัจจุบัน:{" "}

                <span className="font-bold">
                  {selectedProduct?.stock}
                  {" "}ชิ้น
                </span>

              </div>

            </div>

            {/* AMOUNT */}

            <div className="mb-5">

              <label className="block font-medium mb-2">
                จำนวน
              </label>

              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) =>
                  setAmount(
                    e.target.value
                  )
                }
                placeholder="กรอกจำนวน"
                className="w-full border border-slate-300 rounded-lg p-4 text-lg"
                autoFocus
              />

            </div>

            {/* NOTE */}

            <div className="mb-6">

              <label className="block font-medium mb-2">
                หมายเหตุ
              </label>

              <textarea
                value={note}
                onChange={(e) =>
                  setNote(
                    e.target.value
                  )
                }
                placeholder={
                  stockType === "in"
                    ? "เช่น รับสินค้าจากซัพพลายเออร์"
                    : "เช่น สินค้าชำรุด / หมดอายุ"
                }
                className="w-full border border-slate-300 rounded-lg p-3 h-24"
              />

            </div>

            {/* BUTTON */}

            <div className="flex gap-3">

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="flex-1 border rounded-lg py-3"
              >
                ยกเลิก
              </button>

              <button
                onClick={updateStock}
                className={
                  stockType === "in"
                    ? "flex-1 bg-green-600 text-white rounded-lg py-3 font-bold"
                    : "flex-1 bg-red-600 text-white rounded-lg py-3 font-bold"
                }
              >
                {stockType === "in"
                  ? "📥 ยืนยันรับเข้า"
                  : "📤 ยืนยันตัดออก"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}