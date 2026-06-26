import React, { createContext, useContext, useState } from "react";
import useApi from "../hooks/useApi";
import { API_ENDPOINTS } from "../utils/constants";

interface UploadContextType {
  loading: boolean;
  uploadImage: (file: File) => Promise<any>;
  deleteImage: (fileURL: string) => Promise<any>;
  uploadPDF: (file: File) => Promise<any>;
  deletePDF: (fileURL: string) => Promise<any>;
}

const UploadContext = createContext<UploadContextType | null>(null);

export const useUpload = () => {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error("useUpload must be used within UploadProvider");
  }
  return context;
};

export const UploadProvider = ({ children }: { children: React.ReactNode }) => {
  const { post, del, loading } = useApi(); 
  const [lang] = useState<'az' | 'en' | 'ru'>(() => {
    return (localStorage.getItem('lang') as 'az' | 'en' | 'ru') || 'az';
  });

  // 📤 IMAGE UPLOAD (POST)
  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file); // backend hansı ad istəyirsə onu yaz (bəzən "image")

    const res = await post(API_ENDPOINTS.UPLOAD.UPLOAD_IMAGE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res;
  };

  // 🗑 IMAGE DELETE (DELETE)
  const deleteImage = async (fileURL: string) => {
    const res = await del(API_ENDPOINTS.UPLOAD.DELETE_IMAGE(fileURL));
    return res;
  };


    // 📤 IMAGE UPLOAD (POST)
  const uploadPDF = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file); // backend hansı ad istəyirsə onu yaz (bəzən "image")

    const res = await post(API_ENDPOINTS.UPLOAD.UPLOAD_PDF, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res;
  };

  // 🗑 IMAGE DELETE (DELETE)
  const deletePDF = async (fileURL: string) => {
    const res = await del(API_ENDPOINTS.UPLOAD.DELETE_PDF(fileURL));
    return res;
  };

  return (
    <UploadContext.Provider
      value={{
        loading,
        uploadImage,
        deleteImage,
        uploadPDF,
        deletePDF,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
};