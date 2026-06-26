import React, { createContext, useContext, useState } from "react";
import useApi from "../hooks/useApi";
import { API_ENDPOINTS } from "../utils/constants";

interface LanguageItem {
  languageCode: number;
  title: string;
  description: string;
  content1: string;
  content2: string;
  content3: string;
  content4: string;
}

interface ServicePayload {
  languages: LanguageItem[];
  icon: string;
}

interface ServiceItem {
  id: string;
  icon: string;
  languages: LanguageItem[];
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
}

interface ServiceContextType {
  loading: boolean;
  services: ServiceItem[];

  getServices: () => Promise<void>;
  getServiceById: (id: string) => Promise<ServiceItem | null>;

  createService: (data: ServicePayload) => Promise<void>;
  updateService: (id: string, data: ServicePayload) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  getServiceRequests: () => Promise<void>;
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
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestItem[]>([]);


  const getServices = async () => {
    try {
      const res = await get(API_ENDPOINTS.SERVICE.GET_SERVICE);
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


  const createService = async (data: ServicePayload) => {
    try {
      await post(API_ENDPOINTS.SERVICE.CREATE_SERVICE, data);
      await getServices(); // refresh list
    } catch (error) {
      console.error("CREATE SERVICE ERROR:", error);
    }
  };


  const updateService = async (id: string, data: ServicePayload) => {
    try {
      await put(API_ENDPOINTS.SERVICE.UPDATE_SERVICE(id), data);
      await getServices(); // refresh list
    } catch (error) {
      console.error("UPDATE SERVICE ERROR:", error);
    }
  };


  const deleteService = async (id: string) => {
    try {
      await del(API_ENDPOINTS.SERVICE.DELETE_SERVICE(id));
      await getServices(); // refresh list
    } catch (error) {
      console.error("DELETE SERVICE ERROR:", error);
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
    await post(
      API_ENDPOINTS.SERVICE_REQUEST.CREATE_SERVICE_REQUEST,
      data
    );

    await getServiceRequests();
  } catch (error) {
    console.error("CREATE SERVICE REQUEST ERROR:", error);
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

  return (
    <ServiceContext.Provider
      value={{
        loading,
        services,
        getServices,
        getServiceById,
        createService,
        updateService,
        deleteService,
        
        serviceRequests,
        getServiceRequests,
        getServiceRequestById,
        createServiceRequest,
        updateServiceRequestStatus
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};