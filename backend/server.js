import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Path to orders.json file
const ordersFilePath = join(__dirname, 'orders.json');

// Get all orders
app.get('/api/orders', async (req, res) => {
    try {
        const ordersData = await fs.readFile(ordersFilePath, 'utf8');
        const raw = JSON.parse(ordersData);
        const list = (raw.orders || raw || []).filter(o => {
            if (!o || typeof o !== 'object') return false;
            if (!o.id) return false;
            const amount = (o.payable ?? o.total ?? 0);
            const itemsOk = Array.isArray(o.items) && o.items.length > 0;
            return itemsOk && amount > 0;
        });
        res.json({ orders: list });
    } catch (error) {
        console.error('Error reading orders:', error);
        res.status(500).json({ error: 'Error reading orders' });
    }
});

// Helper to generate a short human-friendly pickup code
function generatePickupCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

// Add a new order
app.post('/api/orders', async (req, res) => {
    try {
        const ordersData = await fs.readFile(ordersFilePath, 'utf8');
        const orders = JSON.parse(ordersData);
        
        const newOrder = {
            id: Date.now().toString(),
            ...req.body,
            timestamp: new Date().toISOString(),
            pickupCode: generatePickupCode(),
            status: req.body?.status || 'Pending'
        };
        if (!newOrder.campus) newOrder.campus = 'Punjab';
        
        orders.orders.push(newOrder);
        
        await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2));
        res.status(201).json(newOrder);
    } catch (error) {
        console.error('Error adding order:', error);
        res.status(500).json({ error: 'Error adding order' });
    }
});

// Get pickup code for an order (for showing QR on client)
app.get('/api/orders/:id/pickup-code', async (req, res) => {
    try {
        const ordersData = await fs.readFile(ordersFilePath, 'utf8');
        const data = JSON.parse(ordersData);
        const idx = data.orders.findIndex(o => o.id === req.params.id);
        if (idx === -1) return res.status(404).json({ error: 'Order not found' });
        const order = data.orders[idx];
        if (!order.pickupCode) {
            order.pickupCode = generatePickupCode();
            data.orders[idx] = order;
            await fs.writeFile(ordersFilePath, JSON.stringify(data, null, 2));
        }
        res.json({ id: order.id, pickupCode: order.pickupCode });
    } catch (error) {
        console.error('Error getting pickup code:', error);
        res.status(500).json({ error: 'Error getting pickup code' });
    }
});

// Vendor scans/enters code to mark as picked up
app.post('/api/orders/:id/pickup', async (req, res) => {
    try {
        const { code } = req.body || {};
        if (!code) return res.status(400).json({ error: 'Code required' });

        const ordersData = await fs.readFile(ordersFilePath, 'utf8');
        const data = JSON.parse(ordersData);
        const idx = data.orders.findIndex(o => o.id === req.params.id);
        if (idx === -1) return res.status(404).json({ error: 'Order not found' });

        const order = data.orders[idx];
        if (order.pickupCode !== code) return res.status(401).json({ error: 'Invalid code' });

        order.status = 'Picked';
        data.orders[idx] = order;
        await fs.writeFile(ordersFilePath, JSON.stringify(data, null, 2));
        res.json({ success: true, order });
    } catch (error) {
        console.error('Error marking pickup:', error);
        res.status(500).json({ error: 'Error marking pickup' });
    }
});

// Simple pickup by code (no order id needed) - for vendor UI
app.post('/api/pickup/by-code', async (req, res) => {
    try {
        const { code } = req.body || {};
        if (!code) return res.status(400).json({ error: 'Code required' });

        const ordersData = await fs.readFile(ordersFilePath, 'utf8');
        const data = JSON.parse(ordersData);
        const idx = data.orders.findIndex(o => o.pickupCode === code);
        if (idx === -1) return res.status(404).json({ error: 'Order not found for code' });
        const order = data.orders[idx];

        order.status = 'Picked';
        data.orders[idx] = order;
        await fs.writeFile(ordersFilePath, JSON.stringify(data, null, 2));
        res.json({ success: true, order });
    } catch (error) {
        console.error('Error in pickup by code:', error);
        res.status(500).json({ error: 'Error in pickup by code' });
    }
});

// Vendor accepts an order by ID (sets status to 'Accepted')
app.post('/api/orders/:id/accept', async (req, res) => {
    try {
        const ordersData = await fs.readFile(ordersFilePath, 'utf8');
        const data = JSON.parse(ordersData);
        const idx = data.orders.findIndex(o => o.id === req.params.id);
        if (idx === -1) return res.status(404).json({ error: 'Order not found' });

        const order = data.orders[idx];
        order.status = 'Accepted';
        data.orders[idx] = order;
        await fs.writeFile(ordersFilePath, JSON.stringify(data, null, 2));
        res.json({ success: true, order });
    } catch (error) {
        console.error('Error accepting order:', error);
        res.status(500).json({ error: 'Error accepting order' });
    }
});

// Vendor accepts an order by pickup code (scan/paste)
app.post('/api/accept/by-code', async (req, res) => {
    try {
        const { code } = req.body || {};
        if (!code) return res.status(400).json({ error: 'Code required' });

        const ordersData = await fs.readFile(ordersFilePath, 'utf8');
        const data = JSON.parse(ordersData);
        const idx = data.orders.findIndex(o => o.pickupCode === code);
        if (idx === -1) return res.status(404).json({ error: 'Order not found for code' });
        const order = data.orders[idx];

        // Move to Accepted if not already further along
        const progression = ['Pending','Accepted','Preparing','Ready','Picked'];
        const currentIdx = progression.indexOf(order.status || 'Pending');
        const acceptedIdx = progression.indexOf('Accepted');
        if (currentIdx < acceptedIdx) {
            order.status = 'Accepted';
        }

        data.orders[idx] = order;
        await fs.writeFile(ordersFilePath, JSON.stringify(data, null, 2));
        res.json({ success: true, order });
    } catch (error) {
        console.error('Error in accept by code:', error);
        res.status(500).json({ error: 'Error in accept by code' });
    }
});

// Update order status (e.g., Preparing, Ready, Picked)
app.post('/api/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body || {};
        const allowed = ['Pending','Accepted','Preparing','Ready','Picked'];
        if (!status || !allowed.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const ordersData = await fs.readFile(ordersFilePath, 'utf8');
        const data = JSON.parse(ordersData);
        const idx = data.orders.findIndex(o => o.id === req.params.id);
        if (idx === -1) return res.status(404).json({ error: 'Order not found' });

        const order = data.orders[idx];
        order.status = status;
        data.orders[idx] = order;
        await fs.writeFile(ordersFilePath, JSON.stringify(data, null, 2));
        res.json({ success: true, order });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Error updating order status' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
