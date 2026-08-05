import React, { createContext, useContext, useState } from "react";
import useApi from "../hooks/useApi";
import { API_ENDPOINTS } from "../utils/constants";

export interface LanguageItem {
  languageCode: number;
  title: string;
  description: string;
  content1: string;
  content2: string;
  content3: string;
  content4: string;
  detailContentHtml?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export interface ServicePayload {
  languages: LanguageItem[];
  icon: string;
  category: number;
  readMoreUrl?: string;
  detailPageSlug?: string;
  bannerImageUrl?: string;
}

export interface ServiceItem {
  id: string;
  icon: string;
  category?: number;
  readMoreUrl?: string;
  detailPageSlug?: string;
  bannerImageUrl?: string;
  languages: LanguageItem[];
}

export interface ServiceCategorySetting {
  category: number;
  isReadMoreEnabled: boolean;
}

interface ServiceRequestPayload {
  name: string;
  surname: string;
  email: string;
  phone: string;
  message: string;
  serviceManagementId: number;
}

interface ServiceRequestItem {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  message: string;
  serviceManagementId: number;
  status: number;
  createdAt?: string;
  isViewedByAdmin?: boolean;
  adminViewedAt?: string | null;
}

interface ServiceContextType {
  loading: boolean;
  services: ServiceItem[];
  categorySettings: ServiceCategorySetting[];
  serviceRequests: ServiceRequestItem[];

  getServices: () => Promise<void>;
  getAdminServices: () => Promise<void>;
  getServiceById: (id: string) => Promise<ServiceItem | null>;
  getServiceBySlug: (slug: string) => Promise<ServiceItem | null>;
  getCategorySettings: () => Promise<void>;
  updateCategorySetting: (category: number, isReadMoreEnabled: boolean) => Promise<void>;

  createService: (data: ServicePayload) => Promise<void>;
  updateService: (id: string, data: ServicePayload) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  getServiceRequests: (status?: string) => Promise<void>;
  getServiceRequestById: (
    id: string
  ) => Promise<ServiceRequestItem | null>;

  createServiceRequest: (
    data: ServiceRequestPayload
  ) => Promise<void>;

  updateServiceRequestStatus: (
    id: string,
    status: number
  ) => Promise<void>;

  markServiceRequestViewed: (id: string | number) => Promise<any>;
}

const ServiceContext = createContext<ServiceContextType | null>(null);

export const useService = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error("useService must be used within ServiceProvider");
  }
  return context;
};

