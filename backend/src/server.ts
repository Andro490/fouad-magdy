import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
// import { PrismaClient } from '@prisma/client'; // Uncomment when prisma client is generated

dotenv.config();

const app = express();
// const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));

// Basic Routes Structure for Educational Platform API

// --- AUTH & ROLES ---
app.post('/api/auth/register', (req, res) => {
  // TODO: Create user, hash password, return JWT
  res.json({ message: 'Student registered successfully' });
});

app.post('/api/auth/login', (req, res) => {
  // TODO: Validate credentials, return JWT & user details
  res.json({ token: 'mock-jwt-token', user: { name: 'Student 1', role: 'STUDENT' } });
});

app.get('/api/auth/me', (req, res) => {
  // TODO: Return current user based on JWT
  res.json({ user: { name: 'Student 1', role: 'STUDENT' } });
});


// --- COURSES ---
app.get('/api/courses', (req, res) => {
  res.json([
    { id: '1', title: 'React 101', description: 'Master React with TS', instructor: 'Fouad', price: 50 },
    { id: '2', title: 'Advanced Node.js', description: 'Build scalable APIs', instructor: 'Fouad', price: 75 }
  ]);
});

app.get('/api/courses/:id', (req, res) => {
  const { id } = req.params;
  res.json({ id, title: 'Course Title', description: 'Detailed Description', modules: [] });
});


// --- STUDENT DASHBOARD & PROGRESS ---
app.get('/api/student/progress', (req, res) => {
  res.json({
    enrolledCourses: 3,
    completedCourses: 1,
    recentActivity: [
      { courseId: '1', moduleName: 'Hooks', progress: 80 }
    ]
  });
});


// --- ADMIN DASHBOARD ---
app.get('/api/admin/stats', (req, res) => {
  res.json({
    totalStudents: 1500,
    totalRevenue: 25000,
    activeCourses: 12
  });
});

app.post('/api/admin/courses', (req, res) => {
  // TODO: Upload course details, handle video attachments
  res.json({ success: true, message: 'Course created successfully' });
});


// Health Check
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Educational Platform API 🚀' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Educational Platform API is running on http://localhost:${PORT}`);
});
