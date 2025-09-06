const API_BASE = 'https://htverse-platform.onrender.com/api';

// Load user dashboard data
async function loadDashboard() {
    try {
        const token = TokenManager.getToken();
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        const response = await fetch(`${API_BASE}/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            displayDashboardData(data);
        } else {
            console.error('Failed to load dashboard');
        }
    } catch (error) {
        console.error('Dashboard error:', error);
    }
}

function displayDashboardData(data) {
    // Update DOM with dashboard data
    const dashboardContainer = document.getElementById('dashboard-content');
    if (dashboardContainer) {
        dashboardContainer.innerHTML = `
            <h2>Welcome, ${data.username}!</h2>
            <p>Your hackathons: ${data.hackathons?.length || 0}</p>
        `;
    }
}

// Load dashboard when page loads
document.addEventListener('DOMContentLoaded', loadDashboard);
