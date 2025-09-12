// API Base URL
// const API_BASE = 'http://localhost:5000/api';
const API_BASE = "https://htverse-platform.onrender.com/api";

// Token management
class TokenManager {
  static setToken(token) {
    localStorage.setItem("hackathon_token", token);
  }

  static getToken() {
    return localStorage.getItem("hackathon_token");
  }

  static removeToken() {
    localStorage.removeItem("hackathon_token");
  }

  static isLoggedIn() {
    const token = this.getToken();
    if (!token) return false;

    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  }

  static getUserFromToken() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return { userId: payload.userId };
    } catch (error) {
      return null;
    }
  }
}

// API Client
class APIClient {
  static async makeRequest(endpoint, options = {}) {
    const token = TokenManager.getToken();

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Auth endpoints
  static async register(userData) {
    return this.makeRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  static async login(credentials) {
    return this.makeRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  static async getProfile() {
    return this.makeRequest("/auth/me");
  }

  // Hackathon endpoints
  static async getHackathons(params = "") {
    return this.makeRequest(`/hackathons${params}`);
  }

  static async getHackathon(id) {
    return this.makeRequest(`/hackathons/${id}`);
  }

  static async createHackathon(hackathonData) {
    return this.makeRequest("/hackathons", {
      method: "POST",
      body: JSON.stringify(hackathonData),
    });
  }

  static async registerForHackathon(hackathonId) {
    return this.makeRequest(`/hackathons/${hackathonId}/register`, {
      method: "POST",
    });
  }

  static async unregisterFromHackathon(hackathonId) {
    return this.makeRequest(`/hackathons/${hackathonId}/register`, {
      method: "DELETE",
    });
  }
}

// UI Helper functions
class UIHelpers {
  static showAlert(message, type = "info") {
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    // Insert at top of body or specific container
    const container =
      document.querySelector(".form-container") || document.body;
    container.insertBefore(alertDiv, container.firstChild);

    // Remove after 5 seconds
    setTimeout(() => {
      alertDiv.remove();
    }, 5000);
  }

  static showLoading(show = true) {
    let loader = document.querySelector(".loading-spinner");

    if (show && !loader) {
      loader = document.createElement("div");
      loader.className = "loading";
      loader.innerHTML = '<div class="loading-spinner"></div><p>Loading...</p>';
      document.body.appendChild(loader);
    } else if (!show && loader) {
      loader.remove();
    }
  }

  static formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  static async updateNavigation() {
    const navLinks = document.querySelector(".nav-links");
    if (!navLinks) return;

    if (TokenManager.isLoggedIn()) {
      try {
        const profile = await APIClient.getProfile(); // Async fetch user profile
        if (profile.success) {
          const isAdmin = profile.user.role === "admin";
          navLinks.innerHTML = `
          <a href="hackathons.html">Browse Hackathons</a>
          <a href="dashboard.html">Dashboard</a>
          ${isAdmin ? `<a href="admin.html">Admin Panel</a>` : ""}
          <a href="#" onclick="logout()" class="btn-secondary">Logout</a>
        `;
        } else {
          // Fallback if no profile
          navLinks.innerHTML = `
          <a href="hackathons.html">Browse Hackathons</a>
          <a href="dashboard.html">Dashboard</a>
          <a href="#" onclick="logout()" class="btn-secondary">Logout</a>
        `;
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        navLinks.innerHTML = `
        <a href="hackathons.html">Browse Hackathons</a>
        <a href="dashboard.html">Dashboard</a>
        <a href="#" onclick="logout()" class="btn-secondary">Logout</a>
      `;
      }
    } else {
      // For guests
      navLinks.innerHTML = `
      <a href="#features">Features</a>
      <a href="hackathons.html">Browse Hackathons</a>
      <a href="login.html" class="btn-secondary">Login</a>
      <a href="register.html" class="btn-primary">Sign Up</a>
    `;
    }
  }
}

// Global logout function
function logout() {
  TokenManager.removeToken();
  UIHelpers.showAlert("Logged out successfully", "success");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1000);
}

// Initialize navigation on page load
document.addEventListener("DOMContentLoaded",async () => {
  await UIHelpers.updateNavigation();
});

// Redirect if not logged in (for protected pages)
function requireAuth() {
  if (!TokenManager.isLoggedIn()) {
    UIHelpers.showAlert("Please log in to access this page", "error");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
    return false;
  }
  return true;
}

// Redirect if already logged in (for login/register pages)
function redirectIfLoggedIn() {
  if (TokenManager.isLoggedIn()) {
    window.location.href = "dashboard.html";
  }
}
