import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach token and Localtunnel bypass header to every request
api.interceptors.request.use((config) => {
  // Bypasses the Localtunnel splash screen for background AJAX requests
  config.headers['Bypass-Tunnel-Reminder'] = 'true'
  config.headers['ngrok-skip-browser-warning'] = 'true' // For ngrok
  
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global 401 handler → redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
