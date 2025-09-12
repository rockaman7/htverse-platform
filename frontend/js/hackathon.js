const API_BASE = 'https://htverse-platform.onrender.com/api';

// Load and display hackathons
async function loadHackathons() {
    try {
        const response = await fetch(`${API_BASE}/hackathons`);
        
        if (response.ok) {
            const hackathons = await response.json();
            displayHackathons(hackathons);
        } else {
            console.error('Failed to load hackathons');
        }
    } catch (error) {
        console.error('Hackathons error:', error);
    }
}

function displayHackathons(hackathons) {
    const container = document.getElementById('hackathons-container');
    if (container) {
        container.innerHTML = hackathons.map(hackathon => `
            <div class="hackathon-card">
                <h3>${hackathon.title}</h3>
                <p>${hackathon.description}</p>
                <div class="hackathon-details">
                    <span>Prize: ${UIHelpers.formatCurrency(hackathon.prize)}</span>
                    <span>Deadline: ${new Date(hackathon.deadline).toLocaleDateString()}</span>
                </div>
                <button onclick="joinHackathon('${hackathon._id}')">Join</button>
            </div>
        `).join('');
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
        const response = await fetch(`${API_BASE}/hackathons/${hackathonId}/join`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert('Successfully joined hackathon!');
            loadHackathons(); // Reload to show updated status
        } else {
            const error = await response.json();
            alert(error.message || 'Failed to join hackathon');
        }
    } catch (error) {
        console.error('Join hackathon error:', error);
        alert('Error joining hackathon');
    }
}

// Load hackathons when page loads
document.addEventListener('DOMContentLoaded', loadHackathons);
