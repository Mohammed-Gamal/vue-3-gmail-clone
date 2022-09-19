import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

export default {
  getEmails() {
    return apiClient.get(`/emails`)
  },
  updateEmail(email) {
    return apiClient.put(`/emails/${email.id}`, email)
  },
}
