import React, { createContext, useContext, useState } from "react";
import useApi from "../hooks/useApi";
import { API_ENDPOINTS } from "../utils/constants";

interface ProductContextType {
  loading: boolean;
  productData: any;
  productHomeData: any;
  productCount: number;

  getProducts: (initialCategory?: number, initialSubCategory?: number, page?: number, pageSize?: number) => Promise<any>;
  getHomeProducts: (initialCategory?: number, initialSubCategory?: number, page?: number, pageSize?: number) => Promise<any>;
  getProductById: (id: string) => Promise<any>;
  getProductCount: () => Promise<any>;

  createProduct: (data: any) => Promise<any>;
  updateProduct: (id: string, data: any) => Promise<any>;
  deleteProduct: (id: string) => Promise<any>;

  showProductOnHome: (id: string) => Promise<any>;
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

  // GET all products
  const getProducts = async (
  initialCategory?: number,
  initialSubCategory?: number,
  page?: number,
  pageSize?: number
) => {
    try {
      const res = await get(API_ENDPOINTS.PRODUCT.GET_PRODUCT(
        initialCategory,
        initialSubCategory,
        page,
        pageSize
      ));
      setProductData(res.data);
      return ;
    } catch (error) {
      console.error("Get Products Error:", error);
      throw error;
    }
  };

  // GET home products
  const getHomeProducts = async (
  initialCategory?: number,
  initialSubCategory?: number,
  page?: number,
  pageSize?: number
) => {
  try {
    const res = await get(
      API_ENDPOINTS.PRODUCT.GET_PRODUCT_FOR_HOME(
        initialCategory,
        initialSubCategory,
        page,
        pageSize
      )
    );

    setProductHomeData(res.data);

    return res;
  } catch (error) {
    console.error("Get Home Products Error:", error);
    throw error;
  }
};



  // GET product by id
  const getProductById = async (id: string) => {
    try {
      const res = await get(API_ENDPOINTS.PRODUCT.GET_ID_PRODUCT(id));
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
  const updateProduct = async (id: string, data: any) => {
    try {
      const res = await put(API_ENDPOINTS.PRODUCT.UPDATE_PRODUCT(id), data);
      return res;
    } catch (error) {
      console.error("Update Product Error:", error);
      throw error;
    }
  };

  // DELETE product
  const deleteProduct = async (id: string) => {
    try {
      const res = await del(API_ENDPOINTS.PRODUCT.DELETE_PRODUCT(id));
      return res;
    } catch (error) {
      console.error("Delete Product Error:", error);
      throw error;
    }
  };

  // PUT show on home
 const showProductOnHome = async (id: string, show: boolean) => {
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