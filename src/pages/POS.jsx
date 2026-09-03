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
  const [productError, setProductError] = useState("");

  // ================================
  // LOAD PRODUCTS
  // ================================

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      setProductError("");

      console.log("PRODUCT API:", PRODUCT_API);

      const response = await fetch(PRODUCT_API, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const text = await response.text();

      console.log("PRODUCT RESPONSE:", text);

      let result;

      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(
          `Backend ส่งข้อมูลไม่ใช่ JSON (HTTP ${response.status})`,
        );
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            `โหลดสินค้าไม่สำเร็จ HTTP ${response.status}`,
        );
      }

      if (!result.success) {
        throw new Error(
          result.message || "Backend ไม่ได้ส่ง success=true",
        );
      }

      const productList = Array.isArray(result.data)
        ? result.data
        : [];

      setProducts(productList);

      if (productList.length === 0) {
        setProductError("Backend เชื่อมต่อได้ แต่ไม่มีสินค้า");
      }
    } catch (error) {
      console.error("LOAD PRODUCTS ERROR:", error);

      setProducts([]);

      setProductError(
        error.message ||
          "ไม่สามารถโหลดสินค้าจาก Backend ได้",
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ================================
  // SEARCH PRODUCT
  // ================================

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

        if (response.ok && result.success && result.data) {
          addToCart(result.data);
          setSearch("");
          return;
        }
      }

      const response = await fetch(
        `${PRODUCT_API}/search/${encodeURIComponent(keyword)}`,
      );

      const result = await response.json();

      if (
        response.ok &&
        result.success &&
        Array.isArray(result.data) &&
        result.data.length > 0
      ) {
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

  // ================================
  // ADD TO CART
  // ================================

  const addToCart = (product) => {
    if (!product) {
      return;
    }

    if (Number(product.stock) <= 0) {
      alert("สินค้านี้หมด Stock");
      return;
    }

    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.id === product.id,
      );

      if (existing) {
        if (
          existing.quantity >= Number(product.stock)
        ) {
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

  // ================================
  // QUANTITY
  // ================================

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

  // ================================
  // TOTAL
  // ================================

  const totalAmount = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) * item.quantity,
    0,
  );

  // ================================
  // SEARCH MEMBER
  // ================================

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

  // ================================
  // PAYMENT
  // ================================

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
        alert(
          result.message ||
            "ชำระเงินไม่สำเร็จ",
        );
        return;
      }

      alert(
        `ชำระเงินสำเร็จ\n\n` +
          `เลขที่บิล: ${
            result.data.saleId
          }\n` +
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
          `ได้รับ Points: ${
            result.data.earnedPoints
          }`,
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

  // ================================
  // FILTER PRODUCTS
  // ================================

  const filteredProducts = products.filter(
    (product) => {
      const keyword = search
        .toLowerCase()
        .trim();

      if (!keyword) {
        return true;
      }

      return (
        product.name
          ?.toLowerCase()
          .includes(keyword) ||
        product.barcode
          ?.toLowerCase()
          .includes(keyword)
      );
    },
  );

  // ================================
  // UI
  // ================================

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">

      {/* =================================
          HEADER
      ================================= */}

      <div className="mb-5 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
          🧾 POS คิดเงิน
        </h1>

        <p className="text-sm sm:text-base text-slate-500 mt-1">
          ระบบขายหน้าร้าน
        </p>
      </div>

      {/* =================================
          MAIN LAYOUT
      ================================= */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* =================================
            PRODUCTS
        ================================= */}

        <div className="lg:col-span-2 min-w-0">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5">

            {/* SEARCH */}

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-5">

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                onKeyDown={handleSearchKeyDown}
                placeholder="🔍 สแกน Barcode หรือค้นหาสินค้า"
                className="w-full min-w-0 flex-1 border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={searchProduct}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition"
              >
                ค้นหา
              </button>

            </div>

            {/* LOADING */}

            {loadingProducts ? (
              <div className="text-center text-slate-400 py-10">
                กำลังโหลดสินค้า...
              </div>

            ) : productError ? (

              <div className="rounded-xl bg-red-50 border border-red-200 p-4 sm:p-5 text-red-600">

                <div className="font-bold text-lg mb-2">
                  ❌ โหลดสินค้าไม่สำเร็จ
                </div>

                <div className="text-sm break-all">
                  {productError}
                </div>

                <div className="text-xs mt-3 text-red-400 break-all">
                  API: {PRODUCT_API}
                </div>

                <button
                  onClick={loadProducts}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-bold transition"
                >
                  ลองใหม่
                </button>

              </div>

            ) : filteredProducts.length === 0 ? (

              <div className="text-center text-slate-400 py-10">
                ยังไม่มีสินค้า
              </div>

            ) : (

              /* PRODUCT GRID */

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">

                {filteredProducts.map(
                  (product) => (
                    <button
                      key={product.id}
                      onClick={() =>
                        addToCart(product)
                      }
                      disabled={
                        Number(
                          product.stock,
                        ) <= 0
                      }
                      className="min-w-0 text-left border border-slate-200 rounded-xl p-3 sm:p-4 hover:border-blue-500 hover:shadow-md transition disabled:opacity-40 bg-white"
                    >

                      <div className="font-bold text-sm sm:text-lg break-words line-clamp-2">
                        {product.name}
                      </div>

                      <div className="text-xs sm:text-sm text-slate-400 mt-1 break-all">
                        {product.barcode}
                      </div>

                      <div className="text-blue-600 font-bold text-base sm:text-xl mt-2 sm:mt-3">
                        ฿
                        {Number(
                          product.price || 0,
                        ).toLocaleString(
                          "th-TH",
                          {
                            minimumFractionDigits: 2,
                          },
                        )}
                      </div>

                      <div className="text-xs sm:text-sm mt-2">
                        Stock:{" "}
                        <span className="font-bold">
                          {product.stock}
                        </span>
                      </div>

                    </button>
                  ),
                )}

              </div>
            )}

          </div>
        </div>

        {/* =================================
            CART
        ================================= */}

        <div className="min-w-0">

          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5">

            <h2 className="text-lg sm:text-xl font-bold mb-4">
              🛒 รายการสินค้า
            </h2>

            {/* CART ITEMS */}

            {cart.length === 0 ? (

              <div className="text-center text-slate-400 py-10">
                ยังไม่มีสินค้า
              </div>

            ) : (

              <div className="space-y-4 max-h-[420px] lg:max-h-[480px] overflow-y-auto pr-1">

                {cart.map((item) => (

                  <div
                    key={item.id}
                    className="border-b pb-4"
                  >

                    {/* NAME + DELETE */}

                    <div className="flex items-start justify-between gap-2">

                      <div className="font-medium min-w-0 break-words">
                        {item.name}
                      </div>

                      <button
                        onClick={() =>
                          removeFromCart(
                            item.id,
                          )
                        }
                        className="flex-shrink-0 text-red-500 hover:text-red-700 w-8 h-8 rounded-lg hover:bg-red-50"
                        aria-label="ลบสินค้า"
                      >
                        ✕
                      </button>

                    </div>

                    {/* QUANTITY + PRICE */}

                    <div className="flex items-center justify-between gap-2 mt-2">

                      <div className="flex items-center gap-2 flex-shrink-0">

                        <button
                          onClick={() =>
                            decreaseQuantity(
                              item.id,
                            )
                          }
                          className="w-9 h-9 bg-slate-200 hover:bg-slate-300 rounded-lg font-bold"
                        >
                          −
                        </button>

                        <span className="font-bold min-w-[24px] text-center">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            increaseQuantity(
                              item.id,
                            )
                          }
                          className="w-9 h-9 bg-slate-200 hover:bg-slate-300 rounded-lg font-bold"
                        >
                          +
                        </button>

                      </div>

                      <div className="font-bold text-right break-all">
                        ฿
                        {(
                          Number(
                            item.price || 0,
                          ) *
                          item.quantity
                        ).toLocaleString(
                          "th-TH",
                          {
                            minimumFractionDigits: 2,
                          },
                        )}
                      </div>

                    </div>

                  </div>
                ))}

              </div>
            )}

            {/* =================================
                MEMBER
            ================================= */}

            <div className="border-t mt-5 pt-5">

              <h3 className="font-bold mb-3">
                👤 สมาชิก
              </h3>

              <div className="flex flex-col sm:flex-row gap-2">

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
                  className="w-full min-w-0 flex-1 border border-slate-300 rounded-lg px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  onClick={searchMember}
                  className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white px-5 py-3 rounded-lg font-bold"
                >
                  ค้นหา
                </button>

              </div>

              {member && (
                <div className="bg-green-50 text-green-700 rounded-lg p-3 mt-3">

                  <div className="font-bold break-words">
                    {member.name}
                  </div>

                  <div className="text-sm mt-1">
                    Points:{" "}
                    {member.points || 0}
                  </div>

                </div>
              )}

            </div>

            {/* =================================
                TOTAL
            ================================= */}

            <div className="border-t mt-5 pt-5">

              <div className="flex items-center justify-between gap-3 text-xl sm:text-2xl font-bold">

                <span>
                  ยอดรวม
                </span>

                <span className="text-blue-600 text-right">
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

            {/* =================================
                PAYMENT
            ================================= */}

            <div className="mt-5">

              <h3 className="font-bold mb-3">
                💳 วิธีชำระเงิน
              </h3>

              <div className="grid grid-cols-3 gap-2">

                <button
                  onClick={() =>
                    setPaymentMethod("cash")
                  }
                  className={`p-2 sm:p-3 rounded-lg font-bold text-xs sm:text-sm transition ${
                    paymentMethod === "cash"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  💵 เงินสด
                </button>

                <button
                  onClick={() =>
                    setPaymentMethod("qr")
                  }
                  className={`p-2 sm:p-3 rounded-lg font-bold text-xs sm:text-sm transition ${
                    paymentMethod === "qr"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  📱 QR
                </button>

                <button
                  onClick={() =>
                    setPaymentMethod("card")
                  }
                  className={`p-2 sm:p-3 rounded-lg font-bold text-xs sm:text-sm transition ${
                    paymentMethod === "card"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  💳 บัตร
                </button>

              </div>

            </div>

            {/* =================================
                CASH
            ================================= */}

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
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex justify-between items-center gap-3 mt-3">

                  <span>
                    เงินทอน
                  </span>

                  <span className="font-bold text-green-600 text-lg">
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

            {/* =================================
                PAY
            ================================= */}

            <button
              onClick={handlePayment}
              disabled={
                loading ||
                cart.length === 0
              }
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-xl mt-6 text-lg sm:text-xl font-bold transition"
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