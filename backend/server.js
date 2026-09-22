const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const treatmentRoutes = require('./routes/treatmentRoutes');
const mentorshipRoutes = require('./routes/mentorshipRoutes');
const seedData = require('./config/seedData');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO with permissive CORS for mobile and cross-platform access
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// Attach io to Express app for controllers to access
app.set('io', io);

io.on('connection', (socket) => {
    console.log('[REAL-TIME] New device/client connected:', socket.id);

    // Allow user to join personal room for targeted alerts
    socket.on('join_user_room', (userId) => {
        if (userId) {
            socket.join(`user_${userId}`);
            console.log(`[REAL-TIME] Socket ${socket.id} joined user_${userId}`);
        }
    });

    socket.on('disconnect', () => {
        console.log('[REAL-TIME] Device/client disconnected:', socket.id);
    });
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/mentorship', mentorshipRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        name: 'Lin\'s Dental College & Hospital Real-Time API',
        version: '2.1.0',
        realtime: true
    });
});

// Sync Database and Start Server
connectDB().then(async () => {
    console.log('Database synced successfully');
    await seedData();
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`Dental University Server & Socket.IO live at http://0.0.0.0:${PORT}`);
    });
}).catch(err => {
    console.error('Database connection error:', err);
});
