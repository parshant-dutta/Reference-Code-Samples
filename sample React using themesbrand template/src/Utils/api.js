import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

export default API;