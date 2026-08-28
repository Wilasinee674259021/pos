// =========================
// SALES STORE
// =========================

export function getSales() {
  const sales =
    localStorage.getItem("sales");

  return sales
    ? JSON.parse(sales)
    : [];
}

export function saveSale(sale) {
  const sales = getSales();

  const newSale = {
    id: `SALE-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...sale,
  };

  localStorage.setItem(
    "sales",
    JSON.stringify([
      newSale,
      ...sales,
    ])
  );

  return newSale;
}
