import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FaChartLine, FaClock, FaLightbulb, FaUser, FaSignOutAlt } from "react-icons/fa"
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiUserPlus } from "react-icons/fi"
import { useUser } from "../context/UserContext"
import API_BASE_URL from "../config"
import axios from "axios"

function LandingPage() {
  const navigate = useNavigate()
  const { user, logoutUser, loginUser, updateUser } = useUser()
  const [showSignupModal, setShowSignupModal] = useState(!user && localStorage.getItem("showSignup") !== "false")
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  
  // Form states
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Profile edit form fields
  const [dob, setDob] = useState(user?.dob || "")
  const [birthTime, setBirthTime] = useState(user?.birth_time || "")
  const [birthPlace, setBirthPlace] = useState(user?.birth_place || "")
  const [address, setAddress] = useState(user?.address || "")
  const [birthTimeAccuracy, setBirthTimeAccuracy] = useState(user?.birth_time_accuracy || "estimated")

  // Password strength logic
  const calculatePasswordStrength = (pass) => {
    let strength = 0
    if (!pass) return 0
    if (pass.length >= 8) strength += 25
    if (pass.length >= 12) strength += 15
    if (/[a-z]/.test(pass)) strength += 15
    if (/[A-Z]/.test(pass)) strength += 15
    if (/[0-9]/.test(pass)) strength += 15
    if (/[^A-Za-z0-9]/.test(pass)) strength += 15
    return Math.min(strength, 100)
  }

  const handlePasswordChange = (e) => {
    const pass = e.target.value
    setPassword(pass)
    setPasswordStrength(calculatePasswordStrength(pass))
  }

  const getPasswordStrengthLabel = () => {
    if (passwordStrength < 25) return "Weak"
    if (passwordStrength < 50) return "Fair"
    if (passwordStrength < 75) return "Good"
    return "Strong"
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return "#f87171"
    if (passwordStrength < 50) return "#fb923c"
    if (passwordStrength < 75) return "#fbbf24"
    return "#34d399"
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Signup
      const signupRes = await axios.post(`${API_BASE_URL}/auth/signup`, {
        email,
        password,
        name: name || email.split("@")[0]
      })

      // Auto login after signup
      const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      })

      const loginData = loginRes.data

      // Store user and close modal
      loginUser({ 
        email, 
        id: loginData.user?.id || Math.random(),
        role: loginData.user?.role || "user",
        name: loginData.user?.name || name || email.split("@")[0]
      })
      setShowSignupModal(false)
      resetForm()
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      })

      const data = loginRes.data

      // Fetch user birth data
      const userDataRes = await axios.get(`${API_BASE_URL}/health/user/birth-data?email=${email}`)
      const userData = userDataRes.data

      // Store user with all info
      const userInfo = { 
        email, 
        id: data.user?.id || Math.random(),
        role: data.user?.role || "user",
        name: data.user?.name || email.split("@")[0],
        dob: userData.dob || "",
        birth_time: userData.birth_time || "",
        birth_place: userData.birth_place || "",
        address: userData.address || "",
        birth_time_accuracy: userData.birth_time_accuracy || "estimated"
      }
      
      loginUser(userInfo)
      setShowLoginModal(false)
      resetForm()
      
      // Update form fields with fetched data
      setDob(userData.dob || "")
      setBirthTime(userData.birth_time || "")
      setBirthPlace(userData.birth_place || "")
      setAddress(userData.address || "")
      setBirthTimeAccuracy(userData.birth_time_accuracy || "estimated")
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setName("")
    setError("")
    setPasswordStrength(0)
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const updateRes = await fetch(`${API_BASE_URL}/health/user/birth-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: user.email,
          dob,
          birth_time: birthTime,
          birth_place: birthPlace,
          address,
          birth_time_accuracy: birthTimeAccuracy
        })
      })

      if (!updateRes.ok) throw new Error("Update failed")

      // Update local user context
      const updatedUser = {
        ...user,
        dob,
        birth_time: birthTime,
        birth_place: birthPlace,
        address,
        birth_time_accuracy: birthTimeAccuracy
      }
      updateUser(updatedUser)
      setShowEditModal(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logoutUser()
    setShowProfileDropdown(false)
    navigate("/")
  }

  return (
    <div className="landing">
      {/* Navbar */}
     {/* Navbar */}
      <nav className="navbar">
        <h2 className="logo">Vedastro</h2>

        {user ? (
          <div className="profile-menu">
            <button 
              className="profile-btn"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              <FaUser size={18} /> {user.name || user.email?.split("@")[0]}
            </button>

            {showProfileDropdown && (
  <div className="profile-dropdown">

    {/* Username */}
    <div className="dropdown-item" style={{ padding: "10px" }}>
      <strong>{user.name || user.email?.split("@")[0]}</strong>
    </div>

    {/* Profile Button */}
    <button
      className="dropdown-item"
      onClick={() => {
        navigate("/profile") // ya "/form" agar wahi profile page hai
        setShowProfileDropdown(false)
      }}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "10px",
        background: "none",
        border: "none",
        cursor: "pointer"
      }}
    >
      Profile
    </button>

    {/* Sign Out */}
    <button
      className="dropdown-item"
      onClick={handleLogout}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "10px",
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "red"
      }}
    >
      <FaSignOutAlt /> Sign Out
    </button>

  </div>
)}
          </div>
        ) : (
          <button 
            className="login-btn"
            onClick={() => setShowLoginModal(true)}
          >
            Login
          </button>
        )}
      </nav>
      {/* Signup Modal */}
      {showSignupModal && !user && (
        <div className="modal-overlay" onClick={() => { setShowSignupModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Join Vedastro</h2>
            <p>Start your career analysis today</p>

            <form onSubmit={handleSignup}>
              <div className="modal-input-group">
                <div className="input-with-icon">
                  <FiUser className="input-icon" />
                  <input 
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-input-group">
                <div className="input-with-icon">
                  <FiMail className="input-icon" />
                  <input 
                    type="email"
                    placeholder="Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-input-group">
                <div className="input-with-icon">
                  <FiLock className="input-icon" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Create Password"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div className="strength-fill" style={{ width: `${passwordStrength}%`, backgroundColor: getPasswordStrengthColor() }}></div>
                    </div>
                    <span className="strength-label" style={{ color: getPasswordStrengthColor() }}>{getPasswordStrengthLabel()}</span>
                  </div>
                )}
              </div>

              <div className="modal-input-group">
                <div className="input-with-icon">
                  <FiLock className="input-icon" />
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {error && <p className="error-msg">{error}</p>}

              <button 
                type="submit" 
                className="modal-btn"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Sign Up & Continue"}
              </button>

              <p style={{textAlign: "center", marginTop: "16px", fontSize: "14px", color: "rgba(255,255,255,0.7)"}}>
                Already have an account? 
                <button 
                  type="button"
                  onClick={() => {
                    setShowSignupModal(false)
                    setShowLoginModal(true)
                    resetForm()
                  }}
                  style={{background: "none", border: "none", color: "#00f5ff", cursor: "pointer", marginLeft: "4px", textDecoration: "underline"}}
                >
                  Login here
                </button>
              </p>
            </form>

            <button 
              className="close-modal"
              onClick={() => { setShowSignupModal(false); resetForm(); }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && !user && (
        <div className="modal-overlay" onClick={() => { setShowLoginModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Welcome Back</h2>
            <p>Login to your Vedastro account</p>

            <form onSubmit={handleLogin}>
              <div className="modal-input-group">
                <div className="input-with-icon">
                  <FiMail className="input-icon" />
                  <input 
                    type="email"
                    placeholder="Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-input-group">
                <div className="input-with-icon">
                  <FiLock className="input-icon" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {error && <p className="error-msg">{error}</p>}

              <button 
                type="submit" 
                className="modal-btn"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <p style={{textAlign: "center", marginTop: "16px", fontSize: "14px", color: "rgba(255,255,255,0.7)"}}>
                Don't have an account? 
                <button 
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false)
                    setShowSignupModal(true)
                    resetForm()
                  }}
                  style={{background: "none", border: "none", color: "#00f5ff", cursor: "pointer", marginLeft: "4px", textDecoration: "underline"}}
                >
                  Sign up here
                </button>
              </p>
            </form>

            <button 
              className="close-modal"
              onClick={() => { setShowLoginModal(false); resetForm(); }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && user && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <h2>Edit Profile</h2>
            <p>Update your personal information</p>

            <form onSubmit={handleUpdateProfile}>
              <div className="modal-input-group">
                <label>Birth Date</label>
                <input 
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>

              <div className="modal-input-group">
                <label>Birth Time</label>
                <input 
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                />
              </div>

              <div className="modal-input-group">
                <label>Birth Time Accuracy</label>
                <select 
                  value={birthTimeAccuracy}
                  onChange={(e) => setBirthTimeAccuracy(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid rgba(0, 245, 255, 0.3)",
                    borderRadius: "6px",
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "#fff",
                    fontSize: "14px"
                  }}
                >
                  <option value="exact">Exact</option>
                  <option value="approximate">Approximate</option>
                  <option value="estimated">Estimated</option>
                </select>
              </div>

              <div className="modal-input-group">
                <label>Birth Place</label>
                <input 
                  type="text"
                  placeholder="City, Country"
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                />
              </div>

              <div className="modal-input-group">
                <label>Full Address</label>
                <textarea 
                  placeholder="Enter your full address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid rgba(0, 245, 255, 0.3)",
                    borderRadius: "6px",
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "#fff",
                    fontSize: "14px",
                    minHeight: "80px",
                    fontFamily: "inherit",
                    resize: "vertical"
                  }}
                />
              </div>

              {error && <p className="error-msg">{error}</p>}

              <button 
                type="submit" 
                className="modal-btn"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>

            <button 
              className="close-modal"
              onClick={() => setShowEditModal(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero">
        <div className="overlay"></div>

        <div className="hero-content">
          <h1>Know When to Act in Your Career</h1>
          <p>
            Understand when to build skills, when to switch roles,
            and when opportunities are likely to appear.
          </p>

          {!user && (
            <div className="buttons">
              <button
                className="btn primary"
                onClick={() => setShowSignupModal(true)}
              >
                Start Free Analysis
              </button>
              <button className="btn secondary">
                See Sample Report
              </button>
            </div>
          )}
          
          {user && (
            <div className="buttons">
              <button
                className="btn primary"
                onClick={() => navigate("/form")}
              >
                Complete Profile
              </button>
              <button 
                className="btn secondary"
                onClick={() => navigate(user.role === "admin" ? "/admin/dashboard" : "/dashboard")}
              >
                {user.role === "admin" ? "Admin Dashboard" : "View Dashboard"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <h2>Discover the Best Times for Your Career</h2>
        <div className="feature-grid">
          <div className="feature">
            <FaChartLine size={30} color="#4a6cf7"/>
            <h3>Career Alignment Score</h3>
            <p>Measure your career readiness and alignment.</p>
          </div>

          <div className="feature">
            <FaClock size={30} color="#4a6cf7"/>
            <h3>Opportunity Windows</h3>
            <p>Identify the right times to make career changes.</p>
          </div>

          <div className="feature">
            <FaLightbulb size={30} color="#4a6cf7"/>
            <h3>Decision Guidance</h3>
            <p>Receive personalized actions to support your goals.</p>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="testimonial">
        <h3>Trusted by Thousands</h3>
        <p>Accurate career predictions with 92% satisfaction.</p>

        <div className="testimonial-box">
          <div className="accuracy">
            <strong>92% Accuracy</strong>
            <p>Based on user feedback</p>
          </div>

          <p className="quote">
            "Vedastro pinpointed my ideal career switch window.
            Their timing predictions were remarkably precise."
          </p>

          <div className="user">
            <img
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt="user"
            />
            <span>Erica S., Marketing Manager</span>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }
        .modal-content {
          background: #16171d;
          padding: 40px;
          border-radius: 20px;
          width: 100%;
          max-width: 420px;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .modal-content h2 {
          margin: 0 0 10px 0;
          color: #fff;
          font-size: 28px;
          text-align: center;
        }
        .modal-content p {
          color: rgba(255, 255, 255, 0.6);
          text-align: center;
          margin-bottom: 30px;
          font-size: 15px;
        }
        .modal-input-group {
          margin-bottom: 20px;
        }
        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          color: rgba(255, 255, 255, 0.4);
          font-size: 18px;
        }
        .modal-input-group input {
          width: 100%;
          padding: 14px 14px 14px 45px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          font-size: 15px;
          outline: none;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }
        .modal-input-group input:focus {
          border-color: #00f5ff;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 4px rgba(0, 245, 255, 0.1);
        }
        .password-toggle {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0;
          font-size: 18px;
        }
        .password-toggle:hover {
          color: #fff;
        }
        .password-strength {
          margin-top: 10px;
        }
        .strength-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }
        .strength-fill {
          height: 100%;
          transition: width 0.4s ease;
        }
        .strength-label {
          font-size: 12px;
          margin-top: 6px;
          display: block;
          text-align: right;
          font-weight: 600;
        }
        .modal-btn {
          width: 100%;
          padding: 16px;
          background: #00f5ff;
          color: #000;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          margin-top: 10px;
          transition: all 0.3s ease;
        }
        .modal-btn:hover {
          background: #00d8e0;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 245, 255, 0.2);
        }
        .modal-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        .error-msg {
          color: #f87171;
          font-size: 14px;
          margin-bottom: 15px;
          text-align: center;
          background: rgba(248, 113, 113, 0.1);
          padding: 10px;
          border-radius: 8px;
          border: 1px solid rgba(248, 113, 113, 0.2);
        }
        .close-modal {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.05);
          border: none;
          color: rgba(255, 255, 255, 0.5);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .close-modal:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  )
}

export default LandingPage
