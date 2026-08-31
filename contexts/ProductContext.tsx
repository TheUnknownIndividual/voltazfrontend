import React, { createContext, useContext, useRef, useState } from "react";
import useApi from "../hooks/useApi";
import { API_ENDPOINTS } from "../utils/constants";
import axiosInstance from "../api/axiosInstance";

interface ProductContextType {
  loading: boolean;
  productData: any;
  productHomeData: any;
  productCount: number;

  getProducts: (initialCategory?: number, initialSubCategory?: number, page?: number, pageSize?: number, search?: string, stockStatus?: string) => Promise<any>;
  prefetchProducts: (initialCategory?: number, initialSubCategory?: number, page?: number, pageSize?: number, search?: string, stockStatus?: string) => Promise<any>;
  getHomeProducts: (initialCategory?: number, initialSubCategory?: number, page?: number, pageSize?: number) => Promise<any>;
  getProductById: (id: string | number) => Promise<any>;
  getProductCount: () => Promise<any>;

  createProduct: (data: any) => Promise<any>;
  updateProduct: (id: string | number, data: any) => Promise<any>;
  deleteProduct: (id: string | number) => Promise<any>;

  showProductOnHome: (id: string | number, show: boolean) => Promise<any>;
}

const ProductContext = createContext<ProductContextType | null>(null);

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProduct must be used within ProductProvider");
  }
  return context;
};

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
  const { get, post, put, del, patch, loading } = useApi();

  const [productData, setProductData] = useState<any>(null);
  const [productHomeData, setProductHomeData] = useState<any>([]);
  const [productCount, setProductCount] = useState<number>(0);
  const productsRequestIdRef = useRef(0);
  const productsCacheRef = useRef(new Map<string, any>());
  const homeProductsRequestIdRef = useRef(0);
  const homeProductsCacheRef = useRef(new Map<string, any>());

  // GET all products
  const getProducts = async (
  initialCategory?: number,
  initialSubCategory?: number,
  page?: number,
  pageSize?: number,
  search?: string,
  stockStatus?: string
) => {
    const requestId = productsRequestIdRef.current + 1;
    productsRequestIdRef.current = requestId;
    const url = API_ENDPOINTS.PRODUCT.GET_PRODUCT(
      initialCategory,
      initialSubCategory,
      page,
      pageSize,
      search,
      stockStatus
    );
    const cached = productsCacheRef.current.get(url);

    if (cached && requestId === productsRequestIdRef.current) {
      setProductData(cached);
    }

    try {
      const res = await get(url);
      productsCacheRef.current.set(url, res.data);
      if (requestId === productsRequestIdRef.current) {
        setProductData(res.data);
      }
      return res;
    } catch (error) {
      console.error("Get Products Error:", error);
      throw error;
    }
  };

  const prefetchProducts = async (
    initialCategory?: number,
    initialSubCategory?: number,
    page?: number,
    pageSize?: number,
    search?: string,
    stockStatus?: string
  ) => {
    const url = API_ENDPOINTS.PRODUCT.GET_PRODUCT(
      initialCategory,
      initialSubCategory,
      page,
      pageSize,
      search,
      stockStatus
    );

    if (productsCacheRef.current.has(url)) {
      return productsCacheRef.current.get(url);
    }

    const res = await axiosInstance.get(url);
    const data = res.data?.data ?? res.data;
    productsCacheRef.current.set(url, data);
    return data;
  };

  // GET home products
const getHomeProducts = async (
  initialCategory?: number,
  initialSubCategory?: number,
  page?: number,
  pageSize?: number
) => {
  const requestId = homeProductsRequestIdRef.current + 1;
  homeProductsRequestIdRef.current = requestId;
  const url = API_ENDPOINTS.PRODUCT.GET_PRODUCT_FOR_HOME(
    initialCategory,
    initialSubCategory,
    page,
    pageSize
  );
  const cached = homeProductsCacheRef.current.get(url);

  if (cached) {
    if (requestId === homeProductsRequestIdRef.current) setProductHomeData(cached);
    return { data: cached };
  }

  try {
    const res = await get(url);

    homeProductsCacheRef.current.set(url, res.data);
    if (requestId === homeProductsRequestIdRef.current) setProductHomeData(res.data);

    return res;
  } catch (error) {
    console.error("Get Home Products Error:", error);
    throw error;
  }
};



  // GET product by id
  const getProductById = async (id: string | number) => {
    try {
      const res = await get(API_ENDPOINTS.PRODUCT.GET_ID_PRODUCT(String(id)));
      return res;
    } catch (error) {
      console.error("Get Product By ID Error:", error);
      throw error;
    }
  };

  // CREATE product
  const createProduct = async (data: any) => {
    try {
      const res = await post(API_ENDPOINTS.PRODUCT.CREATE_PRODUCT, data);
      return res;
    } catch (error) {
      console.error("Create Product Error:", error);
      throw error;
    }
  };

  // UPDATE product
  const updateProduct = async (id: string | number, data: any) => {
    try {
      const res = await put(API_ENDPOINTS.PRODUCT.UPDATE_PRODUCT(String(id)), data);
      return res;
    } catch (error) {
      console.error("Update Product Error:", error);
      throw error;
    }
  };

  // DELETE product
  const deleteProduct = async (id: string | number) => {
    try {
      const res = await del(API_ENDPOINTS.PRODUCT.DELETE_PRODUCT(String(id)));
      return res;
    } catch (error) {
      console.error("Delete Product Error:", error);
      throw error;
    }
  };

  // PUT show on home
 const showProductOnHome = async (id: string | number, show: boolean) => {
  try {
    const res = await put(API_ENDPOINTS.PRODUCT.SHOW_PRODUCT, {
      productId: Number(id),
      show: show,
    });

    return res;
  } catch (error) {
    console.error("Show Product Error:", error);
    throw error;
  }
};

const getProductCount = async () => {
  try {
    const res = await get(API_ENDPOINTS.PRODUCT.GET_PRODUCT_COUNT);
    setProductCount(res.data);
    return res;
  } catch (error) {
    console.error("Get Product Count Error:", error);
    throw error;
  }
};

  return (
    <ProductContext.Provider
      value={{
        loading,
        productData,
        productHomeData,
        getProducts,
        prefetchProducts,
        getHomeProducts,
        getProductById,
        createProduct,
        updateProduct,
        deleteProduct,
        showProductOnHome,
        getProductCount,
        productCount,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
