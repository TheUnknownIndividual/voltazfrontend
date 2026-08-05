import React, { createContext, useContext, useState } from "react";
import useApi from "../hooks/useApi";
import { API_ENDPOINTS } from "../utils/constants";
interface LanguagePayload {
  languageCode: number;
  name: string;
}

interface PartnershipTypeContextPayload {
  id: number,
  languages: LanguagePayload[];
}

interface PartnershipPayload {
  name?: string;
  description?: string;
  isActive?: boolean;
  languages?: LanguagePayload[];
}

interface CreatePartnershipRequestPayload {
  companyName: string;
  companyPerson: string;
  email: string;
  phoneNumber: string;
  message: string;
  partnershipTypeId: number;
}

interface UpdatePartnershipRequestStatusPayload {
  status: number;
}

interface PartnershipContextType {
  partnershipTypes: PartnershipTypeContextPayload[];
  loading: boolean;

  getPartnershipTypes: () => Promise<void>;
  getPartnershipTypeById: (id: string) => Promise<any>;
  createPartnershipType: (data: PartnershipPayload) => Promise<void>;
  updatePartnershipType: (id: string, data: PartnershipPayload) => Promise<void>;
  deletePartnershipType: (id: string) => Promise<void>;

  getPartnershipRequests: (status?: string) => Promise<any>;
  getPartnershipRequestById: (id: string) => Promise<any>;
  createPartnershipRequest: (data: CreatePartnershipRequestPayload) => Promise<any>;
  updatePartnershipRequestStatus: (id: string | number,data: UpdatePartnershipRequestStatusPayload) => Promise<any>;
  markPartnershipRequestViewed: (id: string | number) => Promise<any>;
}

const PartnershipContext = createContext<PartnershipContextType | null>(null);

export const usePartnership = () => {
  const context = useContext(PartnershipContext);
  if (!context) {
    throw new Error("usePartnership must be used within PartnershipProvider");
  }
  return context;
};

export const PartnershipProvider = ({ children }: { children: React.ReactNode }) => {
  const { get, post, put, del, patch, loading } = useApi();

  const [partnershipTypes, setPartnershipTypes] = useState<PartnershipTypeContextPayload[]>([]);

  //
  // GET ALL
  //
  const getPartnershipTypes = async () => {
    try {
      const response = await get(API_ENDPOINTS.PARTNERSHIP_TYPES.GET_PARTNERSHIP_TYPES, { skipAuth: true });

      if (response?.success) {
        setPartnershipTypes(response.data);
      }
    } catch (error) {
      console.error("Get partnership types error:", error);
    }
  };

  //
  // GET BY ID
  //
  const getPartnershipTypeById = async (id: string) => {
    try {
      const response = await get(API_ENDPOINTS.PARTNERSHIP_TYPES.GET_ID_PARTNERSHIP_TYPES(id));

      if (response?.success) {
        return response.data;
      }

      return null;
    } catch (error) {
      console.error("Get partnership type by id error:", error);
      return null;
    }
  };

  //
  // CREATE
  //
  const createPartnershipType = async (data: PartnershipPayload) => {
    try {
      const response = await post(
        API_ENDPOINTS.PARTNERSHIP_TYPES.CREATE_PARTNERSHIP_TYPES,
        data
      );

      if (response?.success) {
        await getPartnershipTypes();
      }
    } catch (error) {
      console.error("Create partnership type error:", error);
    }
  };

  //
  // UPDATE
  //
  const updatePartnershipType = async (id: string, data: PartnershipPayload) => {
    try {
      const response = await put(
        API_ENDPOINTS.PARTNERSHIP_TYPES.UPDATE_PARTNERSHIP_TYPES(id),
        data
      );

      if (response?.success) {
        await getPartnershipTypes();
      }
    } catch (error) {
      console.error("Update partnership type error:", error);
    }
  };

  //
  // DELETE
  //
  const deletePartnershipType = async (id: string) => {
    try {
      const response = await del(
        API_ENDPOINTS.PARTNERSHIP_TYPES.DELETE_PARTNERSHIP_TYPES(id)
      );

      if (response?.success) {
        await getPartnershipTypes();
      }
    } catch (error) {
      console.error("Delete partnership type error:", error);
    }
  };

  const getPartnershipRequests = async (status?: string) => {
    try {
      const res = await get(
        API_ENDPOINTS.PARTNERSHIP_REQUEST.GET_PARTNERSHIP_REQUEST(status)
      );
  
      return res?.data;
    } catch (error) {
      console.error("GET CONTACT REQUESTS ERROR:", error);
      throw error;
    }
  };

  const createPartnershipRequest = async (
    data: CreatePartnershipRequestPayload
  ) => {
    try {
      const res = await post(
        API_ENDPOINTS.PARTNERSHIP_REQUEST.CREATE_PARTNERSHIP_REQUEST,
        data,
        { skipAuth: true }
      );

      if (res?.success === false) {
        throw new Error(res?.error?.details || "Partnership request could not be created");
      }
  
      return res?.data ?? res;
    } catch (error) {
      console.error("CREATE CONTACT REQUEST ERROR:", error);
      throw error;
    }
  };
  
  // PATCH STATUS
  const updatePartnershipRequestStatus = async (
    id: string | number,
    data: UpdatePartnershipRequestStatusPayload
  ) => {
    try {
      const res = await patch(
        API_ENDPOINTS.PARTNERSHIP_REQUEST.UPDATE_PARTNERSHIP_REQUEST(id),
        data
      );
  
      return res?.data;
    } catch (error) {
      console.error("UPDATE CONTACT REQUEST STATUS ERROR:", error);
      throw error;
    }
  };

  const markPartnershipRequestViewed = async (id: string | number) => {
    try {
      const res = await patch(API_ENDPOINTS.PARTNERSHIP_REQUEST.MARK_PARTNERSHIP_REQUEST_VIEWED(id));
      return res?.data;
    } catch (error) {
      console.error("MARK PARTNERSHIP REQUEST VIEWED ERROR:", error);
      throw error;
    }
  };

  const getPartnershipRequestById = async (id: string) => {
  try {
    const response = await get(
      API_ENDPOINTS.PARTNERSHIP_REQUEST.GET_ID_PARTNERSHIP_REQUEST(id)
    );

    if (response?.success) {
      return response.data;
    }

    return null;
  } catch (error) {
    console.error("Get partnership request by id error:", error);
    return null;
  }
};

  return (
    <PartnershipContext.Provider
      value={{
        partnershipTypes,
        loading,
        getPartnershipTypes,
        getPartnershipTypeById,
        createPartnershipType,
        updatePartnershipType,
        deletePartnershipType,

        getPartnershipRequests,
        createPartnershipRequest,
        updatePartnershipRequestStatus,
        markPartnershipRequestViewed,
        getPartnershipRequestById
      }}
    >
      {children}
    </PartnershipContext.Provider>
  );
};
