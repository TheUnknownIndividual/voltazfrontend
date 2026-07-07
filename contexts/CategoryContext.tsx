import React, { createContext, useContext, useState } from "react";
import useApi from "../hooks/useApi";
import { API_ENDPOINTS } from "../utils/constants";

interface LanguagePayload {
  languageCode: number;
  categoryName?: string;
  subCategoryName?: string;
}

interface CategoryPayload {
  languages: LanguagePayload[];
}

interface SubCategoryPayload {
  productCategoryId: number;
  languages: LanguagePayload[];
}

interface BrandPayload {
  productCategoryId: number;
  name: string;
}

interface CategoryContextType {
  loading: boolean;

  categories: any[];

  getCategories: () => Promise<void>;
  getCategoryById: (id: string) => Promise<any>;

  createCategory: (data: CategoryPayload) => Promise<any>;
  updateCategory: (id: string, data: CategoryPayload) => Promise<any>;

  deleteCategory: (id: string) => Promise<any>;

  subcategories: any[];

  getSubCategories: (categoryId: number) => Promise<void>;
  getSubCategoryById: (id: string) => Promise<any>;

  createSubCategory: (data: SubCategoryPayload) => Promise<any>;
  updateSubCategory: (id: string, data: SubCategoryPayload) => Promise<any>;

  deleteSubCategory: (id: string) => Promise<any>;

  brands: any[];

  getBrands: (categoryId: number) => Promise<void>;
  getBrandById: (id: string) => Promise<any>;

  createBrand: (data: BrandPayload) => Promise<any>;
  updateBrand: (id: string, data: BrandPayload) => Promise<any>;

  deleteBrand: (id: string) => Promise<any>;

  technologies: any[];

  getTechnology: (categoryId: number) => Promise<void>;
  getTechnologyById: (id: string) => Promise<any>;

  createTechnology: (data: BrandPayload) => Promise<any>;
  updateTechnology: (id: string, data: BrandPayload) => Promise<any>;

  deleteTechnology: (id: string) => Promise<any>;
}

const CategoryContext = createContext<CategoryContextType | null>(null);

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategory must be used within CategoryProvider");
  }
  return context;
};

