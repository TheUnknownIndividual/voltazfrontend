import PrivacyPolicy from "@/components/PrivacyPolicy";
import { SERVFAIL } from "dns";


const URL = "https://test.api.volt.az/api/";
// const URL = "https://api.volt.az/api/" # DO NOT USE THIS URL, IT IS FOR PREPROD ENVIRONMENT


export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${URL}AdminAuth/login`,
  },
  ABOUT: {
    GET_ABOUT: `${URL}Abouts`,
    CREATE_ABOUT: `${URL}Abouts`,
    UPDATE_ABOUT: (id: string) => `${URL}Abouts/${id}`,
    DELETE_ABOUT: (id: string) => `${URL}Abouts/${id}`,
    GET_ID_ABOUT: (id: string) => `${URL}Abouts/${id}`,
    REORDER: `${URL}Abouts/reorder`,
  },
  UPLOAD: {
    UPLOAD_IMAGE: `${URL}Uploads/image`,
    DELETE_IMAGE: (fileURL: string) => `${URL}Uploads/image?fileUrl=${fileURL}`,
    UPLOAD_PDF: `${URL}Uploads/pdf`,
    DELETE_PDF: (fileURL: string) => `${URL}Uploads?fileUrl=${fileURL}`,
  },
  APPLICATIONTYPE: {
    GET_APPLICATION_TYPE: `${URL}ApplicationTypes`,
    CREATE_APPLICATION_TYPE: `${URL}ApplicationTypes`,
    UPDATE_APPLICATION_TYPE: (id: string) => `${URL}ApplicationTypes/${id}`,
    DELETE_APPLICATION_TYPE: (id: string) => `${URL}ApplicationTypes/${id}`,
    GET_ID_APPLICATION_TYPE: (id: string) => `${URL}ApplicationTypes/${id}`,
  },
  NEWS: {
    GET_NEWS: `${URL}NewsPosts`,
    CREATE_NEWS: `${URL}NewsPosts`,
    UPDATE_NEWS: (id: string) => `${URL}NewsPosts/${id}`,
    DELETE_NEWS: (id: string) => `${URL}NewsPosts/${id}`,
    GET_ID_NEWS: (id: string) => `${URL}NewsPosts/${id}`,
    PUBLIC_NEWS: `${URL}NewsPosts/GetAllForPublic`,
  },
  BLOG: {
    GET_BLOG: `${URL}Blogs`,
    CREATE_BLOG: `${URL}Blogs`,
    UPDATE_BLOG: (id: string) => `${URL}Blogs/${id}`,
    DELETE_BLOG: (id: string) => `${URL}Blogs/${id}`,
    GET_ID_BLOG: (id: string) => `${URL}Blogs/${id}`,
  },
  PROJECT: {
    GET_PROJECT: `${URL}Projects`,
    CREATE_PROJECT: `${URL}Projects`,
    UPDATE_PROJECT: (id: string) => `${URL}Projects/${id}`,
    DELETE_PROJECT: (id: string) => `${URL}Projects/${id}`,
    GET_ID_PROJECT: (id: string) => `${URL}Projects/${id}`,
  },
  SERVICE: {
    GET_SERVICE: `${URL}ServicesManagement`,
    CREATE_SERVICE: `${URL}ServicesManagement`,
    UPDATE_SERVICE: (id: string) => `${URL}ServicesManagement/${id}`,
    DELETE_SERVICE: (id: string) => `${URL}ServicesManagement/${id}`,
    GET_ID_SERVICE: (id: string) => `${URL}ServicesManagement/${id}`,
  },
  SERVICE_REQUEST: {
    GET_SERVICE_REQUEST:  (status?: string) =>`${URL}ServiceRequests${status ? `?status=${status}` : ''}`,
    CREATE_SERVICE_REQUEST: `${URL}ServiceRequests`,
    UPDATE_SERVICE_STATUS: (id: string) => `${URL}ServiceRequests/status?id=${id}`,
    GET_ID_SERVICE_REQUEST: (id: string) => `${URL}ServiceRequests/${id}`,
  },
  CATEGORY: {
    GET_CATEGORY: `${URL}ProductCategories`,
    CREATE_CATEGORY: `${URL}ProductCategories`,
    UPDATE_CATEGORY: (id: string) => `${URL}ProductCategories/${id}`,
    DELETE_CATEGORY: (id: string) => `${URL}ProductCategories/${id}`,
    GET_ID_CATEGORY: (id: string) => `${URL}ProductCategories/${id}`,
  },
  SUBCATEGORY: {
    GET_SUBCATEGORY: (categoryId: string | number) =>
  `${URL}ProductSubCategories?ProductCategoryId=${categoryId}`,
    CREATE_SUBCATEGORY: `${URL}ProductSubCategories`, 
    UPDATE_SUBCATEGORY: (id: string) => `${URL}ProductSubCategories/${id}`,
    DELETE_SUBCATEGORY: (id: string) => `${URL}ProductSubCategories/${id}`,
    GET_ID_SUBCATEGORY: (id: string) => `${URL}ProductSubCategories/${id}`,
  },
  PROMOTION: {
    GET_PROMOTION: `${URL}Promotions`,
    CREATE_PROMOTION: `${URL}Promotions`,
    UPDATE_PROMOTION: (id: string) => `${URL}Promotions/${id}`,
    DELETE_PROMOTION: (id: string) => `${URL}Promotions/${id}`,
    GET_ID_PROMOTION: (id: string) => `${URL}Promotions/${id}`,
  },
  BRAND: {
    GET_BRAND: (categoryId: string | number) =>
  `${URL}ProductBrands?ProductCategoryId=${categoryId}`,
    CREATE_BRAND: `${URL}ProductBrands`,
    UPDATE_BRAND: (id: string) => `${URL}ProductBrands/${id}`,
    DELETE_BRAND: (id: string) => `${URL}ProductBrands/${id}`,
    GET_ID_BRAND: (id: string) => `${URL}ProductBrands/${id}`,
  },
  TECHNOLOGY: {
    GET_TECHNOLOGY: (categoryId: string | number) =>
  `${URL}ProductTechnologies?ProductCategoryId=${categoryId}`,
    CREATE_TECHNOLOGY: `${URL}ProductTechnologies`,
    UPDATE_TECHNOLOGY: (id: string) => `${URL}ProductTechnologies/${id}`,
    DELETE_TECHNOLOGY: (id: string) => `${URL}ProductTechnologies/${id}`,
    GET_ID_TECHNOLOGY: (id: string) => `${URL}ProductTechnologies/${id}`,
  },
  PRODUCT: {
    GET_PRODUCT: (
  initialCategory?: number,
  initialSubCategory?: number,
  page?: number,
  pageSize?: number
) => {
  const params = new URLSearchParams();

  if (initialCategory !== undefined) {
    params.append("ProductCategoryId", String(initialCategory));
  }

  if (initialSubCategory !== undefined) {
    params.append("ProductSubCategoryId", String(initialSubCategory));
  }

  if (page !== undefined) {
    params.append("Page", String(page));
  }

  if (pageSize !== undefined) {
    params.append("PageSize", String(pageSize));
  }

  return `${URL}Products${
    params.toString() ? `?${params.toString()}` : ""
  }`;
},
  GET_PRODUCT_FOR_HOME: (
  initialCategory?: number,
  initialSubCategory?: number,
  page?: number,
  pageSize?: number
) => {
  const params = new URLSearchParams();

  if (initialCategory !== undefined) {
    params.append("ProductCategoryId", String(initialCategory));
  }

  if (initialSubCategory !== undefined) {
    params.append("ProductSubCategoryId", String(initialSubCategory));
  }

  if (page !== undefined) {
    params.append("Page", String(page));
  }

  if (pageSize !== undefined) {
    params.append("PageSize", String(pageSize));
  }

  return `${URL}Products/HomePage${
    params.toString() ? `?${params.toString()}` : ""
  }`;
},
    CREATE_PRODUCT: `${URL}Products`,
    UPDATE_PRODUCT: (id: string) => `${URL}Products/${id}`,
    DELETE_PRODUCT: (id: string) => `${URL}Products/${id}`,
    SHOW_PRODUCT: `${URL}Products/ShowHomePage`,
    GET_ID_PRODUCT: (id: string) => `${URL}Products/${id}`,
    GET_PRODUCT_COUNT: `${URL}Products/ShowHomePageProductCount`,
  },
  CONTACT_REQUEST:{
    CREATE_CONTACT_REQUEST: `${URL}ContactRequsts`,
    GET_CONTACT_REQUEST: (status?: string) =>`${URL}ContactRequsts${status ? `?status=${status}` : ''}`,
    UPDATE_CONTACT_REQUEST: (id: string | number) =>`${URL}ContactRequsts/status?id=${id}`,
  },
  CONTACT_INFO: {
    GET_CONTACT_INFO: `${URL}ContactInfos`,
    CREATE_CONTACT_INFO: `${URL}ContactInfos`,
    UPDATE_CONTACT_INFO: (id: string) => `${URL}ContactInfos/${id}`,
    DELETE_CONTACT_INFO: (id: string) => `${URL}ContactInfos/${id}`,
    GET_ID_CONTACT_INFO: (id: string) => `${URL}ContactInfos/${id}`,
  },
  PARTNERSHIP_TYPES: {
    GET_PARTNERSHIP_TYPES: `${URL}PartnershipTypes`,
    CREATE_PARTNERSHIP_TYPES: `${URL}PartnershipTypes`,
    GET_ID_PARTNERSHIP_TYPES: (id: string) => `${URL}PartnershipTypes/${id}`,
    UPDATE_PARTNERSHIP_TYPES: (id: string) => `${URL}PartnershipTypes/${id}`,
    DELETE_PARTNERSHIP_TYPES: (id: string) => `${URL}PartnershipTypes/${id}`,
  },
  PARTNERSHIP_REQUEST: {
    GET_PARTNERSHIP_REQUEST: (status?: string) => `${URL}PartnershipRequests${status ? `?status=${status}` : ''}`,
    CREATE_PARTNERSHIP_REQUEST: `${URL}PartnershipRequests`,
    GET_ID_PARTNERSHIP_REQUEST: (id: string) => `${URL}PartnershipRequests/${id}`,
    UPDATE_PARTNERSHIP_REQUEST: (id: string | number) => `${URL}PartnershipRequests/status?id=${id}`,
  }

};
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  USER_ROLE: 'userRole',
  LANGUAGE: 'language'
};