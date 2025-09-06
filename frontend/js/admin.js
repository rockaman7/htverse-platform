const API_BASE = 'https://htverse-platform.onrender.com/api';

class AdminManager {
    constructor() {
        this.token = TokenManager.getToken();
        if (!this.token) {
            this.redirectToLogin();
        }
    }

    redirectToLogin() {
        alert('Admin access required. Please login.');
        window.location.href = 'login.html';
    }

    // Check if current user is admin
    async checkAdminRole() {
        try {
            const user = TokenManager.getUserFromToken();
            if (!user || user.role !== 'admin') {
                alert('Access denied. Admin privileges required.');
                window.location.href = 'dashboard.html';
                return false;
            }
            return true;
        } catch (error) {
            console.error('Admin check error:', error);
            return false;
        }
    }

    // Load admin dashboard data
    async loadAdminDashboard() {
        if (!await this.checkAdminRole()) return;

        try {
            const response = await fetch(`${API_BASE}/admin/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.displayDashboardStats(data);
            } else {
                console.error('Failed to load admin dashboard');
            }
        } catch (error) {
            console.error('Admin dashboard error:', error);
        }
    }

    // Display admin dashboard statistics
    displayDashboardStats(data) {
        const statsContainer = document.getElementById('admin-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stat-card">
                    <h3>Total Users</h3>
                    <p class="stat-number">${data.totalUsers || 0}</p>
                </div>
                <div class="stat-card">
                    <h3>Active Hackathons</h3>
                    <p class="stat-number">${data.activeHackathons || 0}</p>
                </div>
                <div class="stat-card">
                    <h3>Total Submissions</h3>
                    <p class="stat-number">${data.totalSubmissions || 0}</p>
                </div>
                <div class="stat-card">
                    <h3>Pending Reviews</h3>
                    <p class="stat-number">${data.pendingReviews || 0}</p>
                </div>
            `;
        }
    }

    // Load all users for management
    async loadUsers() {
        if (!await this.checkAdminRole()) return;

        try {
            const response = await fetch(`${API_BASE}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const users = await response.json();
                this.displayUsers(users);
            }
        } catch (error) {
            console.error('Load users error:', error);
        }
    }

    // Display users in admin panel
    displayUsers(users) {
        const usersContainer = document.getElementById('admin-users');
        if (usersContainer) {
            usersContainer.innerHTML = `
                <div class="users-header">
                    <h3>User Management</h3>
                    <button onclick="adminManager.refreshUsers()" class="btn-secondary">Refresh</button>
                </div>
                <div class="users-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map(user => `
                                <tr>
                                    <td>${user.username}</td>
                                    <td>${user.email}</td>
                                    <td>${user.role}</td>
                                    <td>${user.status}</td>
                                    <td>
                                        <button onclick="adminManager.editUser('${user._id}')" class="btn-sm">Edit</button>
                                        <button onclick="adminManager.toggleUserStatus('${user._id}')" class="btn-sm">Toggle Status</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
    }

    // Load hackathons for admin management
    async loadHackathonsAdmin() {
        if (!await this.checkAdminRole()) return;

        try {
            const response = await fetch(`${API_BASE}/admin/hackathons`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const hackathons = await response.json();
                this.displayHackathonsAdmin(hackathons);
            }
        } catch (error) {
            console.error('Load hackathons error:', error);
        }
    }

    // Display hackathons in admin panel
    displayHackathonsAdmin(hackathons) {
        const hackathonsContainer = document.getElementById('admin-hackathons');
        if (hackathonsContainer) {
            hackathonsContainer.innerHTML = `
                <div class="hackathons-header">
                    <h3>Hackathon Management</h3>
                    <button onclick="adminManager.showCreateHackathon()" class="btn-primary">Create New</button>
                </div>
                <div class="hackathons-grid">
                    ${hackathons.map(hackathon => `
                        <div class="hackathon-admin-card">
                            <h4>${hackathon.title}</h4>
                            <p>Status: ${hackathon.status}</p>
                            <p>Participants: ${hackathon.participants?.length || 0}</p>
                            <p>Deadline: ${new Date(hackathon.deadline).toLocaleDateString()}</p>
                            <div class="admin-actions">
                                <button onclick="adminManager.editHackathon('${hackathon._id}')" class="btn-sm">Edit</button>
                                <button onclick="adminManager.viewSubmissions('${hackathon._id}')" class="btn-sm">Submissions</button>
                                <button onclick="adminManager.deleteHackathon('${hackathon._id}')" class="btn-sm btn-danger">Delete</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    // Create new hackathon
    async createHackathon(hackathonData) {
        try {
            const response = await fetch(`${API_BASE}/admin/hackathons`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(hackathonData)
            });

            if (response.ok) {
                alert('Hackathon created successfully!');
                this.loadHackathonsAdmin();
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to create hackathon');
            }
        } catch (error) {
            console.error('Create hackathon error:', error);
            alert('Error creating hackathon');
        }
    }

    // Edit user
    async editUser(userId) {
        // Implementation for editing user
        const newRole = prompt('Enter new role (user/admin):');
        if (newRole) {
            try {
                const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ role: newRole })
                });

                if (response.ok) {
                    alert('User updated successfully!');
                    this.loadUsers();
                }
            } catch (error) {
                console.error('Edit user error:', error);
            }
        }
    }

    // Toggle user status
    async toggleUserStatus(userId) {
        try {
            const response = await fetch(`${API_BASE}/admin/users/${userId}/toggle-status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                alert('User status updated!');
                this.loadUsers();
            }
        } catch (error) {
            console.error('Toggle status error:', error);
        }
    }

    // Show create hackathon form
    showCreateHackathon() {
        const modalHtml = `
            <div class="modal" id="createHackathonModal">
                <div class="modal-content">
                    <h3>Create New Hackathon</h3>
                    <form onsubmit="adminManager.handleCreateHackathon(event)">
                        <input type="text" name="title" placeholder="Hackathon Title" required>
                        <textarea name="description" placeholder="Description" required></textarea>
                        <input type="text" name="prize" placeholder="Prize Amount" required>
                        <input type="datetime-local" name="deadline" required>
                        <div class="modal-actions">
                            <button type="submit" class="btn-primary">Create</button>
                            <button type="button" onclick="adminManager.closeModal()" class="btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    // Handle hackathon creation form
    handleCreateHackathon(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const hackathonData = {
            title: formData.get('title'),
            description: formData.get('description'),
            prize: formData.get('prize'),
            deadline: formData.get('deadline')
        };
        this.createHackathon(hackathonData);
        this.closeModal();
    }

    // Close modal
    closeModal() {
        const modal = document.getElementById('createHackathonModal');
        if (modal) {
            modal.remove();
        }
    }

    // Refresh functions
    refreshUsers() {
        this.loadUsers();
    }
}

// Initialize admin manager
const adminManager = new AdminManager();

// Load appropriate admin section based on page
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('admin.html')) {
        adminManager.loadAdminDashboard();
    } else if (currentPage.includes('admin-users.html')) {
        adminManager.loadUsers();
    } else if (currentPage.includes('admin-hackathons.html')) {
        adminManager.loadHackathonsAdmin();
    }
});
