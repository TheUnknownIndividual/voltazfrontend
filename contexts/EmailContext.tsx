import React, { createContext, useContext, useState } from "react";
import useApi from "../hooks/useApi";
import { API_ENDPOINTS } from "../utils/constants";

interface LanguagePayload {
  languageCode: number;
  name: string;
}

interface ApplicationTypeContextPayload {
  languages: LanguagePayload[];
}


interface EmailContextType {
  loading: boolean;

  applicationTypes: any[];

  getApplicationTypes: () => Promise<void>;
  getApplicationTypesById: (id: string) => Promise<any>;

  createApplicationType: (data: ApplicationTypeContextPayload) => Promise<any>;
  updateApplicationType: (id: string, data: ApplicationTypeContextPayload) => Promise<any>;

  deleteApplicationType: (id: string) => Promise<any>;

}

const EmailContext = createContext<EmailContextType | null>(null);

export const useEmail = () => {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error("useEmail must be used within EmailProvider");
  }
  return context;
};

export const EmailProvider = ({ children }: { children: React.ReactNode }) => {
  const { get, post, put, del, loading } = useApi();

  const [applicationTypes, setApplicationTypes] = useState<any[]>([]);

  // GET ALL + STATE UPDATE
  const getApplicationTypes = async () => {
    try {
      const res = await get(API_ENDPOINTS.APPLICATIONTYPE.GET_APPLICATION_TYPE);

      const data = res?.data || res;
      setApplicationTypes(data);

      return data;
    } catch (error) {
      console.error("Get application types error:", error);
      throw error;
    }
  };

  // GET BY ID
  const getApplicationTypeById = async (id: string) => {
    try {
      const res = await get(API_ENDPOINTS.APPLICATIONTYPE.GET_ID_APPLICATION_TYPE(id));
      return res?.data || res;
    } catch (error) {
      console.error("Get application type by id error:", error);
      throw error;
    }
  };

  // CREATE
  const createApplicationType = async (data: ApplicationTypeContextPayload) => {
    try {
      const res = await post(API_ENDPOINTS.APPLICATIONTYPE.CREATE_APPLICATION_TYPE, data);

      await getApplicationTypes(); // auto refresh

      return res?.data || res;
    } catch (error) {
      console.error("Create application type error:", error);
      throw error;
    }
  };

  // UPDATE
  const updateApplicationType = async (id: string, data: ApplicationTypeContextPayload) => {
    try {
      const res = await put(API_ENDPOINTS.APPLICATIONTYPE.UPDATE_APPLICATION_TYPE(id), data);

      await getApplicationTypes(); // auto refresh

      return res?.data || res;
    } catch (error) {
      console.error("Update application type error:", error);
      throw error;
    }
  };

  // DELETE
  const deleteApplicationType = async (id: string) => {
    try {
      const res = await del(API_ENDPOINTS.APPLICATIONTYPE.DELETE_APPLICATION_TYPE(id));

      await getApplicationTypes(); // auto refresh

      return res?.data || res;
    } catch (error) {
      console.error("Delete application type error:", error);
      throw error;
    }
  };

  return (
    <EmailContext.Provider
      value={{
        loading,
        applicationTypes,
        getApplicationTypes,
        getApplicationTypeById,
        createApplicationType,
        updateApplicationType,
        deleteApplicationType,
      }}
    >
      {children}
    </EmailContext.Provider>
  );
};