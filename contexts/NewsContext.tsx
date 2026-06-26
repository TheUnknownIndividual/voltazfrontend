import React, { createContext, useContext, useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { API_ENDPOINTS } from "../utils/constants";

interface NewsLanguage {
  languageCode: number; // 1: az, 2: en, 3: ru
  title: string;
  description: string;
  content: string;
}

interface CreateNewsPayload {
  coverImagePath: string;
  source: string;
  postLink: string;
  languages: NewsLanguage[];
}

interface UpdateNewsPayload {
  coverImagePath: string;
  source: string;
  postLink: string;
  isActive: boolean;
  languages: NewsLanguage[]; // 1,2,3,4
}

interface NewsContextType {
  loading: boolean;
  publicNews: any[];
  getNews: () => Promise<any>;
  getNewsById: (id: string) => Promise<any>;
  createNews: (data: CreateNewsPayload) => Promise<any>;
  updateNews: (id: string, data: UpdateNewsPayload) => Promise<any>;
  deleteNews: (id: string) => Promise<any>;
  getPublicNews: () => Promise<any>;
}

const NewsContext = createContext<NewsContextType | null>(null);

export const useNews = () => {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error("useNews must be used within NewsProvider");
  }
  return context;
};

export const NewsProvider = ({ children }: { children: React.ReactNode }) => {
  const { get, post, put, del, loading } = useApi();
  const [publicNews, setPublicNews] = useState<any[]>([]);

  const [lang, setLang] = useState<'az' | 'en' | 'ru'>(() => {
    return (localStorage.getItem('lang') as 'az' | 'en' | 'ru') || 'az';
  });



  // 🔹 GET NEWS
  const getNews = async () => {
    try {
      const response = await get(API_ENDPOINTS.NEWS.GET_NEWS, {
        params: { lang } // backend bunu dəstəkləyirsə
      });
      return response;
    } catch (error) {
      console.error("Get news error:", error);
      throw error;
    }
  };

  // 🔹 CREATE NEWS
  const createNews = async (data: CreateNewsPayload) => {
    try {
      const response = await post(API_ENDPOINTS.NEWS.CREATE_NEWS, data);
      return response;
    } catch (error) {
      console.error("Create news error:", error);
      throw error;
    }
  };

  const getNewsById = async (id: string) => {
    try {
      const response = await get(API_ENDPOINTS.NEWS.GET_ID_NEWS(id));
      return response.data;
    } catch (error) {
      console.error("Get news by id error:", error);
      throw error;
    }
  };

  const updateNews = async (id: string, data: UpdateNewsPayload) => {
    try {
      const response = await put(API_ENDPOINTS.NEWS.UPDATE_NEWS(id), data);
      return response;
    } catch (error) {
      console.error("Update news error:", error);
      throw error;
    }
  };

  const deleteNews = async (id: string) => {
    try {
      const response = await del(API_ENDPOINTS.NEWS.DELETE_NEWS(id));
      return response;
    } catch (error) {
      console.error("Delete news error:", error);
      throw error;
    }
  };

  // 🔹 GET PUBLIC NEWS
const getPublicNews = async () => {
  try {
    const response = await get(API_ENDPOINTS.NEWS.PUBLIC_NEWS, {
      params: { lang } // backend dilə görə filter edirsə
    });
     setPublicNews(response.data || response);
    return response;
  } catch (error) {
    console.error("Get public news error:", error);
    throw error;
  }
};

  

  return (
    <NewsContext.Provider
      value={{
        loading,
        getNews,
        getNewsById,
        createNews,
        updateNews,
        deleteNews,
        publicNews,
        getPublicNews,
      }}
    >
      {children}
    </NewsContext.Provider>
  );
};