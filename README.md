# 🎓 EduTrack – Smart Academic Management & Analytics Portal

EduTrack is a full-stack academic management system built to simplify school operations through role-based dashboards for **Admins, Teachers, Students, and Parents**. The platform streamlines student management, attendance tracking, assignments, grading, and academic analytics in one centralized application.

## 🚀 Live Demo

**Live Application:** https://edutrack-liart.vercel.app

## 👤 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@edutrack.com | Admin@123 |
| James Bond | teacher@edutrack.com | 123456 |
| John Doe | student@edutrack.com | 123456 |
| Jacob Doe | parent@edutrack.com | 123456 |


> **Note:** These are demo accounts created for recruiters and reviewers to explore the application.

---

# ✨ Features

### 🔐 Authentication & Authorization
- Secure login using NextAuth.js
- Role-based access control
- Separate dashboards for Admin, Teacher, Student, and Parent
- Protected routes

### 👨‍💼 Admin
- Manage students, teachers, parents, classes, and subjects
- View overall school statistics
- Dashboard with analytics
- Assign teachers to classes and subjects

### 👨‍🏫 Teacher
- Mark student attendance
- Create assignments
- View assignment submissions
- Grade student submissions

### 🎓 Student
- View assignments
- Submit assignments
- Track attendance
- View grades and academic performance

### 👨‍👩‍👧 Parent
- Monitor child's attendance
- View assignments
- Track academic performance
- Access teacher feedback

---

# 🛠 Tech Stack

### Frontend
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Impeccable UI

### Backend
- Next.js API Routes
- Prisma ORM
- PostgreSQL (Neon)

### Authentication
- NextAuth.js

### Database
- PostgreSQL

### Deployment
- Vercel

---

# 📊 Key Functionalities

- Role-Based Authentication
- Student Management
- Teacher Management
- Parent Management
- Class & Subject Management
- Assignment Creation & Submission
- Attendance Tracking
- Grade Management
- Dashboard Analytics
- Responsive UI

---


# ⚙️ Running the Project Locally

Clone the repository

```bash
git clone https://github.com/Kashvi-M/edutrack.git
```

Navigate into the project

```bash
cd edutrack
```

Install dependencies

```bash
npm install
```

Create a `.env` file and add:

```env
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

Generate Prisma Client

```bash
npx prisma generate
```

Run database migrations

```bash
npx prisma migrate dev
```

Start the development server

```bash
npm run dev
```

Visit

```
http://localhost:3000
```

---

# 📁 Project Structure

```
src/
 ├── app/
 ├── components/
 ├── lib/
 ├── hooks/
 ├── styles/
 └── types/

prisma/
 ├── schema.prisma
 └── migrations/
```

---

# 🌟 Future Enhancements

- Email notifications
- File uploads for assignments
- Timetable management
- Announcement system
- Dark mode
- Performance analytics
- CSV/PDF report export
- Mobile responsiveness improvements

---

# 👩‍💻 Author

**Kashvi Mahetaliya**

LinkedIn: (https://www.linkedin.com/in/kashvi-mahetaliya-39b06a29b/)

GitHub: https://github.com/Kashvi-M