export const CategoryProvider = ({ children }: { children: React.ReactNode }) => {
  const { get, post, put, del, loading } = useApi();

  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [technologies, setTechnologies] = useState<any[]>([]);
  // GET ALL + STATE UPDATE
  const getCategories = async () => {
    try {
      const res = await get(API_ENDPOINTS.CATEGORY.GET_CATEGORY);

      const data = res?.data || res;
      setCategories(data);

      return data;
    } catch (error) {
      console.error("Get categories error:", error);
      throw error;
    }
  };

  // GET BY ID
  const getCategoryById = async (id: string) => {
    try {
      const res = await get(API_ENDPOINTS.CATEGORY.GET_ID_CATEGORY(id));
      return res?.data || res;
    } catch (error) {
      console.error("Get category by id error:", error);
      throw error;
    }
  };

  // CREATE
  const createCategory = async (data: CategoryPayload) => {
    try {
      const res = await post(API_ENDPOINTS.CATEGORY.CREATE_CATEGORY, data);

      await getCategories(); // auto refresh

      return res?.data || res;
    } catch (error) {
      console.error("Create category error:", error);
      throw error;
    }
  };

  // UPDATE
  const updateCategory = async (id: string, data: CategoryPayload) => {
    try {
      const res = await put(API_ENDPOINTS.CATEGORY.UPDATE_CATEGORY(id), data);

      await getCategories(); // auto refresh

      return res?.data || res;
    } catch (error) {
      console.error("Update category error:", error);
      throw error;
    }
  };

  // DELETE
  const deleteCategory = async (id: string) => {
    try {
      const res = await del(API_ENDPOINTS.CATEGORY.DELETE_CATEGORY(id));

      await getCategories(); // auto refresh

      return res?.data || res;
    } catch (error) {
      console.error("Delete category error:", error);
      throw error;
    }
  };

  // GET ALL + STATE UPDATE
  const getSubCategories = async (categoryId: number) => {

    try {
      const res = await get(
        API_ENDPOINTS.SUBCATEGORY.GET_SUBCATEGORY(categoryId)
      );

      const data = res?.data || res;

      setSubCategories(data);

      return data;
    } catch (error) {
      console.error("Get subcategories error:", error);
      throw error;
    }
  };

  // GET BY ID
  const getSubCategoryById = async (id: string) => {
    try {
      const res = await get(API_ENDPOINTS.SUBCATEGORY.GET_ID_SUBCATEGORY(id));
      return res?.data || res;
    } catch (error) {
      console.error("Get subcategory by id error:", error);
      throw error;
    }
  };

  // CREATE
  const createSubCategory = async (data: SubCategoryPayload) => {
    try {
      const res = await post(API_ENDPOINTS.SUBCATEGORY.CREATE_SUBCATEGORY, data);



      return res?.data || res;
    } catch (error) {
      console.error("Create subcategory error:", error);
      throw error;
    }
  };

  // UPDATE
  const updateSubCategory = async (id: string, data: SubCategoryPayload) => {
    try {
      const res = await put(API_ENDPOINTS.SUBCATEGORY.UPDATE_SUBCATEGORY(id), data);


      return res?.data || res;
    } catch (error) {
      console.error("Update subcategory error:", error);
      throw error;
    }
  };

  // DELETE
  const deleteSubCategory = async (id: string) => {
    try {
      const res = await del(API_ENDPOINTS.SUBCATEGORY.DELETE_SUBCATEGORY(id));


      return res?.data || res;
    } catch (error) {
      console.error("Delete subcategory error:", error);
      throw error;
    }
  };

  // GET ALL + STATE UPDATE
  const getBrands = async (categoryId: number) => {
    try {

      const res = await get(
        API_ENDPOINTS.BRAND.GET_BRAND(categoryId)
      );

      const data = res?.data || res;

      setBrands(data);

      return data;

    } catch (error) {

      console.error("Get brands error:", error);
      throw error;
    }
  };

  // GET BY ID
  const getBrandById = async (id: string) => {
    try {

      const res = await get(
        API_ENDPOINTS.BRAND.GET_ID_BRAND(id)
      );

      return res?.data || res;

    } catch (error) {

      console.error("Get brand by id error:", error);
      throw error;
    }
  };

  // CREATE
  const createBrand = async (data: BrandPayload) => {
    try {

      const res = await post(
        API_ENDPOINTS.BRAND.CREATE_BRAND,
        data
      );

      return res?.data || res;

    } catch (error) {

      console.error("Create brand error:", error);
      throw error;
    }
  };

  // UPDATE
  const updateBrand = async (
    id: string,
    data: BrandPayload
  ) => {
    try {

      const res = await put(
        API_ENDPOINTS.BRAND.UPDATE_BRAND(id),
        data
      );

      return res?.data || res;

    } catch (error) {

      console.error("Update brand error:", error);
      throw error;
    }
  };

  // DELETE
  const deleteBrand = async (id: string) => {
    try {

      const res = await del(
        API_ENDPOINTS.BRAND.DELETE_BRAND(id)
      );

      return res?.data || res;

    } catch (error) {

      console.error("Delete brand error:", error);
      throw error;
    }
  };


  // GET ALL + STATE UPDATE
  const getTechnology = async (categoryId: number) => {
    try {

      const res = await get(
        API_ENDPOINTS.TECHNOLOGY.GET_TECHNOLOGY(categoryId)
      );

      const data = res?.data || res;

      setTechnologies(data);

      return data;

    } catch (error) {

      console.error("Get technologies error:", error);
      throw error;
    }
  };

  // GET BY ID
  const getTechnologyById = async (id: string) => {
    try {

      const res = await get(
        API_ENDPOINTS.TECHNOLOGY.GET_ID_TECHNOLOGY(id)
      );

      return res?.data || res;

    } catch (error) {

      console.error("Get technology by id error:", error);
      throw error;
    }
  };

  // CREATE
  const createTechnology = async (data: BrandPayload) => {
    try {

      const res = await post(
        API_ENDPOINTS.TECHNOLOGY.CREATE_TECHNOLOGY,
        data
      );

      return res?.data || res;

    } catch (error) {

      console.error("Create technology error:", error);
      throw error;
    }
  };

  // UPDATE
  const updateTechnology = async (
    id: string,
    data: BrandPayload
  ) => {
    try {

      const res = await put(
        API_ENDPOINTS.TECHNOLOGY.UPDATE_TECHNOLOGY(id),
        data
      );

      return res?.data || res;

    } catch (error) {

      console.error("Update technology error:", error);
      throw error;
    }
  };

  // DELETE
  const deleteTechnology = async (id: string) => {
    try {

      const res = await del(
        API_ENDPOINTS.TECHNOLOGY.DELETE_TECHNOLOGY(id)
      );

      return res?.data || res;

    } catch (error) {

      console.error("Delete technology error:", error);
      throw error;
    }
  };

  return (
    <CategoryContext.Provider
      value={{
        loading,
        categories,
        getCategories,
        getCategoryById,
        createCategory,
        updateCategory,
        deleteCategory,

        subcategories,
        getSubCategories,
        getSubCategoryById,
        createSubCategory,
        updateSubCategory,
        deleteSubCategory,

        brands,
        getBrands,
        getBrandById,
        createBrand,
        updateBrand,
        deleteBrand,

        technologies,
        getTechnology,
        getTechnologyById,
        createTechnology,
        updateTechnology,
        deleteTechnology,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};
