const API_BASE = 'https://htverse-platform.onrender.com/api';

// Load user dashboard data
async function loadDashboard() {
    try {
        const token = TokenManager.getToken();
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        // Get user profile
        const userResponse = await fetch(`${API_BASE}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // Get all hackathons to find user's registered ones
        const hackathonsResponse = await fetch(`${API_BASE}/hackathons`);

        if (userResponse.ok && hackathonsResponse.ok) {
            const userData = await userResponse.json();
            const hackathonsData = await hackathonsResponse.json();
            
            const user = userData.user || userData;
            const allHackathons = hackathonsData.data || hackathonsData;
            const registeredHackathons = Array.isArray(allHackathons) 
                ? allHackathons.filter(h => {
                    const participants = h.participants || [];
                    return participants.some(p => (p._id || p.id) === (user.id || user._id));
                })
                : [];

            displayDashboardData({
                user: user,
                registeredHackathons: registeredHackathons
            });
        } else {
            console.error('Failed to load dashboard data');
            displayError();
        }
    } catch (error) {
        console.error('Dashboard error:', error);
        displayError();
    }
}

function displayDashboardData(data) {
    // Update DOM with dashboard data
    const dashboardContainer = document.getElementById('dashboard-content');
    if (dashboardContainer) {
        const user = data.user || {};
        const hackathons = data.registeredHackathons || [];
        
        const stats = {
            total: hackathons.length,
            upcoming: hackathons.filter(h => (h.status || 'upcoming') === 'upcoming').length,
            ongoing: hackathons.filter(h => (h.status || 'upcoming') === 'ongoing').length,
            completed: hackathons.filter(h => (h.status || 'upcoming') === 'completed').length
        };

        dashboardContainer.innerHTML = `
            <div style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
                    <h2 style="margin: 0 0 0.5rem 0; font-size: 2rem;">Welcome back, ${user.name || 'User'}! 👋</h2>
                    <p style="margin: 0; opacity: 0.9;">${user.email || ''}</p>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                    <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center;">
                        <div style="font-size: 2.5rem; font-weight: bold; color: #667eea; margin-bottom: 0.5rem;">${stats.total}</div>
                        <div style="color: #666; font-weight: 600;">Total Registered</div>
                    </div>
                    <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center;">
                        <div style="font-size: 2.5rem; font-weight: bold; color: #667eea; margin-bottom: 0.5rem;">${stats.upcoming}</div>
                        <div style="color: #666; font-weight: 600;">Upcoming</div>
                    </div>
                    <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center;">
                        <div style="font-size: 2.5rem; font-weight: bold; color: #27ae60; margin-bottom: 0.5rem;">${stats.ongoing}</div>
                        <div style="color: #666; font-weight: 600;">Ongoing</div>
                    </div>
                    <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center;">
                        <div style="font-size: 2.5rem; font-weight: bold; color: #95a5a6; margin-bottom: 0.5rem;">${stats.completed}</div>
                        <div style="color: #666; font-weight: 600;">Completed</div>
                    </div>
                </div>

                ${hackathons.length > 0 ? `
                    <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <h3 style="margin: 0 0 1.5rem 0; color: #333;">Your Registered Hackathons</h3>
                        <div style="display: grid; gap: 1rem;">
                            ${hackathons.map(h => {
                                const status = h.status || 'upcoming';
                                const statusColors = {
                                    upcoming: '#667eea',
                                    ongoing: '#27ae60',
                                    completed: '#95a5a6',
                                    cancelled: '#e74c3c'
                                };
                                return `
                                    <div style="padding: 1.5rem; border: 1px solid #e0e0e0; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                                        <div style="flex: 1;">
                                            <h4 style="margin: 0 0 0.5rem 0; color: #333;">${h.title || 'Untitled'}</h4>
                                            <p style="margin: 0; color: #666; font-size: 0.9rem;">${(h.description || '').substring(0, 100)}...</p>
                                        </div>
                                        <div style="text-align: right; margin-left: 1rem;">
                                            <span style="background: ${statusColors[status] || '#667eea'}; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem; text-transform: capitalize; display: inline-block; margin-bottom: 0.5rem;">${status}</span>
                                            <div style="color: #667eea; font-weight: 600;">₹${(h.prizePool || 0).toLocaleString('en-IN')}</div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : `
                    <div style="background: white; padding: 3rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center;">
                        <p style="color: #666; margin: 0;">You haven't registered for any hackathons yet.</p>
                        <a href="hackathons.html" style="display: inline-block; margin-top: 1rem; padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Browse Hackathons</a>
                    </div>
                `}
            </div>
        `;
    }
}

function displayError() {
    const dashboardContainer = document.getElementById('dashboard-content');
    if (dashboardContainer) {
        dashboardContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #666;">
                <p>Failed to load dashboard data. Please try refreshing the page.</p>
            </div>
        `;
    }
}

// Load dashboard when page loads
document.addEventListener('DOMContentLoaded', loadDashboard);
