import React, { createContext, useContext, useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { API_ENDPOINTS } from "../utils/constants";

interface Translation {
  languageCode: number; // 1,2,3,4
  title: string;
  description: string;
  content: string;
}

interface CreateBlogPayload {
  coverImagePath: string;
  source?: string;
  postLink?: string;
  translations: Translation[];
}

interface UpdateBlogPayload {
  coverImagePath: string;
  source?: string;
  postLink?: string;
  isActive?: boolean;
  translations: Translation[];
}

interface BlogContextType {
  loading: boolean;
  getBlogs: () => Promise<any>;
  getBlogById: (id: string) => Promise<any>;
  createBlog: (data: CreateBlogPayload) => Promise<any>;
  updateBlog: (id: string, data: UpdateBlogPayload) => Promise<any>;
  deleteBlog: (id: string) => Promise<any>;
  blogs: any[];
}

const BlogContext = createContext<BlogContextType | null>(null);

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error("useBlog must be used within BlogProvider");
  }
  return context;
};

export const BlogProvider = ({ children }: { children: React.ReactNode }) => {
  const { get, post, put, del, loading } = useApi();

  const [blogs, setBlogs] = useState<any[]>([]);

  const [lang] = useState<'az' | 'en' | 'ru'>(() => {
    return (localStorage.getItem('lang') as 'az' | 'en' | 'ru') || 'az';
  });

 const mapLang = (code: number) => {
  switch (code) {
    case 1: return "az";
    case 2: return "en";
    case 3: return "ru";
    case 4: return "tr";
    default: return "az";
  }
};

const transformBlog = (item: any) => {
  const titles = { az: "", en: "", ru: "", tr: "" };
  const descriptions = { az: "", en: "", ru: "", tr: "" };
  const contents = { az: "", en: "", ru: "", tr: "" };

  (item.translations || []).forEach((t: any) => {
    const lang = mapLang(t.languageCode);

    titles[lang] = t.title || "";
    descriptions[lang] = t.description || "";
    contents[lang] = t.content || "";
  });

  return {
    id: item.id,
    image: item.coverImagePath,
    isActive: item.isActive,
    date: item.createdAt,
    updatedAt: item.updatedAt || undefined,

    title: titles,
    description: descriptions,
    content: contents,
  };
};

  const getBlogs = async () => {
    try {
      const res = await get(API_ENDPOINTS.BLOG.GET_BLOG);

      // API response formatına görə dəyişə bilər
      const data = res?.data || res;

      // setBlogs(data);
      setBlogs(data.map(transformBlog));
    } catch (error) {
      console.error("Get blogs error:", error);
    }
  };

  const createBlog = async (data: CreateBlogPayload) => {
    try {
      const res = await post(API_ENDPOINTS.BLOG.CREATE_BLOG, data);
       return res;
    } catch (error) {
      console.error("Create blog error:", error);
    }
  };

   const getBlogById = async (id: string) => {
      try {
        const response = await get(API_ENDPOINTS.BLOG.GET_ID_BLOG(id));
        return response.data;
      } catch (error) {
        console.error("Get blog by id error:", error);
        throw error;
      }
    };
  
    const updateBlog = async (id: string, data: UpdateBlogPayload) => {
      try {
        const response = await put(API_ENDPOINTS.BLOG.UPDATE_BLOG(id), data);
        return response;
      } catch (error) {
        console.error("Update blog error:", error);
        throw error;
      }
    };
  
    const deleteBlog = async (id: string) => {
      try {
        const response = await del(API_ENDPOINTS.BLOG.DELETE_BLOG(id));
        return response;
      } catch (error) {
        console.error("Delete blog error:", error);
        throw error;
      }
    };

    
  

  return (
    <BlogContext.Provider
      value={{
        loading,
        blogs,
        getBlogs,
        createBlog,
        getBlogById,
        updateBlog,
        deleteBlog
      }}
    >
      {children}
    </BlogContext.Provider>
  );
};
