// src/api.js
import axios from "axios";
import { ACCESS_TOKEN } from "./Constants"; // Ensure the correct path

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,

});

api.interceptors.request.use(
    function(Config) {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            Config.headers.Authorization = `Bearer ${token}`;
        }
        return Config;
    },
    function(error) {
        return Promise.reject(error,'api error');
    }
);

api.interceptors.response.use(
    function(response) {
        console.log('response received', response);
        return response;
    },
    function(error) {
        console.log(error)
        return Promise.reject(error);
    }
);
