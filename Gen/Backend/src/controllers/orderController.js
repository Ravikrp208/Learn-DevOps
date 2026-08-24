import Order from "../models/Order.js";

// @desc    Create a new order
// @route   POST /api/orders
// @access  Public (Guest Checkout supported) or Private
export const createOrder = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentDetails,
    shippingFee,
    tax,
    totalPrice,
  } = req.body;

  try {
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items provided" });
    }

    // Mask card number for security (keep last 4 digits)
    const cardNo = paymentDetails.cardNumber.replace(/\s+/g, "");
    const lastFour = cardNo.slice(-4);
    const cardNumberMasked = `•••• •••• •••• ${lastFour || "4444"}`;

    // Generate unique order number
    const generatedOrderNumber = `RG-${Math.floor(100000 + Math.random() * 900000)}`;

    const order = new Order({
      orderNumber: generatedOrderNumber,
      orderItems,
      shippingAddress,
      paymentDetails: {
        cardName: paymentDetails.cardName,
        cardNumberMasked,
      },
      shippingFee: Number(shippingFee) || 0,
      tax: Number(tax) || 0,
      totalPrice: Number(totalPrice),
      // If user is authenticated via JWT middleware
      user: req.user ? req.user._id : undefined,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
