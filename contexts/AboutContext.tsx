import React, { createContext, use, useContext, useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { API_ENDPOINTS } from "../utils/constants";

interface AboutLanguage {
  languageCode: number;
  title: string;
  description: string;
}

interface AboutPayload {
  languages: AboutLanguage[];
  imagePaths?: string[];
  imagePath?: string | string[];
}
interface ReorderItem {
  id: number;
  position: number;
}

interface AboutContextType {
  aboutData: any;
  getAbout: () => Promise<any>;
  createAbout: (data: AboutPayload) => Promise<any>;
  getAboutById: (id: string) => Promise<any>;
  updateAbout: (id: string, data: AboutPayload) => Promise<any>;
  deleteAbout: (id: string) => Promise<any>;
  reorderAbout: (data: ReorderItem[]) => Promise<any>;
  loading: boolean;
}

const AboutContext = createContext<AboutContextType | null>(null);

export const useAbout = () => {
  const context = useContext(AboutContext);
  if (!context) {
    throw new Error("useAbout must be used within AboutProvider");
  }
  return context;
};

export const AboutProvider = ({ children }: { children: React.ReactNode }) => {
  const { get, post, put, del, loading } = useApi();
  const [aboutData, setAboutData] = React.useState<any>(null);
  const [lang, setLang] = useState<'az' | 'en' | 'ru' | 'tr'>(() => {
  return (localStorage.getItem('lang') as 'az' | 'en' | 'ru' | 'tr') || 'en';
});

  // GET About
  const getAbout = async () => {
    try {
      const res = await get(API_ENDPOINTS.ABOUT.GET_ABOUT, {
      headers: {
        'Accept-Language': lang
      }
    });
      setAboutData(res.data);
      return res;
    } catch (error) {
      console.error("Get About error:", error);
      throw error;
    }
  };

  // POST About
  const createAbout = async (data: AboutPayload) => {
    try {
      const res = await post(API_ENDPOINTS.ABOUT.CREATE_ABOUT, data);
      return res;
    } catch (error) {
      console.error("Create About error:", error);
      throw error;
    }
  };

  const getAboutById = async (id: string) => {
  try {
    const res = await get(API_ENDPOINTS.ABOUT.GET_ID_ABOUT(id), {
      headers: {
        "Accept-Language": lang,
      },
    });

    return res.data;
  } catch (error) {
    console.error("Get About By Id error:", error);
    throw error;
  }
};

const updateAbout = async (id: string, data: AboutPayload) => {
  try {
    const res = await put(API_ENDPOINTS.ABOUT.UPDATE_ABOUT(id), data);
    return res;
  } catch (error) {
    console.error("Update About error:", error);
    throw error;
  }
};

const deleteAbout = async (id: string) => {
  try {
    const res = await del(API_ENDPOINTS.ABOUT.DELETE_ABOUT(id));
    return res;
  } catch (error) {
    console.error("Delete About error:", error);
    throw error;
  }
};

   const reorderAbout = async (data: ReorderItem[]) => {
    try {
      const res = await put(API_ENDPOINTS.ABOUT.REORDER, data);
      return res;
    } catch (error) {
      console.error("Reorder About error:", error);
      throw error;
    }
  };


  return (
    <AboutContext.Provider
      value={{
        getAbout,
        createAbout,
        reorderAbout,
        getAboutById,
        updateAbout,
        deleteAbout,
        loading,
        aboutData
      }}
    >
      {children}
    </AboutContext.Provider>
  );
};
