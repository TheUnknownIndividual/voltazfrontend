
import React from 'react';
import { Product } from '../types';
import { useCategory } from '@/contexts/CategoryContext';
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  product: Product;
  onSelectProduct: (id: string) => void;
  onAddToCart?: (id: string, quantity: number) => void;
  onOrderNow?: (id: string, quantity: number) => void;
  lang?: 'az' | 'en' | 'ru' | 'tr';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct, onAddToCart, onOrderNow, lang = 'az' }) => {
  const t = {
    onOrder: lang === 'az' ? 'Sifarişlə' : lang === 'en' ? 'On Order' : lang === 'ru' ? 'Под заказ' : 'Sipariş üzerine',
    inStock: lang === 'az' ? 'Stokda' : lang === 'en' ? 'In Stock' : lang === 'ru' ? 'В наличии' : 'Stokta',
    outOfStock: lang === 'az' ? 'Stokda yoxdur' : lang === 'en' ? 'Out of Stock' : lang === 'ru' ? 'Нет в наличии' : 'Stokta yok',
    addToCart: lang === 'az' ? 'Səbətə əlavə et' : lang === 'en' ? 'Add to Cart' : lang === 'ru' ? 'В корзину' : 'Sepete ekle',
    orderNow: lang === 'az' ? 'Sifariş Et' : lang === 'en' ? 'Order Now' : lang === 'ru' ? 'Заказать сейчас' : 'Sipariş ver',
    requestPrice: lang === 'az' ? 'Qiymət təklifi al' : lang === 'en' ? 'Request Price' : lang === 'ru' ? 'Запросить цену' : 'Fiyat teklifi al',
    buyCredit: lang === 'az' ? 'Kreditlə al' : lang === 'en' ? 'Buy with credit' : lang === 'ru' ? 'Купить в кредит' : 'Krediyle al'
  };
  const {
    brands,
  } = useCategory();
  const navigate = useNavigate();
  const parameters = Array.isArray(product.productParametrs) ? product.productParametrs : [];
  const purchasableParam = parameters.find((item) =>
    Boolean(product.inStock && Number(item?.count || 0) > 0 && Number(item?.amount || 0) > 0)
  );
  const displayParam = purchasableParam || parameters[0];
  const productSpecBadge = displayParam?.technicalPower?.trim();
  const firstAmount = Number(displayParam?.amount || 0);
  const firstCount = Number(displayParam?.count || 0);
  const hasPrice = firstAmount > 0;
  const hasStock = Boolean(product.inStock && firstCount > 0);


  const getItemName = (item: any) => {


    const lang = item?.languages?.find(
      (l: any) => l.languageCode === 1
    );

    return (
      lang?.categoryName ||
      lang?.subCategoryName ||
      lang?.brandName ||
      lang?.seriesName ||
      lang?.technologyName ||
      lang?.promotionName ||
      ""
    );
  };


  return (
    <div className="group relative flex flex-col bg-white rounded-[1.75rem] transition-all duration-500 hover:-translate-y-2 h-full">
      {/* Main Card Body */}
      <div className="flex flex-col h-full border border-slate-100 rounded-[1.75rem] p-1.5 bg-white shadow-sm group-hover:shadow-2xl group-hover:border-emerald-100 transition-all duration-500 overflow-hidden">

        {/* Image Container */}
        <div
          // onClick={() => onSelectProduct(product.id)}
          onClick={() => navigate(`/product/${product.id}`)}
          className="relative aspect-[4/4.5] rounded-[1.25rem] bg-slate-50 overflow-hidden cursor-pointer group-hover:bg-emerald-50/50 transition-colors duration-500"
        >
          <img
            src={product.productImage[0]}
            alt={product.productName}
            className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-110"
          />

          {productSpecBadge && (
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <div className="bg-white/80 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[7px] md:text-[9px] font-black text-emerald-600 border border-emerald-100 shadow-sm">
              {productSpecBadge}
            </div>
          </div>
          )}

          {hasStock ? (
            <div className="absolute bottom-3 right-3">
              <div className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[6px] md:text-[8px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20">
                {firstCount}
              </div>
            </div>
          ) : (
            <div className="absolute bottom-3 right-3">
              <div className="bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full text-[6px] md:text-[8px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20">
                {t.outOfStock}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="py-4 md:py-5 px-0 flex flex-col flex-grow">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[7px] md:text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em]">{
              getItemName(
                brands.find(c => c.id === product.productBrandId)
              )
            }</span>

            <span className="text-[6px] md:text-[8px] font-bold text-slate-400 uppercase tracking-tight">{product.subCategory}</span>

          </div>

          <h4
            onClick={() => onSelectProduct(product.id)}
            className="text-[10px] md:text-sm font-bold text-slate-900 mb-2 leading-tight line-clamp-2 cursor-pointer hover:text-emerald-600 transition-colors"
          >
            {product.productName}
          </h4>

          <div className="mt-auto">
            {hasPrice && (
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-xs md:text-xl font-black text-slate-900">
                {firstAmount}
              </span>
              <span className="text-[7px] md:text-[10px] font-bold text-slate-400 uppercase">
                AZN
              </span>
            </div>)}

            <div className="flex flex-col gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onOrderNow?.(product.id, 1); }}
                className="w-full py-3 md:py-4 rounded-xl bg-emerald-600 text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all active:scale-95 shadow-lg shadow-emerald-600/20"
              >
                {!hasPrice ? t.requestPrice : hasStock ? t.orderNow : t.outOfStock}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onAddToCart?.(product.id, 1); }}
                disabled={!hasPrice || !hasStock}
                className="w-full py-3 md:py-4 rounded-xl bg-slate-100 text-slate-600 text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t.addToCart}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
