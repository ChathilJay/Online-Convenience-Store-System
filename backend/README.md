# Backend README

Quick setup and migration instructions.

Prerequisites
- Python 3.8+
- PostgreSQL

1. Create and activate virtual environment:

   On Windows:
   ```cmd
   cd backend
   python -m venv venv
   venv\Scripts\activate
   ```

   On macOS/Linux:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables (create `.env` in `backend/`):
   - DATABASE_URL=postgresql://user:password@host:port/dbname
   - SECRET_KEY=your-secret

4. Run migrations:

   Set the FLASK_APP environment variable:

   On Windows:
   ```cmd
   set FLASK_APP=main.py
   ```

   On macOS/Linux:
   ```bash
   export FLASK_APP=main.py
   ```

   Then run:
   ```bash
   python -m flask db migrate -m "Add product, cart, and cart_item tables"
   python -m flask db upgrade
   ```

5. (Optional) Seed the database with mock data:

   ```bash
   python seed.py
   ```

Troubleshooting: "Fatal error in launcher: Unable to create process..."
- This happens when the `flask.exe` launcher references a virtualenv `python.exe` that doesn't exist anymore (moved/deleted venv). Use `python -m flask` which avoids that launcher, or recreate the venv at the expected path.


