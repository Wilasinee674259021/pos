import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const PRODUCT_API = `${API_URL}/api/products`;
const MEMBER_API = `${API_URL}/api/members`;
const SALE_API = `${API_URL}/api/sales`;

export default function POS() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);

  const [phone, setPhone] = useState("");
  const [member, setMember] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [receivedAmount, setReceivedAmount] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // ======================================
  // LOAD PRODUCTS
  // ======================================

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);

      const response = await fetch(PRODUCT_API);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "โหลดสินค้าไม่สำเร็จ");
      }

      setProducts(result.data || []);
    } catch (error) {
      console.error("LOAD PRODUCTS ERROR:", error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ======================================
  // SEARCH PRODUCT
  // ======================================

  const searchProduct = async () => {
    const keyword = search.trim();

    if (!keyword) {
      return;
    }

    try {
      if (/^\d+$/.test(keyword)) {
        const response = await fetch(
          `${PRODUCT_API}/barcode/${keyword}`,
        );

        const result = await response.json();

        if (result.success && result.data) {
          addToCart(result.data);
          setSearch("");
          return;
        }
      }

      const response = await fetch(
        `${PRODUCT_API}/search/${encodeURIComponent(keyword)}`,
      );

      const result = await response.json();

      if (result.success && result.data?.length > 0) {
        addToCart(result.data[0]);
        setSearch("");
      } else {
        alert("ไม่พบสินค้า");
      }
    } catch (error) {
      console.error("SEARCH PRODUCT ERROR:", error);
      alert("ค้นหาสินค้าไม่สำเร็จ");
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      searchProduct();
    }
  };

  // ======================================
  // ADD TO CART
  // ======================================

  const addToCart = (product) => {
    if (Number(product.stock) <= 0) {
      alert("สินค้านี้หมด Stock");
      return;
    }

    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.id === product.id,
      );

      if (existing) {
        if (existing.quantity >= Number(product.stock)) {
          alert("สินค้าใน Stock ไม่เพียงพอ");
          return currentCart;
        }

        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  // ======================================
  // QUANTITY
  // ======================================

  const increaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (item.id !== id) {
          return item;
        }

        if (item.quantity >= Number(item.stock)) {
          alert("สินค้าใน Stock ไม่เพียงพอ");
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      }),
    );
  };

  const decreaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (id) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id),
    );
  };

  // ======================================
  // TOTAL
  // ======================================

  const totalAmount = cart.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0,
  );

  // ======================================
  // SEARCH MEMBER
  // ======================================

  const searchMember = async () => {
    const cleanPhone = phone.replace(/\D/g, "");

    if (!/^\d{10}$/.test(cleanPhone)) {
      alert("กรุณากรอกเบอร์โทรศัพท์ 10 หลัก");
      return;
    }

    try {
      const response = await fetch(
        `${MEMBER_API}/phone/${cleanPhone}`,
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setMember(null);
        alert("ไม่พบสมาชิก");
        return;
      }

      setMember(result.data);
    } catch (error) {
      console.error("SEARCH MEMBER ERROR:", error);
      alert("ค้นหาสมาชิกไม่สำเร็จ");
    }
  };

  // ======================================
  // PAYMENT
  // ======================================

  const received = Number(receivedAmount || 0);

  const change =
    paymentMethod === "cash"
      ? Math.max(received - totalAmount, 0)
      : 0;

  const handlePayment = async () => {
    if (cart.length === 0) {
      alert("กรุณาเพิ่มสินค้าลงตะกร้าก่อน");
      return;
    }

    if (
      paymentMethod === "cash" &&
      received < totalAmount
    ) {
      alert("จำนวนเงินที่รับมาไม่เพียงพอ");
      return;
    }

    const confirmPayment = window.confirm(
      `ยืนยันการชำระเงิน ${totalAmount.toLocaleString(
        "th-TH",
        {
          minimumFractionDigits: 2,
        },
      )} บาท ?`,
    );

    if (!confirmPayment) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(SALE_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId: member?.id || null,

          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),

          paymentMethod,

          receivedAmount:
            paymentMethod === "cash"
              ? received
              : totalAmount,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(result.message || "ชำระเงินไม่สำเร็จ");
        return;
      }

      alert(
        `ชำระเงินสำเร็จ\n\n` +
          `เลขที่บิล: ${result.data.saleId}\n` +
          `ยอดรวม: ${Number(
            result.data.totalAmount,
          ).toLocaleString("th-TH", {
            minimumFractionDigits: 2,
          })} บาท\n` +
          `เงินทอน: ${Number(
            result.data.changeAmount,
          ).toLocaleString("th-TH", {
            minimumFractionDigits: 2,
          })} บาท\n` +
          `ได้รับ Points: ${result.data.earnedPoints}`,
      );

      setCart([]);
      setMember(null);
      setPhone("");
      setReceivedAmount("");

      await loadProducts();
    } catch (error) {
      console.error("PAYMENT ERROR:", error);
      alert("ไม่สามารถเชื่อมต่อ Backend ได้");
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // FILTER PRODUCTS
  // ======================================

  const filteredProducts = products.filter((product) => {
    const keyword = search.toLowerCase();

    return (
      product.name?.toLowerCase().includes(keyword) ||
      product.barcode?.toLowerCase().includes(keyword)
    );
  });

  // ======================================
  // UI
  // ======================================

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">
          🧾 POS คิดเงิน
        </h1>

        <p className="text-slate-500">
          ระบบขายหน้าร้าน
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* PRODUCTS */}

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-5">

            <div className="flex gap-3 mb-5">
              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                onKeyDown={handleSearchKeyDown}
                placeholder="🔍 สแกน Barcode หรือค้นหาสินค้า"
                className="flex-1 border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={searchProduct}
                className="bg-blue-600 text-white px-6 rounded-lg font-bold"
              >
                ค้นหา
              </button>
            </div>

            {loadingProducts ? (
              <div className="text-center text-slate-400 py-10">
                กำลังโหลดสินค้า...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center text-slate-400 py-10">
                ยังไม่มีสินค้า
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={Number(product.stock) <= 0}
                    className="text-left border border-slate-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-md transition disabled:opacity-40"
                  >
                    <div className="font-bold text-lg">
                      {product.name}
                    </div>

                    <div className="text-sm text-slate-400 mt-1">
                      {product.barcode}
                    </div>

                    <div className="text-blue-600 font-bold text-xl mt-3">
                      ฿
                      {Number(
                        product.price,
                      ).toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                      })}
                    </div>

                    <div className="text-sm mt-2">
                      Stock:{" "}
                      <span className="font-bold">
                        {product.stock}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CART */}

        <div>
          <div className="bg-white rounded-xl shadow-sm p-5">

            <h2 className="text-xl font-bold mb-4">
              🛒 รายการสินค้า
            </h2>

            {cart.length === 0 ? (
              <div className="text-center text-slate-400 py-10">
                ยังไม่มีสินค้า
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="border-b pb-4"
                  >
                    <div className="flex justify-between">
                      <div className="font-medium">
                        {item.name}
                      </div>

                      <button
                        onClick={() =>
                          removeFromCart(item.id)
                        }
                        className="text-red-500"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex justify-between items-center mt-2">

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            decreaseQuantity(item.id)
                          }
                          className="w-8 h-8 bg-slate-200 rounded"
                        >
                          −
                        </button>

                        <span className="font-bold">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            increaseQuantity(item.id)
                          }
                          className="w-8 h-8 bg-slate-200 rounded"
                        >
                          +
                        </button>
                      </div>

                      <div className="font-bold">
                        ฿
                        {(
                          Number(item.price) *
                          item.quantity
                        ).toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                        })}
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* MEMBER */}

            <div className="border-t mt-5 pt-5">
              <h3 className="font-bold mb-3">
                👤 สมาชิก
              </h3>

              <div className="flex gap-2">
                <input
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value.replace(
                        /\D/g,
                        "",
                      ),
                    )
                  }
                  placeholder="เบอร์โทรสมาชิก"
                  maxLength={10}
                  className="flex-1 border rounded-lg px-3 py-2"
                />

                <button
                  onClick={searchMember}
                  className="bg-slate-800 text-white px-4 rounded-lg"
                >
                  ค้นหา
                </button>
              </div>

              {member && (
                <div className="bg-green-50 text-green-700 rounded-lg p-3 mt-3">
                  <div className="font-bold">
                    {member.name}
                  </div>

                  <div className="text-sm">
                    Points: {member.points || 0}
                  </div>
                </div>
              )}
            </div>

            {/* TOTAL */}

            <div className="border-t mt-5 pt-5">
              <div className="flex justify-between text-2xl font-bold">
                <span>ยอดรวม</span>

                <span className="text-blue-600">
                  ฿
                  {totalAmount.toLocaleString(
                    "th-TH",
                    {
                      minimumFractionDigits: 2,
                    },
                  )}
                </span>
              </div>
            </div>

            {/* PAYMENT */}

            <div className="mt-5">
              <h3 className="font-bold mb-3">
                💳 วิธีชำระเงิน
              </h3>

              <div className="grid grid-cols-3 gap-2">

                <button
                  onClick={() =>
                    setPaymentMethod("cash")
                  }
                  className={`p-3 rounded-lg font-bold ${
                    paymentMethod === "cash"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100"
                  }`}
                >
                  💵 เงินสด
                </button>

                <button
                  onClick={() =>
                    setPaymentMethod("qr")
                  }
                  className={`p-3 rounded-lg font-bold ${
                    paymentMethod === "qr"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100"
                  }`}
                >
                  📱 QR
                </button>

                <button
                  onClick={() =>
                    setPaymentMethod("card")
                  }
                  className={`p-3 rounded-lg font-bold ${
                    paymentMethod === "card"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100"
                  }`}
                >
                  💳 บัตร
                </button>

              </div>
            </div>

            {/* CASH */}

            {paymentMethod === "cash" && (
              <div className="mt-4">

                <label className="block font-medium mb-2">
                  รับเงิน
                </label>

                <input
                  type="number"
                  min="0"
                  value={receivedAmount}
                  onChange={(e) =>
                    setReceivedAmount(
                      e.target.value,
                    )
                  }
                  placeholder="จำนวนเงินที่รับ"
                  className="w-full border rounded-lg px-4 py-3 text-lg"
                />

                <div className="flex justify-between mt-3">
                  <span>เงินทอน</span>

                  <span className="font-bold text-green-600">
                    ฿
                    {change.toLocaleString(
                      "th-TH",
                      {
                        minimumFractionDigits: 2,
                      },
                    )}
                  </span>
                </div>

              </div>
            )}

            {/* PAY */}

            <button
              onClick={handlePayment}
              disabled={
                loading || cart.length === 0
              }
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white py-4 rounded-xl mt-6 text-xl font-bold"
            >
              {loading
                ? "กำลังชำระเงิน..."
                : `💰 ชำระเงิน ฿${totalAmount.toLocaleString(
                    "th-TH",
                    {
                      minimumFractionDigits: 2,
                    },
                  )}`}
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}