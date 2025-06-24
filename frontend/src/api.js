import axios from "axios"
import { ACCESS_TOKEN } from "./constants"

const isDevelopment = import.meta.env.MODE === 'development'
const myBaseUrl = isDevelopment ? import.meta.env.VITE_API_URL : import.meta.env.VITE_API_URL_DEPLOY

const api = axios.create({
    baseURL: myBaseUrl

})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if(token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)


export const getUserDetails = async () => {
    try {
        const response = await api.get("/api/user/details/");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch user details:", error);
        throw error;
    }
};



export default api