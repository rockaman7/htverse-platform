// API Base URL - use the same as auth.js
const API_BASE = 'https://htverse-platform.onrender.com/api';

// Load and display hackathons
async function loadHackathons() {
    try {
        const response = await fetch(`${API_BASE}/hackathons`);
        
        if (response.ok) {
            const result = await response.json();
            // Handle API response structure: {success: true, data: [...]}
            const hackathons = result.data || result;
            displayHackathons(Array.isArray(hackathons) ? hackathons : []);
        } else {
            console.error('Failed to load hackathons');
            const container = document.getElementById('hackathons-container');
            if (container) {
                container.innerHTML = '<p style="text-align: center; color: #e74c3c; padding: 2rem;">Failed to load hackathons. Please try again later.</p>';
            }
        }
    } catch (error) {
        console.error('Hackathons error:', error);
    }
}

function displayHackathons(hackathons) {
    const container = document.getElementById('hackathons-container');
    if (container) {
        if (!hackathons || hackathons.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No hackathons available at the moment.</p>';
            return;
        }
        
        container.innerHTML = hackathons.map(hackathon => {
            const hackathonId = hackathon._id || hackathon.id;
            const prize = hackathon.prizePool || hackathon.prize || 0;
            const deadline = hackathon.registrationDeadline || hackathon.deadline;
            
            // Calculate status based on dates if not provided
            let status = hackathon.status || 'upcoming';
            const now = new Date();
            const endDate = hackathon.endDate ? new Date(hackathon.endDate) : null;
            const startDate = hackathon.startDate ? new Date(hackathon.startDate) : null;
            
            if (status !== 'cancelled' && endDate && startDate) {
                if (endDate < now) {
                    status = 'completed';
                } else if (startDate <= now && endDate >= now) {
                    status = 'ongoing';
                } else {
                    status = 'upcoming';
                }
            }
            
            const statusColors = {
                upcoming: '#667eea',
                ongoing: '#27ae60',
                completed: '#95a5a6',
                cancelled: '#e74c3c',
                expired: '#95a5a6' // Treat expired as completed
            };
            
            return `
                <div class="hackathon-card" style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.2s;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <h3 style="margin: 0; color: #333; font-size: 1.5rem;">${hackathon.title || 'Untitled Hackathon'}</h3>
                        <span style="background: ${statusColors[status] || '#667eea'}; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem; text-transform: capitalize;">${status}</span>
                    </div>
                    <p style="color: #666; margin-bottom: 1rem; line-height: 1.6;">${(hackathon.description || '').substring(0, 150)}${hackathon.description && hackathon.description.length > 150 ? '...' : ''}</p>
                    <div class="hackathon-details" style="display: flex; gap: 1.5rem; margin-bottom: 1rem; flex-wrap: wrap; font-size: 0.9rem;">
                        <span style="color: #667eea; font-weight: 600;">💰 Prize: ₹${prize.toLocaleString('en-IN')}</span>
                        <span style="color: #666;">📅 Deadline: ${deadline ? new Date(deadline).toLocaleDateString('en-IN') : 'N/A'}</span>
                    </div>
                    <button onclick="joinHackathon('${hackathonId}')" style="width: 100%; padding: 0.75rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">Join Hackathon</button>
                </div>
            `;
        }).join('');
    }
}

async function joinHackathon(hackathonId) {
    const token = TokenManager.getToken();
    if (!token) {
        alert('Please login to join hackathons');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/hackathons/${hackathonId}/register`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        
        if (response.ok) {
            // Show success message
            if (typeof UIHelpers !== 'undefined' && UIHelpers.showAlert) {
                UIHelpers.showAlert('Successfully joined hackathon!', 'success');
            } else {
                alert('Successfully joined hackathon!');
            }
            loadHackathons(); // Reload to show updated status
        } else {
            // Show error message
            const errorMsg = result.message || 'Failed to join hackathon';
            if (typeof UIHelpers !== 'undefined' && UIHelpers.showAlert) {
                UIHelpers.showAlert(errorMsg, 'error');
            } else {
                alert(errorMsg);
            }
        }
    } catch (error) {
        console.error('Join hackathon error:', error);
        const errorMsg = 'Network error. Please check your connection and try again.';
        if (typeof UIHelpers !== 'undefined' && UIHelpers.showAlert) {
            UIHelpers.showAlert(errorMsg, 'error');
        } else {
            alert(errorMsg);
        }
    }
}

// Load hackathons when page loads
document.addEventListener('DOMContentLoaded', loadHackathons);
