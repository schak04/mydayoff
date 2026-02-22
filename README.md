# MyDayOff - Employee Leave Management System

This project is a full-stack HR workflow simulation for managing employee leave requests and approvals.

## Tech Stack
- **Backend**: Node.js, Express.js 
- **Authentication**: JWT
- **Password Hashing**: `bcrypt`
- **Database**: MongoDB (**ODM:** Mongoose)
- **Frontend**: React.js, Tailwind CSS
- **Testing**: Postman

## Installation & Setup

### 1. Clone the repository and navigate to the project root.

### 2. Server Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory based on the `.env.example` file provided:
```bash
cp .env.example .env
```
Update the values in `.env` as needed (e.g., `MONGO_URI`, `JWT_SECRET`).

### 3. Seed the Database
Run the seed script to create test users:
```bash
npm run seed
```
**Test Credentials:**
- Admin: `admin@mydayoff.com` / `password123`
- Manager: `manager@mydayoff.com` / `password123`
- Employee: `employee1@mydayoff.com` / `password123`

### 4. Client Setup
```bash
cd ../client
npm install
```

## Running the Application

### Start the Server
```bash
cd server
npm run start
```

### Start the Client
```bash
cd client
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Structure
- `client/`: React frontend with Tailwind CSS.
- `server/`: Express backend with MongoDB models.
- `docs/`: System design and presentation notes.

---

## Author

&copy; 2026 [Saptaparno Chakraborty](https://github.com/schak04).  
All rights reserved.

---
