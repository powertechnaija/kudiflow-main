import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const api = axios.create({
  baseURL: 'https://9000-firebase-dream-1763315369962.cluster-ikslh4rdsnbqsvu5nw3v4dqjj2.cloudworkstations.dev/api', // Replace with your actual API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
