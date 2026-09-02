import React, { createContext, useContext, useState } from "react";
import useApi from "../hooks/useApi";
import { API_ENDPOINTS } from "../utils/constants";

export interface GoogleReview {
  reviewerName: string;
  reviewerPhotoUrl: string;
  rating: number;
  text: string;
  relativeTime: string;
  publishTime: number;
}

interface GoogleReviewsResult {
  overallRating: number | null;
  userRatingCount: number | null;
  googleMapsUrl: string;
  reviews: GoogleReview[];
}

interface GoogleReviewsContextType {
  loading: boolean;
  result: GoogleReviewsResult | null;
  getReviews: () => Promise<void>;
}

const GoogleReviewsContext = createContext<GoogleReviewsContextType | null>(null);

export const useGoogleReviews = () => {
  const context = useContext(GoogleReviewsContext);
  if (!context) {
    throw new Error("useGoogleReviews must be used within GoogleReviewsProvider");
  }
  return context;
};

export const GoogleReviewsProvider = ({ children }: { children: React.ReactNode }) => {
  const { get, loading } = useApi();
  const [result, setResult] = useState<GoogleReviewsResult | null>(null);

  const getReviews = async () => {
    try {
      const res = await get(API_ENDPOINTS.GOOGLE_REVIEWS.GET_GOOGLE_REVIEWS, { skipAuth: true });
      setResult(res?.data || null);
    } catch (err) {
      console.error("Get Google reviews error:", err);
    }
  };

  return (
    <GoogleReviewsContext.Provider value={{ loading, result, getReviews }}>
      {children}
    </GoogleReviewsContext.Provider>
  );
};