export const ServiceProvider = ({ children }: { children: React.ReactNode }) => {
  const { get, post, put, del, patch, loading } = useApi();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categorySettings, setCategorySettings] = useState<ServiceCategorySetting[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestItem[]>([]);


  const getServices = async () => {
    try {
      const res = await get(API_ENDPOINTS.SERVICE.GET_SERVICE, { skipAuth: true });
      setServices(res?.data || res || []);
      console.log("RES:", res);
    } catch (error) {
      console.error("GET SERVICES ERROR:", error);
    }
  };

  const getServiceById = async (id: string): Promise<ServiceItem | null> => {
    try {
      const res = await get(API_ENDPOINTS.SERVICE.GET_ID_SERVICE(id));
      return res?.data || res || null;
    } catch (error) {
      console.error("GET SERVICE BY ID ERROR:", error);
      return null;
    }
  };

  const getAdminServices = async () => {
    const res = await get(API_ENDPOINTS.SERVICE.GET_ADMIN_SERVICES);
    setServices(res?.data || res || []);
  };

  const getServiceBySlug = async (slug: string): Promise<ServiceItem | null> => {
    try {
      const res = await get(API_ENDPOINTS.SERVICE.GET_PAGE_BY_SLUG(slug), { skipAuth: true });
      return res?.data || res || null;
    } catch (error) {
      console.error("GET SERVICE PAGE ERROR:", error);
      return null;
    }
  };

  const getCategorySettings = async () => {
    try {
      const res = await get(API_ENDPOINTS.SERVICE.GET_CATEGORY_SETTINGS, { skipAuth: true });
      setCategorySettings(res?.data || res || []);
    } catch (error) {
      console.error("GET SERVICE CATEGORY SETTINGS ERROR:", error);
    }
  };

  const updateCategorySetting = async (category: number, isReadMoreEnabled: boolean) => {
    await put(API_ENDPOINTS.SERVICE.UPDATE_CATEGORY_SETTING(category), { isReadMoreEnabled });
    setCategorySettings((current) => {
      const next = current.filter((setting) => setting.category !== category);
      return [...next, { category, isReadMoreEnabled }];
    });
  };


  const createService = async (data: ServicePayload) => {
    try {
      await post(API_ENDPOINTS.SERVICE.CREATE_SERVICE, data);
      await getAdminServices();
    } catch (error) {
      console.error("CREATE SERVICE ERROR:", error);
      throw error;
    }
  };


  const updateService = async (id: string, data: ServicePayload) => {
    try {
      await put(API_ENDPOINTS.SERVICE.UPDATE_SERVICE(id), data);
      await getAdminServices();
    } catch (error) {
      console.error("UPDATE SERVICE ERROR:", error);
      throw error;
    }
  };


  const deleteService = async (id: string) => {
    try {
      await del(API_ENDPOINTS.SERVICE.DELETE_SERVICE(id));
      await getAdminServices();
    } catch (error) {
      console.error("DELETE SERVICE ERROR:", error);
      throw error;
    }
  };

  const getServiceRequests = async (status?: string) => {
  try {
    const res = await get(
      API_ENDPOINTS.SERVICE_REQUEST.GET_SERVICE_REQUEST(status)
    );

    setServiceRequests(res?.data || res || []);
  } catch (error) {
    console.error("GET SERVICE REQUESTS ERROR:", error);
  }
};

const getServiceRequestById = async (
  id: string
): Promise<ServiceRequestItem | null> => {
  try {
    const res = await get(
      API_ENDPOINTS.SERVICE_REQUEST.GET_ID_SERVICE_REQUEST(id)
    );

    return res?.data || res || null;
  } catch (error) {
    console.error("GET SERVICE REQUEST BY ID ERROR:", error);
    return null;
  }
};

const createServiceRequest = async (
  data: ServiceRequestPayload
) => {
  try {
    const response = await post(
      API_ENDPOINTS.SERVICE_REQUEST.CREATE_SERVICE_REQUEST,
      data,
      { skipAuth: true }
    );
    if (response?.success === false) {
      throw new Error(response?.error?.details || "Service request could not be created");
    }
    return response?.data ?? response;
  } catch (error) {
    console.error("CREATE SERVICE REQUEST ERROR:", error);
    throw error;
  }
};

const updateServiceRequestStatus = async (
  id: string,
  status: number
) => {
  try {
    await patch(
      API_ENDPOINTS.SERVICE_REQUEST.UPDATE_SERVICE_STATUS(id),
      { status }
    );

    await getServiceRequests();
  } catch (error) {
    console.error("UPDATE SERVICE REQUEST STATUS ERROR:", error);
  }
};

const markServiceRequestViewed = async (id: string | number) => {
  try {
    const res = await patch(API_ENDPOINTS.SERVICE_REQUEST.MARK_SERVICE_REQUEST_VIEWED(id));
    return res?.data;
  } catch (error) {
    console.error("MARK SERVICE REQUEST VIEWED ERROR:", error);
    throw error;
  }
};

  return (
    <ServiceContext.Provider
      value={{
        loading,
        services,
        categorySettings,
        getServices,
        getAdminServices,
        getServiceById,
        getServiceBySlug,
        getCategorySettings,
        updateCategorySetting,
        createService,
        updateService,
        deleteService,
        
        serviceRequests,
        getServiceRequests,
        getServiceRequestById,
        createServiceRequest,
        updateServiceRequestStatus,
        markServiceRequestViewed
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};
