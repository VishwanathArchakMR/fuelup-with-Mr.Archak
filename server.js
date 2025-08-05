const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// File paths
const TRIBE_COUNT_FILE = path.join(__dirname, 'tribe-count.json');
const FOLLOWERS_FILE = path.join(__dirname, 'followers.json');
const CONTACTS_FILE = path.join(__dirname, 'contacts.json');

// Initialize files if they don't exist
async function initializeFiles() {
    try {
        // Initialize tribe count
        if (!await fs.pathExists(TRIBE_COUNT_FILE)) {
            await fs.writeJson(TRIBE_COUNT_FILE, { count: 50, lastUpdated: new Date().toISOString() });
        }
        
        // Initialize followers file
        if (!await fs.pathExists(FOLLOWERS_FILE)) {
            await fs.writeJson(FOLLOWERS_FILE, []);
        }
        
        // Initialize contacts file
        if (!await fs.pathExists(CONTACTS_FILE)) {
            await fs.writeJson(CONTACTS_FILE, []);
        }
    } catch (error) {
        console.error('Error initializing files:', error);
    }
}
// Email transporter setup
let transporter;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
} else {
    console.warn('Email sending is disabled. Set EMAIL_USER and EMAIL_PASS environment variables to enable email notifications.');
}

// Get current tribe count
app.get('/api/tribe-count', async (req, res) => {
    try {
        const data = await fs.readJson(TRIBE_COUNT_FILE);
        res.json({ count: data.count });
    } catch (error) {
        console.error('Error reading tribe count:', error);
        res.json({ count: 50 }); // Default fallback
    }
});
// Handle follow and contact form submission
app.post('/api/follow', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: 'All fields are required.' });
    }

    try {
        // Update tribe count
        const tribeData = await fs.readJson(TRIBE_COUNT_FILE);
        tribeData.count += 1;
        tribeData.lastUpdated = new Date().toISOString();
        await fs.writeJson(TRIBE_COUNT_FILE, tribeData);

        // Save follower
        const followers = await fs.readJson(FOLLOWERS_FILE);
        followers.push({ name, email, followedAt: new Date().toISOString() });
        await fs.writeJson(FOLLOWERS_FILE, followers);

        // Save message
        const contacts = await fs.readJson(CONTACTS_FILE);
        contacts.push({ name, email, message, sentAt: new Date().toISOString() });
        await fs.writeJson(CONTACTS_FILE, contacts);

        // Send email
        if (transporter) {
            await transporter.sendMail({
                from: `"Fuel Up Website" <${process.env.EMAIL_USER}>`,
                to: "fuelupwithmrarchak05@gmail.com",
                subject: "New Follower & Message",
                text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
            });
        }

        res.json({ success: true, count: tribeData.count });

    } catch (error) {
        console.error('Error in /api/follow:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});


// Check if email is already a follower
app.post('/api/check-follower', async (req, res) => {
    try {
        const { email } = req.body;
        const followers = await fs.readJson(FOLLOWERS_FILE);
        const isFollower = followers.some(follower => follower.email.toLowerCase() === email.toLowerCase());
        res.json({ isFollower });
    } catch (error) {
        console.error('Error checking follower:', error);
        res.json({ isFollower: false });
    }
});

// Add new follower and increment tribe count
app.post('/api/add-follower', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Read current data
        const followers = await fs.readJson(FOLLOWERS_FILE);
        const tribeData = await fs.readJson(TRIBE_COUNT_FILE);
        
        // Check if already exists
        const isExisting = followers.some(follower => follower.email.toLowerCase() === email.toLowerCase());
        
        if (isExisting) {
            return res.json({ 
                success: false, 
                message: 'Already a tribe member!',
                count: tribeData.count 
            });
        }
        
        // Add new follower
        const newFollower = {
            email: email,
            timestamp: new Date().toISOString(),
            source: 'Follow Me Section'
        };
        
        followers.push(newFollower);
        
        // Increment tribe count
        tribeData.count += 1;
        tribeData.lastUpdated = new Date().toISOString();
        
        // Save both files
        await fs.writeJson(FOLLOWERS_FILE, followers);
        await fs.writeJson(TRIBE_COUNT_FILE, tribeData);
        
                // Send notification email
        try {
            if (transporter) { // Add this check
                await transporter.sendMail({
                    from: process.env.EMAIL_USER || 'noreply@fuelup.com',
                    to: 'fuelupwithmrarchak05@gmail.com',
                    subject: '🎉 New Tribe Member Joined!',
                    html: `
                        <h2>New Tribe Member Alert!</h2>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>Total Tribe Members:</strong> ${tribeData.count}</p>
                        <p><strong>Source:</strong> Follow Me Section</p>
                    `
                });
            } else { // Add this else block
                console.warn('Skipping new tribe member email notification: Email transporter not configured.');
            }
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
        }


// Handle contact form submission
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        // Read current contacts
        const contacts = await fs.readJson(CONTACTS_FILE);
        
        // Add new contact
        const newContact = {
            name: name,
            email: email,
            message: message,
            timestamp: new Date().toISOString(),
            source: 'Contact Form'
        };
        
        contacts.push(newContact);
        
        // Save to file
        await fs.writeJson(CONTACTS_FILE, contacts);
        
                // Send email notification
        try {
            if (transporter) { // Add this check
                await transporter.sendMail({
                    from: process.env.EMAIL_USER || 'noreply@fuelup.com',
                    to: 'fuelupwithmrarchak05@gmail.com',
                    subject: '📧 New Contact Form Submission',
                    html: `
                        <h2>New Contact Form Submission</h2>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Message:</strong></p>
                        <p>${message}</p>
                        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                    `
                });
            } else { // Add this else block
                console.warn('Skipping contact form email notification: Email transporter not configured.');
            }
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
        }


// Start server
app.listen(PORT, async () => {
    await initializeFiles();
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('📊 Real-time tribe counter is active!');
});
