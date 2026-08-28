export function calculatePromotions(
  cart,
  member = null
) {
  let discount = 0;
  const promotionDetails = [];

  const drinkQty = cart
    .filter(
      (item) => item.category === "เครื่องดื่ม"
    )
    .reduce(
      (sum, item) => sum + item.qty,
      0
    );

  if (drinkQty >= 2) {
    discount += 5;

    promotionDetails.push({
      name: "ซื้อเครื่องดื่ม 2 ชิ้น ลด 5 บาท",
      saving: 5,
    });
  }

  const snackQty = cart
    .filter(
      (item) => item.category === "ขนม"
    )
    .reduce(
      (sum, item) => sum + item.qty,
      0
    );

  if (snackQty >= 2) {
    discount += 10;

    promotionDetails.push({
      name: "ซื้อขนม 2 ชิ้น ลด 10 บาท",
      saving: 10,
    });
  }

  const total = cart.reduce(
    (sum, item) =>
      sum + item.price * item.qty,
    0
  );

  discount = Math.min(discount, total);

  return {
    discount,
    promotionDetails,
  };
}
