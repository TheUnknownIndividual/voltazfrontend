const resolveApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")) {
      return "http://localhost:5001/api/";
    }
  }
  return "https://test.api.volt.az/api/";
};

const API_BASE_URL = resolveApiBaseUrl();
const URL = API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;
// const URL = "https://api.volt.az/api/" # DO NOT USE THIS URL, IT IS FOR PREPROD ENVIRONMENT
// const URL = "https://test.api.volt.az/api/"

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${URL}AdminAuth/login`,
    REFRESH: `${URL}Auth/refresh`,
    LOGOUT: `${URL}Auth/logout`,
    CUSTOMER_LOGIN: `${URL}CustomerAuth/login`,
    CUSTOMER_REGISTER: `${URL}CustomerAuth/register`,
    CUSTOMER_ME: `${URL}CustomerAuth/me`,
    GOOGLE_LOGIN: `${URL}CustomerAuth/social/google`,
    APPLE_LOGIN: `${URL}CustomerAuth/social/apple`,
    PASSKEY_REGISTER_OPTIONS: `${URL}CustomerAuth/passkeys/register/options`,
    PASSKEY_REGISTER_COMPLETE: `${URL}CustomerAuth/passkeys/register/complete`,
    PASSKEY_LOGIN_OPTIONS: `${URL}CustomerAuth/passkeys/login/options`,
    PASSKEY_LOGIN_COMPLETE: `${URL}CustomerAuth/passkeys/login/complete`,
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
  ADMIN_PROJECT_TRACKER: {
    GET_PROJECTS: `${URL}AdminProjectTracker`,
    CREATE_PROJECT: `${URL}AdminProjectTracker`,
    UPDATE_PROJECT: (id: string | number) => `${URL}AdminProjectTracker/${id}`,
    DELETE_PROJECT: (id: string | number) => `${URL}AdminProjectTracker/${id}`,
    GET_PROJECT: (id: string | number) => `${URL}AdminProjectTracker/${id}`,
  },
  SERVICE: {
    GET_SERVICE: `${URL}ServicesManagement`,
    GET_ADMIN_SERVICES: `${URL}ServicesManagement/admin`,
    CREATE_SERVICE: `${URL}ServicesManagement`,
    UPDATE_SERVICE: (id: string) => `${URL}ServicesManagement/${id}`,
    DELETE_SERVICE: (id: string) => `${URL}ServicesManagement/${id}`,
    GET_ID_SERVICE: (id: string) => `${URL}ServicesManagement/${id}`,
    GET_PAGE_BY_SLUG: (slug: string) => `${URL}ServicesManagement/page/${encodeURIComponent(slug)}`,
    GET_CATEGORY_SETTINGS: `${URL}ServicesManagement/category-settings`,
    UPDATE_CATEGORY_SETTING: (category: number) => `${URL}ServicesManagement/category-settings/${category}`,
  },
  HOME_SLIDER: {
    GET: `${URL}HomeSliders`,
    UPDATE: `${URL}HomeSliders`,
  },
  SEARCH: {
    GET_SEARCH: (query: string, productLimit = 6) => {
      const params = new URLSearchParams();
      params.append("Query", query);
      params.append("ProductLimit", String(productLimit));
      return `${URL}Search?${params.toString()}`;
    },
  },
  SERVICE_REQUEST: {
    GET_SERVICE_REQUEST:  (status?: string) =>`${URL}ServiceRequests${status ? `?status=${status}` : ''}`,
    CREATE_SERVICE_REQUEST: `${URL}ServiceRequests`,
    UPDATE_SERVICE_STATUS: (id: string) => `${URL}ServiceRequests/status?id=${id}`,
    GET_ID_SERVICE_REQUEST: (id: string) => `${URL}ServiceRequests/${id}`,
    MARK_SERVICE_REQUEST_VIEWED: (id: string | number) => `${URL}ServiceRequests/${id}/viewed`,
  },
  ORDER: {
    GET_ORDERS: (status?: string) => `${URL}Orders${status ? `?status=${status}` : ''}`,
    GET_MY_ORDERS: `${URL}Orders/my`,
    CREATE_ORDER: `${URL}Orders`,
    GET_ORDER: (id: string | number) => `${URL}Orders/${id}`,
    LOOKUP_ORDER: (orderNumber: string, email: string) =>
      `${URL}Orders/lookup?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`,
    UPDATE_ORDER_STATUS: (id: string | number) => `${URL}Orders/status?id=${id}`,
    MARK_ORDER_VIEWED: (id: string | number) => `${URL}Orders/${id}/viewed`,
  },
  CATEGORY: {
    GET_CATEGORY: `${URL}ProductCategories`,
    GET_HOME_PAGE_CATEGORIES: `${URL}ProductCategories/homepage`,
    GET_CATEGORY_BY_SEO_KEY: (seoKey: string) => `${URL}ProductCategories/seo/${encodeURIComponent(seoKey)}`,
    GET_CATEGORY_PRODUCT_OPTIONS: (id: string | number) => `${URL}ProductCategories/${id}/product-options`,
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
  pageSize?: number,
  search?: string,
  stockStatus?: string
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

  if (search?.trim()) {
    params.append("Search", search.trim());
  }

  if (stockStatus?.trim() && stockStatus !== "All") {
    params.append("StockStatus", stockStatus);
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
    UPDATE_PRODUCT: (id: string | number) => `${URL}Products/${id}`,
    DELETE_PRODUCT: (id: string | number) => `${URL}Products/${id}`,
    SHOW_PRODUCT: `${URL}Products/ShowHomePage`,
    GET_ID_PRODUCT: (id: string | number) => `${URL}Products/${id}`,
    GET_PRODUCT_COUNT: `${URL}Products/ShowHomePageProductCount`,
  },
  SOLAR_INVERTERS: {
    GET_ALL: (systemType: string, phase: string) =>
      `${URL}SolarInverters?systemType=${encodeURIComponent(systemType)}&phase=${encodeURIComponent(phase)}`,
  },
  CONTACT_REQUEST:{
    CREATE_CONTACT_REQUEST: `${URL}ContactRequsts`,
    GET_CONTACT_REQUEST: (status?: string) =>`${URL}ContactRequsts${status ? `?status=${status}` : ''}`,
    UPDATE_CONTACT_REQUEST: (id: string | number) =>`${URL}ContactRequsts/status?id=${id}`,
    MARK_CONTACT_REQUEST_VIEWED: (id: string | number) => `${URL}ContactRequsts/${id}/viewed`,
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
    MARK_PARTNERSHIP_REQUEST_VIEWED: (id: string | number) => `${URL}PartnershipRequests/${id}/viewed`,
  },
  SOLAR_ANALYTICS: {
    SEARCH_PROJECTS: (query?: string) => `${URL}SolarAnalytics/projects${query ? `?query=${encodeURIComponent(query)}` : ''}`,
    ADMIN_DOCX_EXPORT: `${URL}SolarAnalytics/admin/docx-export`,
    ADMIN_PDF_EXPORT: `${URL}SolarAnalytics/admin/pdf-export`,
    PUBLIC_CALCULATION: `${URL}SolarAnalytics/public/calculation`,
    PUBLIC_WHATSAPP_CLICK: `${URL}SolarAnalytics/public/whatsapp-click`,
    DASHBOARD: (from?: string, to?: string) => {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      return `${URL}SolarAnalytics/dashboard${params.toString() ? `?${params.toString()}` : ''}`;
    },
  }

};
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  USER_ROLE: 'userRole',
  LANGUAGE: 'language'
};

export const AUTH_EXPIRED_EVENT = 'volt-auth-expired';
export const AUTH_EXPIRY_WARNING_KEY = 'volt-auth-expiry-warning-shown';
