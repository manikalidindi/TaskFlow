# 🚀 TaskFlow

TaskFlow is a modern, full-stack task management dashboard designed to help users organize their day efficiently. It features a clean UI, secure authentication, and smart filtering to keep you focused on what matters.

##  Features

-  **Secure Authentication:** User Login & Signup functionality using JWT (JSON Web Tokens).
-  **Task Management:** Create, Read, Update, and Delete (CRUD) tasks effortlessly.
-  **Smart Views:** Automatically categorizes tasks into **Today**, **Upcoming**, **Important**, and **Completed** tabs.
-  **Priorities & Deadlines:** Set Due Dates and Priority levels (Low, Medium, High) for every task.
-  **Modern UI:** A clean, responsive interface built with vanilla CSS and JavaScript.
-  **Persistent Data:** All data is securely stored in a PostgreSQL database.

##  Tech Stack

- **Backend:** Python, FastAPI, SQLAlchemy
- **Database:** PostgreSQL
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Tools:** Uvicorn, Pydantic, Git

##  How to Run

1. **Clone the repository**
2. **Backend Setup:**
   - Navigate to `backend/`
   - Install dependencies: `pip install -r requirements.txt` (if created) or install `fastapi uvicorn sqlalchemy psycopg2-binary passlib python-jose python-multipart python-dotenv`
   - Setup `.env` file with `DATABASE_URL` and `SECRET_KEY`.
   - Run server: `uvicorn main:app --reload`
3. **Frontend:**
   - Open `frontend/index.html` in your browser (or use Live Server).