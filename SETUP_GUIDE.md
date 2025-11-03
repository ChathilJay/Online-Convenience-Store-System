## 🚀 Initial Setup (First Time)

Follow these steps carefully when setting up the project for the first time.

### Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** ([Download](https://www.python.org/downloads/))
- **Node.js 16+** and npm ([Download](https://nodejs.org/))
- **PostgreSQL 15+** ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/downloads))
- **Docker & Docker Compose** (Optional, for containerized database. You can run postgres locally aswell) ([Download](https://www.docker.com/)) 

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd online-store-implementation
```

### Step 2: Environment Configuration

Create a `.env` file in the **root directory** of the project:

```bash
touch .env
```

Add the following environment variables to your `.env` file:

```env
# Database Configuration
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=online_store_db
DB_HOST=localhost
DB_PORT=5432
DATABASE_URL=postgresql://postgres:your_secure_password@localhost:5432/online_store_db

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-this-too

# Flask Configuration
FLASK_APP=main.py
FLASK_ENV=development
```

> **Important**: Replace `your_secure_password`, `your-super-secret-key-change-this-in-production`, and `your-jwt-secret-key-change-this-too` with actual secure values.

### Step 3: Database Setup

You have two options for setting up the database:

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker-compose up -d

# Verify the container is running
docker ps
```

#### Option B: Using Local PostgreSQL

1. Install PostgreSQL on your system
2. Create the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE online_store_db;

# Exit psql
\q
```

### Step 4: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations
flask db upgrade

# (Optional) Seed the database with test data
python seed.py
```

### Step 5: Frontend Setup

Open a **new terminal** window/tab:

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install
```

### Step 6: Start the Application

#### Terminal 1 - Backend:

```bash
cd backend
source venv/bin/activate  # Activate virtual environment if not already active
flask run
```

The backend API will be available at `http://localhost:5000`

#### Terminal 2 - Frontend:

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port shown in terminal)

### Step 7: Verify Installation

1. Open your browser and navigate to `http://localhost:5173`
2. You should see the Online Store homepage
3. Try registering a new user or logging in with seeded data (if you ran `seed.py`)

**Default test accounts** (if you ran seed.py):
- Admin: `admin@example.com` / `admin123`
- User: `user@example.com` / `user123`

---

## 🔄 Running After Updates (Subsequent Runs)

When you pull new changes from the repository or want to run the application after initial setup:

### Step 1: Pull Latest Changes

```bash
# Make sure you're in the project root
cd online-store-implementation

# Pull latest changes from repository
git pull origin main  # or your branch name
```

### Step 2: Update Backend Dependencies (if requirements.txt changed)

```bash
cd backend

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows

# Update dependencies
pip install -r requirements.txt

# Run new migrations (if any)
flask db upgrade
```

### Step 3: Update Frontend Dependencies (if package.json changed)

```bash
cd frontend

# Update dependencies
npm install
```

### Step 4: Database Migrations

**Important**: Always run migrations after pulling updates:

```bash
cd backend
source venv/bin/activate
flask db upgrade
```

### Step 5: Start the Application

Same as initial setup:

#### Terminal 1 - Backend:
```bash
cd backend
source venv/bin/activate
python main.py
```

#### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### Quick Start Script (After Initial Setup)

For convenience, you can create these scripts:

**start-backend.sh** (macOS/Linux):
```bash
#!/bin/bash
cd backend
source venv/bin/activate
flask db upgrade
python main.py
```

**start-frontend.sh** (macOS/Linux):
```bash
#!/bin/bash
cd frontend
npm install
npm run dev
```

Make them executable:
```bash
chmod +x start-backend.sh start-frontend.sh
```

Then run:
```bash
./start-backend.sh  # Terminal 1
./start-frontend.sh # Terminal 2
```

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Error

**Error**: `could not connect to server: Connection refused`

**Solutions**:
- Ensure PostgreSQL is running: `docker ps` (if using Docker) or check system services
- Verify `.env` file has correct database credentials
- Check if the database exists: `psql -U postgres -l`
- Restart Docker container: `docker-compose restart`

#### 2. Port Already in Use

**Error**: `Address already in use` or `Port 5000/5173 is already in use`

**Solutions**:
```bash
# Find process using the port (macOS/Linux)
lsof -ti:5000  # or :5173 for frontend
kill -9 <PID>  # Replace <PID> with the process ID

# Or change the port in your configuration
```

#### 3. Migration Errors

**Error**: `Can't locate revision identified by 'xxxxx'`

**Solutions**:
```bash
cd backend
source venv/bin/activate

# Option 1: Stamp current database state
flask db stamp head

# Option 2: Reset migrations (⚠️ this drops all data)
flask db downgrade base
flask db upgrade
```

#### 4. Module Not Found Errors

**Error**: `ModuleNotFoundError: No module named 'xxx'`

**Solutions**:
```bash
# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

#### 5. Virtual Environment Issues

**Error**: `Fatal error in launcher: Unable to create process`

**Solution**:
- Always use `python -m flask` instead of `flask` directly
- Recreate virtual environment:
```bash
cd backend
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### 6. CORS Errors in Browser

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solutions**:
- Ensure backend is running on `http://localhost:5000`
- Check frontend API base URL in code
- Restart both backend and frontend servers

#### 7. JWT Token Errors

**Error**: `Invalid token` or `Token expired`

**Solutions**:
- Clear browser localStorage: Open DevTools > Application > Local Storage > Clear
- Log out and log back in
- Verify `JWT_SECRET_KEY` in `.env` hasn't changed

#### 8. Image Upload Issues

**Error**: Images not displaying or upload fails

**Solutions**:
- Ensure `backend/static/product_images/` directory exists:
```bash
mkdir -p backend/static/product_images
```
- Check file permissions
- Verify Pillow is installed: `pip install Pillow`

### Getting Help

If you encounter issues not covered here:

1. Check the terminal output for detailed error messages
2. Review the browser console (F12) for frontend errors
3. Examine backend logs in the terminal running Flask
4. Verify all environment variables are set correctly in `.env`
5. Ensure all prerequisites are installed and up to date

### Useful Commands

```bash
# Check Python version
python --version

# Check Node.js version
node --version

# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# View Docker containers
docker ps

# View Docker logs
docker logs online_store_db

# Check if ports are in use
lsof -ti:5000  # Backend
lsof -ti:5173  # Frontend

# Reset database (⚠️ destroys all data)
flask db downgrade base
flask db upgrade
python seed.py
```

---

## 📦 Project Structure Reference

```
online-store-implementation/
├── backend/                 # Flask backend
│   ├── main.py             # Application entry point
│   ├── requirements.txt    # Python dependencies
│   ├── seed.py            # Database seeding script
│   ├── config/            # Configuration files
│   ├── controllers/       # API endpoints
│   ├── models/           # Database models
│   ├── services/         # Business logic
│   ├── repositories/     # Data access layer
│   ├── migrations/       # Database migrations
│   └── static/           # Static files (images)
├── frontend/              # React frontend
│   ├── src/              # Source code
│   ├── public/           # Public assets
│   └── package.json      # Node dependencies
├── docker-compose.yml    # Docker configuration
├── .env                  # Environment variables (create this)
└── README.md            # Project documentation
```

---

## 🎯 Next Steps

After successful setup:

1. **Explore the API**: Visit `http://localhost:5000/api` to see available endpoints
2. **Review Documentation**: Check `backend/README.md` and `frontend/README.md` for more details
3. **Test Features**: Try user registration, product browsing, cart operations, and checkout
4. **Development**: Start building new features or fixing bugs!

---

## 📝 Notes

- Always activate the virtual environment before running backend commands
- Keep your `.env` file secure and never commit it to version control
- Run migrations after pulling updates to keep database schema in sync
- Use `seed.py` to populate test data for development
- Backend runs on port 5000, frontend on port 5173 by default

---
