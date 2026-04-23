import express from 'express';                             
const router = express.Router();
import db, { logAction } from '../database/database.js';

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; 

export const getHomeData = async (userId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/home/status/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching home data:", error);
        throw error;
    }
};

export const logUserAction = async (userId, action) => {
    return await axios.post(`${API_BASE_URL}/home/log-action`, { userId, action });
};


export default router;