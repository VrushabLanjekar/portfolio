# Portfolio Backend Setup with Node.js & MySQL

Complete step-by-step guide to connect your portfolio contact form to a MySQL database using Node.js.

## 📋 Prerequisites

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MySQL Server** - [Download here](https://dev.mysql.com/downloads/mysql/)
- **MySQL Workbench** (optional, for GUI) - [Download here](https://dev.mysql.com/downloads/workbench/)

## 🚀 Step-by-Step Setup

### Step 1: Install Dependencies

```bash
cd "d:\Portfolio Project"
npm install
```

### Step 2: Setup MySQL Database

1. **Start MySQL Server**
   - Windows: Start MySQL from Services or MySQL Workbench
   - Or use XAMPP/WAMP if you have it

2. **Create Database**
   - Open MySQL Command Line or MySQL Workbench
   - Run this command:
   ```sql
   CREATE DATABASE portfolio_db;
   ```

3. **Create Table**
   - Run the `database_setup.sql` file:
   ```sql
   USE portfolio_db;

   CREATE TABLE contact_messages (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     email VARCHAR(100) NOT NULL,
     subject VARCHAR(200) NOT NULL,
     message TEXT NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     read_status BOOLEAN DEFAULT FALSE,
     INDEX idx_email (email),
     INDEX idx_created_at (created_at)
   );
   ```

### Step 3: Configure Database Connection

Edit the `.env` file with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_mysql_password_here
DB_NAME=portfolio_db
PORT=3000
```

**Note:** Replace `your_actual_mysql_password_here` with your real MySQL password. If you don't have a password, leave it empty: `DB_PASSWORD=`

### Step 4: Test Database Connection

```bash
npm run test-db
```

You should see:
```
✅ MySQL connected successfully!
Database: portfolio_db
User: root
📊 Messages in database: 0
```

### Step 5: Start the Backend Server

```bash
npm start
```

You should see:
```
🚀 Server running on http://localhost:3000
✅ MySQL connected successfully
```

### Step 6: Test the Contact Form

1. Open your browser to: `http://localhost:3000/index2.html`
2. Fill out the contact form and submit
3. Check the server console for success messages
4. Verify data is saved in MySQL database

## 📁 Project Structure

```
d:\Portfolio Project\
├── index2.html          # Your portfolio (frontend)
├── package.json         # Node.js dependencies
├── server.js           # Express server (backend)
├── .env                # Database configuration
├── database_setup.sql  # MySQL schema
├── test-db.js          # Database connection tester
└── README.md           # This file
```

## 🔧 API Endpoints

- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all messages (admin)
- `GET /api/health` - Health check

## 🐛 Troubleshooting

### "MySQL connection failed"
- Make sure MySQL server is running
- Check your password in `.env` file
- Try without password: `DB_PASSWORD=`

### "Port 3000 already in use"
- Change PORT in `.env` to 3001 or another port
- Kill the process using the port

### Form shows "Connection error"
- Make sure server is running (`npm start`)
- Check browser console for errors
- Verify server is on port 3000

### Can't access http://localhost:3000/index2.html
- Make sure server is running
- Try http://localhost:3000/ (will serve index2.html automatically)

## 📊 View Stored Messages

To see all contact form submissions:

```bash
# In MySQL Command Line:
USE portfolio_db;
SELECT * FROM contact_messages ORDER BY created_at DESC;
```

Or visit: `http://localhost:3000/api/contact` in your browser.

## 🚀 Production Deployment

For live deployment, consider:
- **Railway.app** (free tier)
- **Render.com**
- **Heroku**
- **AWS/DigitalOcean**

## 🔒 Security Features

- ✅ Input validation
- ✅ SQL injection protection
- ✅ CORS enabled
- ✅ Environment variables
- ✅ Error handling

## 📞 Support

If you get stuck:
1. Run `npm run test-db` to check database connection
2. Check server console when starting with `npm start`
3. Verify `.env` file has correct credentials
4. Make sure MySQL server is running

---

**🎉 Your portfolio now has a fully functional backend with MySQL database!**