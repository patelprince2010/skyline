const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Connect to MongoDB
mongoose
  .connect('mongodb://localhost:27017/skyline_shopper', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB (Skyline Shopper)'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Define Order Schema
const orderSchema = new mongoose.Schema({
  orderID: { type: String, required: true, unique: true },
  userID: { type: String, required: true },
  items: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      image: { type: String },
    },
  ],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, default: 'Pending' },
  orderStatus: { type: String, default: 'Ordered' },
  orderDate: { type: Date, default: Date.now },
});

// Order Model
const Order = mongoose.model('Order', orderSchema);

// Initialize Express
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Save Order Endpoint
app.post('/saveOrder', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.json({ success: true, message: 'Order saved successfully.' });
  } catch (err) {
    console.error('Error saving order:', err);
    res.status(500).json({ success: false, message: 'Error saving order.' });
  }
});

// Get All Orders Endpoint
app.get('/getOrders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1 }); // Sort orders by latest date
    res.json({ success: true, orders });
  } catch (err) {
    console.error('Error retrieving orders:', err);
    res.status(500).json({ success: false, message: 'Error retrieving orders.' });
  }
});

// Get Order by ID Endpoint
app.get('/getOrder/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderID: orderId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error('Error retrieving order:', err);
    res.status(500).json({ success: false, message: 'Error retrieving order.' });
  }
});

// Start Server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
