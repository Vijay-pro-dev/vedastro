import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useUser } from "../context/UserContext"
import API_BASE_URL from "../config"
import { FiMail, FiLock } from "react-icons/fi"

function AdminLogin() {
  const navigate = useNavigate()
  const { loginUser } = useUser()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAdmin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await axios.post(`${API_BASE_URL}/admin/login`, {
        email,
        password
      })

      const adminData = {
        id: res.data.user.id,
        email: res.data.user.email,
        name: res.data.user.name,
        role: "admin",
        token: res.data.access_token
      }

      loginUser(adminData)
      navigate("/admin/dashboard")
    } catch (err) {
      setError(err.response?.data?.detail || "Admin login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <h2>Vedastro Admin</h2>
        <p>Access the control panel</p>

        <form onSubmit={handleAdmin}>
          <div className="input-group">
            <FiMail className="input-icon" />
            <input 
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <FiLock className="input-icon" />
            <input 
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Authenticating..." : "Login to Dashboard"}
          </button>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .admin-login-page {
          background: #0a0a1a;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-family: 'Inter', sans-serif;
        }
        .admin-login-container {
          background: rgba(255, 255, 255, 0.02);
          padding: 3rem;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          width: 100%;
          max-width: 400px;
          text-align: center;
        }
        h2 { font-size: 2rem; margin-bottom: 0.5rem; color: #00f5ff; }
        p { color: rgba(255, 255, 255, 0.6); margin-bottom: 2rem; }
        .input-group {
          position: relative;
          margin-bottom: 1.5rem;
        }
        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.4);
        }
        input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 12px 12px 12px 40px;
          border-radius: 8px;
          color: white;
          box-sizing: border-box;
        }
        button {
          width: 100%;
          padding: 12px;
          background: #00f5ff;
          color: black;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          transition: 0.3s;
        }
        button:hover { background: #00d8e0; transform: translateY(-2px); }
        button:disabled { opacity: 0.7; cursor: not-allowed; }
        .error-message { color: #f87171; font-size: 0.9rem; margin-bottom: 1rem; }
      `}} />
    </div>
  )
}

export default AdminLogin
