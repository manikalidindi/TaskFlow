const API_URL = "http://127.0.0.1:8000";

// --- 1. Initialization (Safe Start) ---
document.addEventListener('DOMContentLoaded', () => {
    // We check if the 'task-list' element exists. 
    // It exists on dashboard.html, but NOT on index.html.
    const isDashboard = document.getElementById("task-list");

    if (isDashboard) {
        // We are on the Dashboard, so it is safe to load tasks
        setCurrentDate();
        loadTasks();
    } else {
        // We are on the Login Page. Do nothing. Wait for user to log in.
    }
});

function setCurrentDate() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.innerText = new Date().toLocaleDateString('en-US', { 
            weekday: 'long', month: 'short', day: 'numeric' 
        });
    }
}

// --- 2. Filter Logic (Sidebar) ---
let currentFilter = 'all';

function setFilter(filterType) {
    currentFilter = filterType;
    document.querySelectorAll('.menu a').forEach(el => el.classList.remove('active'));
    document.getElementById(`nav-${filterType}`).classList.add('active');
    
    // Update Header Text
    const titles = {
        'all': 'All Tasks', 'today': "Today's Tasks", 
        'upcoming': 'Upcoming Tasks', 'important': 'Important', 
        'completed': 'Completed Tasks'
    };
    const titleEl = document.getElementById('header-title');
    if(titleEl) titleEl.innerText = titles[filterType];

    loadTasks();
}

// --- 3. Load Tasks ---
async function loadTasks() {
    const token = localStorage.getItem("token");

    // SAFETY CHECK: If no token, return immediately. 
    // Do NOT redirect if we are already on the login page.
    if (!token) {
        if (!window.location.pathname.includes("index.html")) {
            window.location.href = "index.html";
        }
        return;
    }

    // Set Username in Sidebar
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userDisplay = document.getElementById('user-name-display');
        if (userDisplay) userDisplay.innerText = payload.sub;
    } catch(e) { logout(); }

    const res = await fetch(`${API_URL}/tasks`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (res.ok) {
        const allTasks = await res.json();
        
        // --- Calculate Counts for Badges ---
        const pendingTasks = allTasks.filter(t => !t.completed);
        const todayStr = new Date().toISOString().split('T')[0];
        
        const counts = {
            all: pendingTasks.length,
            today: pendingTasks.filter(t => t.due_date === todayStr).length,
            upcoming: pendingTasks.filter(t => t.due_date > todayStr).length,
            important: pendingTasks.filter(t => t.priority === 'High' || t.priority === 'Urgent').length
        };

        // Update UI Badges safely
        if(document.getElementById("count-all")) document.getElementById("count-all").innerText = counts.all || "";
        if(document.getElementById("count-today")) document.getElementById("count-today").innerText = counts.today || "";
        if(document.getElementById("count-upcoming")) document.getElementById("count-upcoming").innerText = counts.upcoming || "";
        if(document.getElementById("count-important")) document.getElementById("count-important").innerText = counts.important || "";

        // --- Filter Tasks ---
        const filteredTasks = allTasks.filter(task => {
            // Completed Tab: Show ONLY completed
            if (currentFilter === 'completed') return task.completed;
            
            // Other Tabs: Show ONLY incomplete (Hide completed)
            if (task.completed) return false;

            if (currentFilter === 'today') return task.due_date === todayStr;
            if (currentFilter === 'upcoming') return task.due_date > todayStr;
            if (currentFilter === 'important') return task.priority === 'High' || task.priority === 'Urgent';
            return true;
        });

        renderTaskList(filteredTasks);
    } else if (res.status === 401) {
        // Token expired
        logout();
    }
}

