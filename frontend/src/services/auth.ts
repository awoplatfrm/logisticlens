import { api } from "./api";


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
    }
}