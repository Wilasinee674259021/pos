import { useEffect, useState } from "react";

const defaultSuppliers = [
  {
    id: 1,
    name: "บริษัท ไทยเบฟเวอเรจ จำกัด",
    phone: "02-123-4567",
  },
  {
    id: 2,
    name: "บริษัท ซีพี ออลล์ จำกัด",
    phone: "02-345-6789",
  },
  {
    id: 3,
    name: "บริษัท ยูนิลีเวอร์ ไทย เทรดดิ้ง จำกัด",
    phone: "02-555-8888",
  },
];

export default function Purchasing() {
  const [suppliers] = useState(
    defaultSuppliers
  );

  const [purchases, setPurchases] =
    useState(() => {
      const saved =
        localStorage.getItem(
          "pos_purchases"
        );

      return saved
        ? JSON.parse(saved)
        : [];
    });

  const [stock, setStock] = useState(
    () => {
      const saved =
        localStorage.getItem(
          "pos_stock"
        );

      return saved
        ? JSON.parse(saved)
        : [];
    }
  );

  const [showForm, setShowForm] =
    useState(false);

  const [selectedSupplier, setSelectedSupplier] =
    useState("");

  const [invoiceNumber, setInvoiceNumber] =
    useState("");

  const [purchaseDate, setPurchaseDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [items, setItems] = useState([]);

  const [selectedProduct, setSelectedProduct] =
    useState("");

  const [quantity, setQuantity] =
    useState("");

  const [cost, setCost] =
    useState("");

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    localStorage.setItem(
      "pos_purchases",
      JSON.stringify(purchases)
    );
  }, [purchases]);

  // =========================
  // SUMMARY
  // =========================

  const totalPurchases =
    purchases.length;

  const totalItems =
    purchases.reduce(
      (sum, purchase) =>
        sum + Number(purchase.totalItems),
      0
    );

  const totalCost =
    purchases.reduce(
      (sum, purchase) =>
        sum + Number(purchase.totalCost),
      0
    );

  // =========================
  // ADD ITEM
  // =========================

  const addItem = () => {
    if (!selectedProduct) {
      alert("กรุณาเลือกสินค้า");
      return;
    }

    if (
      !quantity ||
      Number(quantity) <= 0
    ) {
      alert(
        "กรุณากรอกจำนวนสินค้า"
      );
      return;
    }

    if (
      !cost ||
      Number(cost) < 0
    ) {
      alert(
        "กรุณากรอกราคาทุน"
      );
      return;
    }

    const product =
      stock.find(
        (item) =>
          item.id ===
          Number(selectedProduct)
      );

    if (!product) {
      alert(
        "ไม่พบสินค้านี้ในสต๊อก"
      );
      return;
    }

    const newItem = {
      id: Date.now(),
      productId: product.id,
      code: product.code,
      name: product.name,
      quantity: Number(quantity),
      cost: Number(cost),
      total:
        Number(quantity) *
        Number(cost),
    };

    setItems([
      ...items,
      newItem,
    ]);

    setSelectedProduct("");
    setQuantity("");
    setCost("");
  };

  // =========================
  // REMOVE ITEM
  // =========================

  const removeItem = (id) => {
    setItems(
      items.filter(
        (item) =>
          item.id !== id
      )
    );
  };

  // =========================
  // SAVE PURCHASE
  // =========================

  const savePurchase = () => {
    if (!selectedSupplier) {
      alert(
        "กรุณาเลือก Supplier"
      );
      return;
    }

    if (!invoiceNumber) {
      alert(
        "กรุณากรอกเลขที่ใบรับสินค้า"
      );
      return;
    }

    if (items.length === 0) {
      alert(
        "กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ"
      );
      return;
    }

    const supplier =
      suppliers.find(
        (item) =>
          item.id ===
          Number(selectedSupplier)
      );

    const totalItems =
      items.reduce(
        (sum, item) =>
          sum + item.quantity,
        0
      );

    const totalCost =
      items.reduce(
        (sum, item) =>
          sum + item.total,
        0
      );

    // เพิ่มสินค้าเข้า Stock
    const updatedStock =
      stock.map((product) => {
        const purchaseItem =
          items.find(
            (item) =>
              item.productId ===
              product.id
          );

        if (!purchaseItem) {
          return product;
        }

        return {
          ...product,
          stock:
            Number(product.stock) +
            Number(
              purchaseItem.quantity
            ),
        };
      });

    setStock(updatedStock);

    localStorage.setItem(
      "pos_stock",
      JSON.stringify(
        updatedStock
      )
    );

    // สร้างรายการรับสินค้า
    const newPurchase = {
      id: Date.now(),
      invoiceNumber,
      supplier:
        supplier?.name || "-",
      date: purchaseDate,
      totalItems,
      totalCost,
      items,
    };

    setPurchases([
      newPurchase,
      ...purchases,
    ]);

    alert(
      "บันทึกการรับสินค้าเรียบร้อย\nสินค้าได้ถูกเพิ่มเข้าสู่สต๊อกแล้ว"
    );

    closeForm();
  };

  // =========================
  // CLOSE FORM
  // =========================

  const closeForm = () => {
    setShowForm(false);
    setSelectedSupplier("");
    setInvoiceNumber("");

    setPurchaseDate(
      new Date()
        .toISOString()
        .split("T")[0]
    );

    setItems([]);
    setSelectedProduct("");
    setQuantity("");
    setCost("");
  };

  // =========================
  // SEARCH
  // =========================

  const filteredPurchases =
    purchases.filter(
      (purchase) =>
        purchase.invoiceNumber
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        purchase.supplier
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  return (
    <div className="p-8 bg-slate-50 min-h-screen">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-7">

        <div>

          <h1 className="text-3xl font-bold text-slate-800">
            🚚 จัดซื้อ / รับสินค้า
          </h1>

          <p className="text-slate-500 mt-1">
            จัดการการสั่งซื้อและรับสินค้าเข้าสต๊อก
          </p>

        </div>

        <button
          onClick={() =>
            setShowForm(true)
          }
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700"
        >
          ＋ รับสินค้าเข้า
        </button>

      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-3 gap-4 mb-6">

        <div className="bg-white rounded-2xl p-5 shadow-sm">

          <p className="text-slate-500">
            รายการรับสินค้าทั้งหมด
          </p>

          <p className="text-3xl font-bold mt-2">
            {totalPurchases}
          </p>

          <p className="text-sm text-slate-400">
            รายการ
          </p>

        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">

          <p className="text-slate-500">
            จำนวนสินค้าที่รับเข้า
          </p>

          <p className="text-3xl font-bold text-blue-600 mt-2">
            {totalItems}
          </p>

          <p className="text-sm text-slate-400">
            ชิ้น
          </p>

        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">

          <p className="text-slate-500">
            มูลค่าการจัดซื้อ
          </p>

          <p className="text-3xl font-bold text-green-600 mt-2">
            ฿
            {totalCost.toLocaleString()}
          </p>

        </div>

      </div>

      {/* SEARCH */}

      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">

        <input
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          placeholder="🔍 ค้นหาเลขที่ใบรับสินค้า / Supplier"
          className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />

      </div>

      {/* PURCHASE TABLE */}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="text-left p-4">
                เลขที่ใบรับสินค้า
              </th>

              <th className="text-left p-4">
                Supplier
              </th>

              <th className="text-center p-4">
                วันที่
              </th>

              <th className="text-center p-4">
                จำนวน
              </th>

              <th className="text-right p-4">
                มูลค่า
              </th>

              <th className="text-center p-4">
                รายละเอียด
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredPurchases.map(
              (purchase) => (

                <tr
                  key={purchase.id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="p-4 font-bold">
                    {purchase.invoiceNumber}
                  </td>

                  <td className="p-4">
                    {purchase.supplier}
                  </td>

                  <td className="p-4 text-center">
                    {purchase.date}
                  </td>

                  <td className="p-4 text-center">
                    {purchase.totalItems}
                    {" "}ชิ้น
                  </td>

                  <td className="p-4 text-right font-bold">
                    ฿
                    {purchase.totalCost.toLocaleString()}
                  </td>

                  <td className="p-4 text-center">

                    <button
                      onClick={() =>
                        alert(
                          purchase.items
                            .map(
                              (item) =>
                                `${item.name} x ${item.quantity}`
                            )
                            .join("\n")
                        )
                      }
                      className="bg-blue-100 text-blue-600 px-3 py-2 rounded-lg"
                    >
                      👁️ ดูสินค้า
                    </button>

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

        {filteredPurchases.length ===
          0 && (

          <div className="text-center py-12 text-slate-400">
            ยังไม่มีประวัติการรับสินค้า
          </div>

        )}

      </div>

      {/* =========================
          RECEIVE PRODUCT MODAL
      ========================= */}

      {showForm && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl w-[850px] max-h-[90vh] overflow-y-auto p-7 shadow-xl">

            {/* TITLE */}

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-2xl font-bold">
                🚚 รับสินค้าเข้า
              </h2>

              <button
                onClick={closeForm}
                className="text-xl text-slate-500"
              >
                ✕
              </button>

            </div>

            {/* BASIC INFO */}

            <div className="grid grid-cols-2 gap-4 mb-6">

              <div>

                <label className="block mb-2 font-medium">
                  Supplier
                </label>

                <select
                  value={selectedSupplier}
                  onChange={(e) =>
                    setSelectedSupplier(
                      e.target.value
                    )
                  }
                  className="w-full border rounded-lg p-3"
                >

                  <option value="">
                    -- เลือก Supplier --
                  </option>

                  {suppliers.map(
                    (supplier) => (

                      <option
                        key={supplier.id}
                        value={supplier.id}
                      >
                        {supplier.name}
                      </option>

                    )
                  )}

                </select>

              </div>

              <div>

                <label className="block mb-2 font-medium">
                  เลขที่ใบรับสินค้า
                </label>

                <input
                  value={invoiceNumber}
                  onChange={(e) =>
                    setInvoiceNumber(
                      e.target.value
                    )
                  }
                  placeholder="เช่น PO-2026-001"
                  className="w-full border rounded-lg p-3"
                />

              </div>

              <div>

                <label className="block mb-2 font-medium">
                  วันที่รับสินค้า
                </label>

                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) =>
                    setPurchaseDate(
                      e.target.value
                    )
                  }
                  className="w-full border rounded-lg p-3"
                />

              </div>

            </div>

            {/* ADD PRODUCT */}

            <div className="bg-slate-50 rounded-xl p-5 mb-6">

              <h3 className="font-bold mb-4">
                เพิ่มสินค้า
              </h3>

              <div className="grid grid-cols-4 gap-3">

                <select
                  value={selectedProduct}
                  onChange={(e) =>
                    setSelectedProduct(
                      e.target.value
                    )
                  }
                  className="border rounded-lg p-3 col-span-2"
                >

                  <option value="">
                    -- เลือกสินค้า --
                  </option>

                  {stock.map(
                    (product) => (

                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.code} -{" "}
                        {product.name}
                      </option>

                    )
                  )}

                </select>

                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      e.target.value
                    )
                  }
                  placeholder="จำนวน"
                  className="border rounded-lg p-3"
                />

                <input
                  type="number"
                  min="0"
                  value={cost}
                  onChange={(e) =>
                    setCost(
                      e.target.value
                    )
                  }
                  placeholder="ราคาทุน / ชิ้น"
                  className="border rounded-lg p-3"
                />

              </div>

              <button
                onClick={addItem}
                className="mt-3 bg-blue-600 text-white px-5 py-2 rounded-lg"
              >
                ＋ เพิ่มรายการ
              </button>

            </div>

            {/* ITEMS */}

            {items.length > 0 && (

              <div className="mb-6">

                <h3 className="font-bold mb-3">
                  รายการสินค้า
                </h3>

                <div className="border rounded-xl overflow-hidden">

                  <table className="w-full">

                    <thead className="bg-slate-100">

                      <tr>

                        <th className="p-3 text-left">
                          สินค้า
                        </th>

                        <th className="p-3 text-center">
                          จำนวน
                        </th>

                        <th className="p-3 text-right">
                          ราคาทุน
                        </th>

                        <th className="p-3 text-right">
                          รวม
                        </th>

                        <th className="p-3">
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {items.map(
                        (item) => (

                          <tr
                            key={item.id}
                            className="border-t"
                          >

                            <td className="p-3">
                              {item.name}
                            </td>

                            <td className="p-3 text-center">
                              {item.quantity}
                            </td>

                            <td className="p-3 text-right">
                              ฿
                              {item.cost.toLocaleString()}
                            </td>

                            <td className="p-3 text-right font-bold">
                              ฿
                              {item.total.toLocaleString()}
                            </td>

                            <td className="p-3 text-center">

                              <button
                                onClick={() =>
                                  removeItem(
                                    item.id
                                  )
                                }
                                className="text-red-500"
                              >
                                🗑️
                              </button>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

                <div className="text-right mt-4 text-xl font-bold">

                  รวมทั้งสิ้น: ฿
                  {items
                    .reduce(
                      (sum, item) =>
                        sum +
                        item.total,
                      0
                    )
                    .toLocaleString()}

                </div>

              </div>

            )}

            {/* BUTTON */}

            <div className="flex gap-3">

              <button
                onClick={closeForm}
                className="flex-1 border rounded-lg py-3"
              >
                ยกเลิก
              </button>

              <button
                onClick={savePurchase}
                className="flex-1 bg-green-600 text-white rounded-lg py-3 font-bold"
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