import React, { createContext, useContext, useState } from "react";
import useApi from "../hooks/useApi";
import { API_ENDPOINTS } from "../utils/constants";

interface LanguagePayload {
  languageCode: number;
  promotionName: string;
}

interface PromotionContextPayload {
  languages: LanguagePayload[];
}


interface PromotionContextType {
  loading: boolean;

  promotions: any[];

  getPromotions: () => Promise<void>;
  getPromotionById: (id: string) => Promise<any>;

  createPromotion: (data: PromotionContextPayload) => Promise<any>;
  updatePromotion: (id: string, data: PromotionContextPayload) => Promise<any>;

  deletePromotion: (id: string) => Promise<any>;

}

const PromotionContext = createContext<PromotionContextType | null>(null);

export const usePromotion = () => {
  const context = useContext(PromotionContext);
  if (!context) {
    throw new Error("usePromotion must be used within PromotionProvider");
  }
  return context;
};

export const PromotionProvider = ({ children }: { children: React.ReactNode }) => {
  const { get, post, put, del, loading } = useApi();

  const [promotions, setPromotions] = useState<any[]>([]);

  // GET ALL + STATE UPDATE
  const getPromotions = async () => {
    try {
      const res = await get(API_ENDPOINTS.PROMOTION.GET_PROMOTION);

      const data = res?.data || res;
      setPromotions(data);

      return data;
    } catch (error) {
      console.error("Get promotions error:", error);
      throw error;
    }
  };

  // GET BY ID
  const getPromotionById = async (id: string) => {
    try {
      const res = await get(API_ENDPOINTS.PROMOTION.GET_ID_PROMOTION(id));
      return res?.data || res;
    } catch (error) {
      console.error("Get promotion by id error:", error);
      throw error;
    }
  };

  // CREATE
  const createPromotion = async (data: PromotionContextPayload) => {
    try {
      const res = await post(API_ENDPOINTS.PROMOTION.CREATE_PROMOTION, data);

      await getPromotions(); // auto refresh

      return res?.data || res;
    } catch (error) {
      console.error("Create promotion error:", error);
      throw error;
    }
  };

  // UPDATE
  const updatePromotion = async (id: string, data: PromotionContextPayload) => {
    try {
      const res = await put(API_ENDPOINTS.PROMOTION.UPDATE_PROMOTION(id), data);

      await getPromotions(); // auto refresh

      return res?.data || res;
    } catch (error) {
      console.error("Update promotion error:", error);
      throw error;
    }
  };

  // DELETE
  const deletePromotion = async (id: string) => {
    try {
      const res = await del(API_ENDPOINTS.PROMOTION.DELETE_PROMOTION(id));

      await getPromotions(); // auto refresh

      return res?.data || res;
    } catch (error) {
      console.error("Delete promotion   error:", error);
      throw error;
    }
  };

  return (
    <PromotionContext.Provider
      value={{
        loading,
        promotions,
        getPromotions,
        getPromotionById,
        createPromotion,
        updatePromotion,
        deletePromotion,
      }}
    >
      {children}
    </PromotionContext.Provider>
  );
};