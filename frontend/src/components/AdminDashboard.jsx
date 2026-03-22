
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useUser } from "../context/UserContext"
import API_BASE_URL from "../config"
import axios from "axios"
import { 
    FaUsers, 
    FaUserPlus, 
    FaUserCheck, 
    FaHistory, 
    FaServer, 
    FaSignOutAlt, 
    FaThLarge,
    FaChartBar
} from "react-icons/fa"

const AdminDashboard = () => {
    const navigate = useNavigate()
    const { user, logoutUser } = useUser()
    const [currentView, setCurrentView] = useState("overview")
    const [stats, setStats] = useState({
        total_users: 0,
        users_signed_up: 0,
        users_online: 0
    })
    const [activities, setActivities] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!user || user.role !== "admin") {
            navigate("/admin")
            return
        }
        fetchDashboardData()
    }, [user, navigate])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            const statsRes = await axios.get(`${API_BASE_URL}/admin/dashboard/stats`)
            setStats(statsRes.data.stats)
            
            const activitiesRes = await axios.get(`${API_BASE_URL}/admin/dashboard/activities`)
            setActivities(activitiesRes.data.user_activities)
            setLoading(false)
        } catch (err) {
            setError("Failed to load dashboard data. Ensure services are running.")
            setLoading(false)
        }
    }

    const handleLogout = () => {
        logoutUser()
        navigate("/admin")
    }

    if (loading) return <div className="loading-container">Loading Admin Dashboard...</div>

    const renderContent = () => {
        switch(currentView) {
            case "overview":
                return (
                    <>
                        <header className="dashboard-header">
                            <h1>System Overview</h1>
                            <p>Track real-time statistics and user activities</p>
                        </header>

                        <div className="stats-grid">
                            <div className="stat-card clickable" onClick={() => setCurrentView("users")}>
                                <div className="stat-icon users"><FaUsers /></div>
                                <div className="stat-info">
                                    <h3>Total Users</h3>
                                    <p className="stat-value">{stats.total_users}</p>
                                </div>
                            </div>
                            <div className="stat-card clickable" onClick={() => setCurrentView("signed-up")}>
                                <div className="stat-icon signed-up"><FaUserPlus /></div>
                                <div className="stat-info">
                                    <h3>Users Signed Up</h3>
                                    <p className="stat-value">{stats.users_signed_up}</p>
                                </div>
                            </div>
                            <div className="stat-card clickable" onClick={() => setCurrentView("active")}>
                                <div className="stat-icon online"><FaUserCheck /></div>
                                <div className="stat-info">
                                    <h3>Users Currently Online</h3>
                                    <p className="stat-value">{stats.users_online}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon system"><FaServer /></div>
                                <div className="stat-info">
                                    <h3>System Status</h3>
                                    <p className="stat-value text-success">Operational</p>
                                </div>
                            </div>
                        </div>

                        <div className="activity-section">
                            <div className="section-header">
                                <h2><FaHistory /> Recent User Activity</h2>
                                <button onClick={fetchDashboardData} className="refresh-btn">Refresh Data</button>
                            </div>
                            {renderActivityLog()}
                        </div>
                    </>
                )
            case "users":
                return (
                    <div className="view-container">
                        <header className="dashboard-header">
                            <h1>Total Users</h1>
                            <p>Overview of all registered users in the system</p>
                        </header>
                        <div className="large-stat-card">
                            <FaUsers className="bg-icon" />
                            <div className="stat-content">
                                <h2>{stats.total_users}</h2>
                                <span>Total Registered Accounts</span>
                            </div>
                        </div>
                    </div>
                )
            case "signed-up":
                return (
                    <div className="view-container">
                        <header className="dashboard-header">
                            <h1>Signed-up Users</h1>
                            <p>Number of users who have completed the registration process</p>
                        </header>
                        <div className="large-stat-card green">
                            <FaUserPlus className="bg-icon" />
                            <div className="stat-content">
                                <h2>{stats.users_signed_up}</h2>
                                <span>Completed Signups</span>
                            </div>
                        </div>
                    </div>
                )
            case "active":
                return (
                    <div className="view-container">
                        <header className="dashboard-header">
                            <h1>Active Users</h1>
                            <p>Users who are currently authenticated and online</p>
                        </header>
                        <div className="large-stat-card orange">
                            <FaUserCheck className="bg-icon" />
                            <div className="stat-content">
                                <h2>{stats.users_online}</h2>
                                <span>Currently Logged In</span>
                            </div>
                        </div>
                    </div>
                )
            case "activity-log":
                return (
                    <div className="view-container">
                        <header className="dashboard-header">
                            <h1>Activity Log</h1>
                            <p>Full history of system events, logins, and signups</p>
                        </header>
                        <div className="activity-section full-width">
                            {renderActivityLog()}
                        </div>
                    </div>
                )
            default:
                return <div>Select a view from the sidebar</div>
        }
    }

    const renderActivityLog = () => (
        <div className="activity-log">
            {error && <div className="error-banner">{error}</div>}
            {activities.length === 0 ? (
                <p className="no-data">No recent activities found.</p>
            ) : (
                <table className="activity-table">
                    <thead>
                        <tr>
                            <th>User Email</th>
                            <th>Action</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activities.map((activity, index) => (
                            <tr key={index}>
                                <td className="email-cell">{activity.user}</td>
                                <td>
                                    <span className={`badge ${activity.action.toLowerCase().replace(" ", "-")}`}>
                                        {activity.action}
                                    </span>
                                </td>
                                <td className="time-cell">{new Date(activity.timestamp).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )

    return (
        <div className="admin-dashboard">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="admin-logo">Vedastro Admin</div>
                </div>
                <nav className="sidebar-nav">
                    <button 
                        className={`nav-item ${currentView === "overview" ? "active" : ""}`}
                        onClick={() => setCurrentView("overview")}
                    >
                        <FaThLarge /> Overview
                    </button>
                    <div className="nav-group">
                        <span className="group-label">Analytics</span>
                        <button 
                            className={`nav-item ${currentView === "users" ? "active" : ""}`}
                            onClick={() => setCurrentView("users")}
                        >
                            <FaUsers /> Users
                        </button>
                        <button 
                            className={`nav-item ${currentView === "signed-up" ? "active" : ""}`}
                            onClick={() => setCurrentView("signed-up")}
                        >
                            <FaUserPlus /> Signed-up Users
                        </button>
                        <button 
                            className={`nav-item ${currentView === "active" ? "active" : ""}`}
                            onClick={() => setCurrentView("active")}
                        >
                            <FaUserCheck /> Active Users
                        </button>
                    </div>
                    <div className="nav-group">
                        <span className="group-label">Monitoring</span>
                        <button 
                            className={`nav-item ${currentView === "activity-log" ? "active" : ""}`}
                            onClick={() => setCurrentView("activity-log")}
                        >
                            <FaHistory /> Activity Log
                        </button>
                    </div>
                    <div className="nav-group">
                        <span className="group-label">External</span>
                        <button 
                            className="nav-item"
                            onClick={() => navigate("/")}
                        >
                            <FaServer /> View Site
                        </button>
                    </div>
                </nav>
                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">{user?.name?.charAt(0)}</div>
                        <div className="user-details">
                            <span className="user-name">{user?.name}</span>
                            <span className="user-role">Administrator</span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <div className="main-content">
                    {renderContent()}
                </div>
            </main>

            <style dangerouslySetInnerHTML={{ __html: `
                .admin-dashboard {
                    background: #0a0a1a;
                    color: white;
                    min-height: 100vh;
                    display: flex;
                    font-family: 'Inter', sans-serif;
                }

                /* Sidebar Styles */
                .admin-sidebar {
                    width: 280px;
                    background: rgba(255, 255, 255, 0.02);
                    border-right: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    flex-direction: column;
                    position: sticky;
                    top: 0;
                    height: 100vh;
                }
                .sidebar-header {
                    padding: 2rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                .admin-logo {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #00f5ff;
                    text-shadow: 0 0 10px rgba(0, 245, 255, 0.3);
                }
                .sidebar-nav {
                    flex: 1;
                    padding: 1.5rem 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .nav-group {
                    margin-top: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }
                .group-label {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.4);
                    padding-left: 1rem;
                    margin-bottom: 0.5rem;
                    letter-spacing: 1px;
                }
                .nav-item {
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.7);
                    padding: 0.85rem 1rem;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                    font-size: 0.95rem;
                }
                .nav-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                }
                .nav-item.active {
                    background: rgba(0, 245, 255, 0.1);
                    color: #00f5ff;
                    font-weight: 600;
                }
                .sidebar-footer {
                    padding: 1.5rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .user-avatar {
                    width: 36px;
                    height: 36px;
                    background: #00f5ff;
                    color: black;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                }
                .user-details {
                    display: flex;
                    flex-direction: column;
                }
                .user-name {
                    font-size: 0.9rem;
                    font-weight: 600;
                }
                .user-role {
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.5);
                }

                /* Main Content Styles */
                .admin-main {
                    flex: 1;
                    overflow-y: auto;
                    padding: 2rem 3rem;
                }
                .main-content {
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .dashboard-header h1 {
                    font-size: 2.5rem;
                    margin-bottom: 0.5rem;
                    letter-spacing: -0.5px;
                }
                .dashboard-header p {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 1.1rem;
                }

                /* Grid & Cards */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                    gap: 1.5rem;
                    margin: 2.5rem 0 3.5rem 0;
                }
                .stat-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    padding: 1.75rem;
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    transition: transform 0.2s, border-color 0.2s;
                }
                .stat-card.clickable:hover {
                    transform: translateY(-4px);
                    border-color: rgba(0, 245, 255, 0.3);
                }
                .stat-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.6rem;
                }
                .stat-icon.users { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
                .stat-icon.signed-up { background: rgba(16, 185, 129, 0.15); color: #10b981; }
                .stat-icon.online { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
                .stat-icon.system { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
                
                .stat-info h3 {
                    font-size: 0.85rem;
                    color: rgba(255, 255, 255, 0.5);
                    margin: 0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .stat-value {
                    font-size: 2rem;
                    font-weight: 700;
                    margin: 0.25rem 0 0 0;
                }
                .text-success { color: #10b981; }

                /* Large Stat View */
                .large-stat-card {
                    margin-top: 3rem;
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.02));
                    border: 1px solid rgba(59, 130, 246, 0.2);
                    border-radius: 24px;
                    padding: 5rem 3rem;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }
                .large-stat-card.green {
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02));
                    border-color: rgba(16, 185, 129, 0.2);
                }
                .large-stat-card.orange {
                    background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.02));
                    border-color: rgba(245, 158, 11, 0.2);
                }
                .bg-icon {
                    position: absolute;
                    font-size: 20rem;
                    opacity: 0.03;
                    right: -2rem;
                    bottom: -4rem;
                }
                .stat-content h2 {
                    font-size: 8rem;
                    margin: 0;
                    line-height: 1;
                    color: white;
                    font-weight: 800;
                }
                .stat-content span {
                    font-size: 1.5rem;
                    color: rgba(255, 255, 255, 0.6);
                    font-weight: 500;
                }

                /* Activity Section */
                .activity-section {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 20px;
                    padding: 2rem;
                }
                .activity-section.full-width {
                    margin-top: 2rem;
                }
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .section-header h2 {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-size: 1.25rem;
                }
                .refresh-btn {
                    background: #00f5ff;
                    color: black;
                    border: none;
                    padding: 0.6rem 1.2rem;
                    border-radius: 8px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .refresh-btn:hover {
                    transform: scale(1.05);
                    box-shadow: 0 0 15px rgba(0, 245, 255, 0.4);
                }
                .activity-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .activity-table th {
                    text-align: left;
                    padding: 1.25rem 1rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .activity-table td {
                    padding: 1.25rem 1rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    font-size: 0.95rem;
                }
                .email-cell { font-weight: 600; color: rgba(255, 255, 255, 0.9); }
                .time-cell { color: rgba(255, 255, 255, 0.5); font-size: 0.85rem; }
                .badge {
                    padding: 0.35rem 0.75rem;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .badge.signed-up { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
                .badge.logged-in { background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); }
                
                .logout-btn {
                    background: rgba(248, 113, 113, 0.1);
                    color: #f87171;
                    border: 1px solid rgba(248, 113, 113, 0.3);
                    padding: 0.75rem;
                    border-radius: 10px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    transition: all 0.2s;
                    font-weight: 600;
                    width: 100%;
                }
                .logout-btn:hover {
                    background: #f87171;
                    color: white;
                }

                /* Utils */
                .loading-container {
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #0a0a1a;
                    color: #00f5ff;
                    font-size: 1.5rem;
                }
                .no-data { text-align: center; color: rgba(255, 255, 255, 0.3); padding: 4rem; font-style: italic; }
                .error-banner {
                    background: rgba(248, 113, 113, 0.1);
                    color: #f87171;
                    padding: 1.25rem;
                    border-radius: 12px;
                    margin-bottom: 2rem;
                    text-align: center;
                    border: 1px solid rgba(248, 113, 113, 0.2);
                }
            `}} />
        </div>
    )
}

export default AdminDashboard
