import React, { createContext, useContext, useState, useEffect } from "react";
import useApi from "../hooks/useApi";
import { API_ENDPOINTS } from "../utils/constants";

interface LanguageItem {
  languageCode: number;
  title: string;
  description: string;
  location1: string;
  location2: string;
}

interface ProjectPayload {
  languages: LanguageItem[];
  imagePaths: string[];
  totalPower: number;
  powerType: number;
  annualProduction: number;
  annualProductionType: number;
  systemType: number;
}

interface ProjectContextType {
  loading: boolean;
  projects: any[];
  getProjects: () => Promise<void>;
  createProject: (data: ProjectPayload) => Promise<void>;
  updateProject: (id: string, data: ProjectPayload) => Promise<any>;
  getProjectById: (id: string) => Promise<any>;
  deleteProject: (id: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within ProjectProvider");
  }
  return context;
};

export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
  const { get, post, del, put, loading } = useApi(); // 👈 del əlavə olmalıdır

  const [lang] = useState<'az' | 'en' | 'ru'>(() => {
    return (localStorage.getItem('lang') as 'az' | 'en' | 'ru') || 'az';
  });

  const [projects, setProjects] = useState<any[]>([]);

  // ✅ GET ALL
  const getProjects = async () => {
    try {
      const res = await get(API_ENDPOINTS.PROJECT.GET_PROJECT);
      setProjects(res?.data || []);
    } catch (err) {
      console.error("Get projects error:", err);
    }
  };

  // ✅ CREATE
  const createProject = async (data: ProjectPayload) => {
    try {
      await post(API_ENDPOINTS.PROJECT.CREATE_PROJECT, data);
      await getProjects();
    } catch (err) {
      console.error("Create project error:", err);
    }
  };

  // ⭐ GET BY ID (NEW)
  const getProjectById = async (id: string) => {
    try {
      const res = await get(API_ENDPOINTS.PROJECT.GET_ID_PROJECT(id));
      return res?.data;
    } catch (err) {
      console.error("Get project by id error:", err);
    }
  };

   const updateProject = async (id: string, data: ProjectPayload) => {
      try {
        const response = await put(API_ENDPOINTS.PROJECT.UPDATE_PROJECT(id), data);
        return response;
      } catch (error) {
        console.error("Update news error:", error);
        throw error;
      }
    };

  // 🗑 DELETE (NEW)
  const deleteProject = async (id: string) => {
    try {
      await del(API_ENDPOINTS.PROJECT.DELETE_PROJECT(id));
      await getProjects(); // refresh
    } catch (err) {
      console.error("Delete project error:", err);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        loading,
        projects,
        getProjects,
        createProject,
        updateProject,
        getProjectById,
        deleteProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};