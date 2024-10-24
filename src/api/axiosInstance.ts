import axios from "axios";
import { useTokenStore } from "../stores/useTokenStore";
import { useUserStore } from "../stores/useUserStore";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_PROD === true
      ? "http://localhost:5500"
      : "https://mdn-evaluacion.onrender.com",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
}); //Create the axios instance

//Add a request interceptor
axiosInstance.interceptors.request.use(
  function (config) {
    //Do something before request is sent
    const token = useTokenStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    //Handle the error
    return Promise.reject(error);
  }
);

// Add a response interceptor
axios.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  async function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await axiosInstance.post(
          "/refresh-token",
          {},
          { withCredentials: true }
        );
        const newAccessToken = response.data.accessToken;
        const setToken = useTokenStore.getState().setToken;
        setToken(newAccessToken);

        axios.defaults.headers.common["Authorization"] =
          "Bearer " + newAccessToken;
        originalRequest.headers["Authorization"] = "Bearer " + newAccessToken;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        useTokenStore.getState().clearToken();
        useUserStore.getState().clearUser();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
