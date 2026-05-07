import { api } from "./api";
import { jwtDecode } from "jwt-decode";


export const authenticate = {

    login: async (email: string, password: string) => {
        return await api.post('/admin/login', { email, password })
    },

    logout: async () => {
        return await api.post("/admin/logout");
    },
    isLoggedIn: () => {
        const token = localStorage.getItem("token");
        return token ? true : false
    },
    userEmail: () => {
        const token = localStorage.getItem("token");
        const decoded = jwtDecode(token as string) as any;
        return decoded.email as string;
    },
    getDemos: async () => {
        return await api.get('/admin/demos');
    },
    createDemo: async (data: { email: string, password: string }) => {
        return await api.post('/admin/demos', data);
    },
    deleteDemo: async (id: string) => {
        return await api.delete(`/admin/demos/${id}`);
    }
}   