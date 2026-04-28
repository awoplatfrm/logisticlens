import axios, { AxiosResponse } from "axios";
const base_url = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api",
    timeout: 15000 // 15-second timeout for all requests
});

base_url.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;
});

base_url.interceptors.response.use(
    (response) => response,
    (error) => {
        // If the backend says the token is invalid/expired, log them out automatically
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            // Only force a redirect if the user isn't already on the login page
            if (window.location.pathname !== "/admin/login") {
                window.location.href = "/admin/login";
            }
        }
        return Promise.reject(error);
    }
);

export const api = {

    get: async (endpoint: string) => {
        const response: AxiosResponse = await base_url.get(`${endpoint}`, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        });
        return response;
    },

    post: async (endpoint: string, data?: any) => {

        const response = await base_url.post(`${endpoint}`, data);
        return response;
    },
    delete: async (endpoint: string) => {

        const respose = await base_url.delete(`${endpoint}`);

        return respose;
    },
    put: async (endpoint: string, data?: any) => {
        const respose = await base_url.put(`${endpoint}`, data);

        return respose;
    }

}