// --- 4. Render List ---
function renderTaskList(tasks) {
    const list = document.getElementById("task-list");
    if (!list) return; // Stop if list doesn't exist
    list.innerHTML = "";

    if (tasks.length === 0) {
        list.innerHTML = `<div style="text-align:center; color:#ccc; margin-top:40px;">No tasks found</div>`;
        return;
    }

    tasks.forEach(task => {
        const li = document.createElement("div");
        li.className = "task-item";
        li.innerHTML = `
            <button class="check-btn ${task.completed ? 'completed' : ''}" onclick="toggleTask(${task.id}, ${!task.completed})"></button>
            <div class="task-details">
                <span class="task-title ${task.completed ? 'completed-text' : ''}">${task.title}</span>
                ${task.description ? `<span class="task-desc">${task.description}</span>` : ''}
                <div class="task-meta">
                    <span class="priority-tag p-${task.priority}">${task.priority}</span>
                    <span class="date-tag"><i class="fa-regular fa-calendar"></i> ${task.due_date || ''}</span>
                </div>
            </div>
            <button class="delete-btn" onclick="deleteTask(${task.id})"><i class="fa-solid fa-trash"></i></button>
        `;
        list.appendChild(li);
    });
}

// --- 5. Button Actions ---

// --- LOGIN / SIGNUP LOGIC ---
const authForm = document.getElementById("auth-form");
if (authForm) {
    let isLoginMode = true;
    
    window.toggleMode = function() {
        isLoginMode = !isLoginMode;
        document.getElementById("form-title").innerText = isLoginMode ? "Login" : "Sign Up";
        const emailInput = document.getElementById("email");
        if(emailInput) emailInput.style.display = isLoginMode ? "none" : "block";
        document.getElementById("submit-btn").innerText = isLoginMode ? "Login" : "Sign Up";
        document.querySelector(".toggle").innerText = isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Login";
    };

    authForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const email = document.getElementById("email") ? document.getElementById("email").value : "";
        const errorBox = document.getElementById("error-message");

        try {
            if (isLoginMode) {
                const formData = new URLSearchParams();
                formData.append("username", username);
                formData.append("password", password);

                const res = await fetch(`${API_URL}/login`, {
                    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: formData
                });
                const data = await res.json();
                
                if (res.ok) {
                    localStorage.setItem("token", data.access_token);
                    window.location.href = "dashboard.html";
                } else {
                    if(errorBox) {
                        errorBox.innerText = data.detail || "Login failed";
                        errorBox.style.display = "block";
                    }
                }
            } else {
                const res = await fetch(`${API_URL}/register`, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, email, password })
                });
                const data = await res.json();
                if (res.ok) {
                    alert("Account created! Please login.");
                    toggleMode();
                } else {
                    if(errorBox) {
                        errorBox.innerText = data.detail || "Registration failed";
                        errorBox.style.display = "block";
                    }
                }
            }
        } catch (err) {
            if(errorBox) {
                errorBox.innerText = "Server error. Is backend running?";
                errorBox.style.display = "block";
            }
        }
    });
}

// --- DASHBOARD ACTIONS ---
async function addTask() {
    const title = document.getElementById("task-title").value;
    const desc = document.getElementById("task-desc").value;
    const priority = document.getElementById("task-priority").value;
    const date = document.getElementById("task-date").value || new Date().toISOString().split('T')[0];
    const token = localStorage.getItem("token");

    if(!title) return alert("Title required");

    await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ title, description: desc, priority, due_date: date })
    });
    
    document.getElementById("task-title").value = "";
    document.getElementById("task-desc").value = "";
    
    if(currentFilter === 'completed') setFilter('all');
    else loadTasks();
}

async function toggleTask(id, status) {
    const token = localStorage.getItem("token");
    await fetch(`${API_URL}/tasks/${id}?completed=${status}`, {
        method: "PUT", headers: { "Authorization": `Bearer ${token}` }
    });
    loadTasks();
}

async function deleteTask(id) {
    if(!confirm("Delete task?")) return;
    const token = localStorage.getItem("token");
    await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
    });
    loadTasks();
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}