// src/utils/uploadImages.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;


export const answerJson = async (files) => {
  if (!files || files.length === 0) {
    throw new Error("No files selected");
  }

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  try {
    const response = await axios.post(`${BASE_URL}/summarize`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      responseType: "json",
    });
    return response.data;
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error(error.response?.data?.detail || "Failed to upload images");
  }
};

export const saveHandwritingData = async (outputData) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/save-finetuning`, outputData);
    return response.data;
  } catch (error) {
    console.error("Error saving handwriting data:", error);
    throw error;
  }
};

export const getFinetuningStats = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/get-finetuning-stats`);
    return response.data;
  } catch (error) {
    console.error("Error fetching stats:", error);
    throw error;
  }
};

export const getResourcesList = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/resources-list`);
    return response.data.documents;
  } catch (error) {
    console.error("Error fetching resources list:", error);
    throw error;
  }
};

export const uploadPdf = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(`${BASE_URL}/review-pdf`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      responseType: "text",
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading PDF:", error);
    throw error;
  }
};

export const updatePdf = async (extractedText) => {
  try {
    const response = await axios.post(`${BASE_URL}/update-pdf`, {
      extractedText,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating PDF:", error);
    throw error;
  }
};
