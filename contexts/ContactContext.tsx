import React, { createContext, useContext, useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { API_ENDPOINTS } from "../utils/constants";

interface ContactPayload {
  languages: {
    languageCode: number;
    address: string;
    workingHoursDescription: string;
  }[];
  phoneNumbers: {
    number: string;
  }[];
  emailAddresses: {
    email: string;
  }[];
}

interface CreateContactRequestPayload {
  name: string;
  surname: string;
  email: string;
  phone: string;
  message: string;
  applicationTypeId: number;
}

interface UpdateContactRequestStatusPayload {
  status: number;
}

interface ContactContextType {
  loading: boolean;
  contactData: any;
  getContactInfo: () => Promise<void>;
  updateContact: (id: string, data: ContactPayload) => Promise<void>;

  getContactRequests: (status?: string) => Promise<any>;
  createContactRequest: (
    data: CreateContactRequestPayload
  ) => Promise<any>;
  updateContactRequestStatus: (
    id: string | number,
    data: UpdateContactRequestStatusPayload
  ) => Promise<any>;

}

const ContactContext = createContext<ContactContextType | null>(null);

export const useContact = () => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error("useContact must be used within ContactProvider");
  }
  return context;
};

export const ContactProvider = ({ children }: { children: React.ReactNode }) => {
  const { get, post, put, del, patch, loading } = useApi();

  const [contactData, setContactData] = useState<any>(null);
   const [lang] = useState<'az' | 'en' | 'ru'>(() => {
      return (localStorage.getItem('lang') as 'az' | 'en' | 'ru') || 'az';
    });

  // ✅ GET ALL
  const getContactInfo = async () => {
    try {
      const res = await get(API_ENDPOINTS.CONTACT_INFO.GET_CONTACT_INFO);
      if (res) {
        setContactData(res.data[0]);
      }
    } catch (error) {
      console.error("GET CONTACT ERROR:", error);
    }
  };


  // ✅ UPDATE
  const updateContact = async (id: string, data: ContactPayload) => {
    try {
      const res = await put(API_ENDPOINTS.CONTACT_INFO.UPDATE_CONTACT_INFO(id), data);
      if (res) {
        await getContactInfo();
      }
    } catch (error) {
      console.error("UPDATE CONTACT ERROR:", error);
    }
  };

  // GET CONTACT REQUESTS
const getContactRequests = async (status?: string) => {
  try {
    const res = await get(
      API_ENDPOINTS.CONTACT_REQUEST.GET_CONTACT_REQUEST(status)
    );

    return res?.data;
  } catch (error) {
    console.error("GET CONTACT REQUESTS ERROR:", error);
    throw error;
  }
};

// CREATE CONTACT REQUEST
const createContactRequest = async (
  data: CreateContactRequestPayload
) => {
  try {
    const res = await post(
      API_ENDPOINTS.CONTACT_REQUEST.CREATE_CONTACT_REQUEST,
      data
    );

    return res?.data;
  } catch (error) {
    console.error("CREATE CONTACT REQUEST ERROR:", error);
    throw error;
  }
};

// PATCH STATUS
const updateContactRequestStatus = async (
  id: string | number,
  data: UpdateContactRequestStatusPayload
) => {
  try {
    const res = await patch(
      API_ENDPOINTS.CONTACT_REQUEST.UPDATE_CONTACT_REQUEST(id),
      data
    );

    return res?.data;
  } catch (error) {
    console.error("UPDATE CONTACT REQUEST STATUS ERROR:", error);
    throw error;
  }
};

  
   useEffect(() => {
        getContactInfo();
      }, [lang]);





  return (
    <ContactContext.Provider
      value={{
        loading,
        contactData,
        getContactInfo,
        updateContact,

        getContactRequests,
        createContactRequest,
        updateContactRequestStatus,
      }}
    >
      {children}
    </ContactContext.Provider>
  );
};