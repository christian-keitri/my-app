import express from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const prisma = new PrismaClient();
const app = express();

const JWT_SECRET = 'your-super-secret-key'; // ⚠️ In production, store in .env

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ========== AUTH ==========

// Register
app.post('/api/register', async (req, res) => {
    const { email, password, username, firstname, lastname } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                username,
                firstname,
                lastname,
                password: hashedPassword
            }
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Missing credentials' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 3600000
        });

        res.json({ message: 'Login successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get current user
app.get('/api/me', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ user: decoded });
    } catch {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
});

// ========== USERS ==========

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                firstname: true,
                lastname: true
            }
        });

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

// Create user (used in modal form)
app.post('/api/users', async (req, res) => {
    const { username, email, firstname, lastname, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                firstname,
                lastname,
                password: hashedPassword
            },
            select: {
                id: true,
                username: true,
                email: true,
                firstname: true,
                lastname: true
            }
        });

        res.status(201).json(newUser);
    } catch (err) {
        console.error('Failed to create user:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { username, email, firstname, lastname } = req.body;

    try {
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                username,
                email,
                firstname,
                lastname
            }
        });

        res.json(updatedUser);
    } catch (err) {
        console.error('Update failed:', err);
        res.status(500).json({ message: 'Failed to update user' });
    }
});

// ========== ORGANIZATIONS ==========

// Get all organizations
app.get('/api/clients', async (req, res) => {
    try {
        const organizations = await prisma.organization.findMany({
            include: {
                users: true // Optional: include users if needed
            }
        });
        res.json(organizations);
    } catch (err) {
        console.error('Failed to fetch organizations:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create organization
app.post('/api/clients', async (req, res) => {
    const { name, description } = req.body;

    if (!name) return res.status(400).json({ message: 'Name is required' });

    try {
        const organization = await prisma.organization.create({
            data: { name, description }
        });
        res.status(201).json(organization);
    } catch (err) {
        console.error('Create failed:', err);
        res.status(500).json({ message: 'Failed to create organization' });
    }
});

// Update organization
app.put('/api/clients/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
        const updated = await prisma.organization.update({
            where: { id: parseInt(id) },
            data: { name, description }
        });
        res.json(updated);
    } catch (err) {
        console.error('Update failed:', err);
        res.status(500).json({ message: 'Failed to update organization' });
    }
});

// Get all organizations
app.get('/api/organizations', async (req, res) => {
    try {
        const organizations = await prisma.organization.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                notes: true,
                isEnabled: true,
                createdAt: true
            }
        });
        res.json(organizations);
    } catch (err) {
        console.error('Error fetching organizations:', err);
        res.status(500).json({ message: 'Failed to fetch organizations' });
    }
});


app.listen(8000, () => {
    console.log('✅ Server running on http://localhost:8000');
});
