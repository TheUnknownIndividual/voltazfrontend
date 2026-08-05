export const getProductVariant = (product: any, selectedPower?: string) => {
  const parameters = Array.isArray(product?.productParametrs) ? product.productParametrs : [];
  if (!selectedPower) return parameters[0];

  return parameters.find(
    (item: any) => String(item?.technicalPower || '').trim() === String(selectedPower).trim()
  ) || parameters[0];
};

export const getProductStock = (product: any, selectedPower?: string) => {
  if (product?.inStock === false) return 0;

  const variant = getProductVariant(product, selectedPower);
  const rawStock = variant?.count ?? product?.stockCount ?? 0;
  const stock = Number(rawStock);
  return Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : 0;
};

export const getStockWarning = (
  lang: 'az' | 'en' | 'ru' | 'tr',
  available: number,
  requested?: number
) => {
  const quantity = requested && requested > available ? requested : null;
  const details = quantity ? ` (${quantity}/${available})` : ` (${available})`;

  if (lang === 'ru') return `Запрошенное количество превышает остаток${details}. Уменьшите количество или свяжитесь с нами.`;
  if (lang === 'tr') return `İstenen miktar stok miktarını aşıyor${details}. Miktarı azaltın veya bizimle iletişime geçin.`;
  if (lang === 'en') return `The requested quantity exceeds available stock${details}. Reduce the quantity or contact us.`;
  return `Seçilən say stokdakı miqdarı keçir${details}. Sayı azaldın və ya bizimlə əlaqə saxlayın.`;
};
