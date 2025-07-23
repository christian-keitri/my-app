import express from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = 'your-super-secret-key';

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

/* ========== AUTH ========== */

// Register
app.post('/api/register', async (req, res) => {
    const { email, password, username, firstname, lastname } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    try {
        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) return res.status(409).json({ message: 'Email already in use' });

        const hashed = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: { email, username, firstname, lastname, password: hashed }
        });

        res.status(201).json({ message: 'Registered successfully' });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        const valid = user && await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 3600000
        });

        res.json({ message: 'Login successful' });
    } catch (err) {
        console.error('Login error:', err);
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

/* ========== USERS ========== */

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
        console.error('Fetch users error:', err);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

// Create user
app.post('/api/users', async (req, res) => {
    const { username, email, firstname, lastname, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'Required fields missing' });

    try {
        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) return res.status(409).json({ message: 'Email already exists' });

        const hashed = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { username, email, firstname, lastname, password: hashed },
            select: { id: true, username: true, email: true, firstname: true, lastname: true }
        });

        res.status(201).json(user);
    } catch (err) {
        console.error('Create user error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { username, email, firstname, lastname } = req.body;

    try {
        const updated = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { username, email, firstname, lastname }
        });

        res.json(updated);
    } catch (err) {
        console.error('Update user error:', err);
        res.status(500).json({ message: 'Failed to update user' });
    }
});

/* ========== ORGANIZATIONS ========== */

// Get all organizations (flat list)
app.get('/api/organizations', async (req, res) => {
    try {
        const orgs = await prisma.organization.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                notes: true,
                isEnabled: true,
                createdAt: true
            }
        });
        res.json(orgs);
    } catch (err) {
        console.error('Fetch orgs error:', err);
        res.status(500).json({ message: 'Failed to fetch organizations' });
    }
});

// Get all orgs with users
app.get('/api/clients', async (req, res) => {
    try {
        const orgs = await prisma.organization.findMany({
            include: { users: true }
        });
        res.json(orgs);
    } catch (err) {
        console.error('Fetch clients error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create org
app.post('/api/organizations', async (req, res) => {
    const { name, description, notes, isEnabled } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    try {
        const org = await prisma.organization.create({
            data: { name, description, notes, isEnabled }
        });
        res.status(201).json(org);
    } catch (err) {
        console.error('Create org error:', err);
        res.status(500).json({ message: 'Failed to create organization' });
    }
});

// Update org
app.put('/api/organizations/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, notes, isEnabled } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    try {
        const updated = await prisma.organization.update({
            where: { id },
            data: { name, description, notes, isEnabled }
        });
        res.json(updated);
    } catch (err) {
        console.error('Update org error:', err);
        res.status(500).json({ message: 'Failed to update organization' });
    }
});

// Toggle org status
app.put('/api/organizations/:id/toggle', async (req, res) => {
    const { id } = req.params;

    try {
        const org = await prisma.organization.findUnique({ where: { id } });
        if (!org) return res.status(404).json({ message: 'Organization not found' });

        const updated = await prisma.organization.update({
            where: { id },
            data: { isEnabled: !org.isEnabled }
        });

        res.json(updated);
    } catch (err) {
        console.error('Toggle status error:', err);
        res.status(500).json({ message: 'Failed to toggle organization status' });
    }
});

/* ========== BRANCHES ========== */

// Get all branches
app.get('/api/branches', async (req, res) => {
    try {
        const branches = await prisma.branch.findMany({
            include: {
                organization: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(branches);
    } catch (err) {
        console.error('Fetch branches error:', err);
        res.status(500).json({ message: 'Failed to fetch branches' });
    }
});

// Create branch
app.post('/api/branches', async (req, res) => {
    const { name, organizationId } = req.body;
    if (!name || !organizationId) return res.status(400).json({ message: 'Name and organizationId are required' });

    try {
        const branch = await prisma.branch.create({
            data: { name, organizationId }
        });
        res.status(201).json(branch);
    } catch (err) {
        console.error('Create branch error:', err);
        res.status(500).json({ message: 'Failed to create branch' });
    }
});

/* ========== START SERVER ========== */

app.listen(8000, () => {
    console.log('✅ Server running on http://localhost:8000');
});
