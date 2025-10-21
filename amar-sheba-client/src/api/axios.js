import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // localhost নয়, বরং 127.0.0.1 ব্যবহার করো
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// ✅ প্রতিটি রিকোয়েস্টের সাথে টোকেন পাঠানো হবে
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); // ✅ accessToken ব্যবহার করো
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
