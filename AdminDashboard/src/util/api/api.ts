import axios from 'axios';

const URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const api = axios.create({
    baseURL: URL,
    headers:{
        'Content-Type':'application/json'
    },
})

export default api