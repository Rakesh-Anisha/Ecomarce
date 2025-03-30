
// module.exports = mongoose.model("Order", OrderSchema);
const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  cartId: { type: String, required: true },
  cartItems: [
    {
      productId: String,
      title: String,
      image: String,
      price: Number,
      quantity: Number,
    },
  ],
  addressInfo: {
    addressId: String,
    address: String,
    city: String,
    pincode: String,
    phone: String,
    notes: String,
  },
  orderStatus: { type: String, default: "pending" },
  paymentMethod: { type: String, required: true }, // e.g., "paypal" or "cod"
  paymentStatus: { type: String, default: "pending" },
  totalAmount: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
  orderUpdateDate: { type: Date, default: Date.now },
  paymentId: { type: String, default: "" },
  payerId: { type: String, default: "" },
});

module.exports = mongoose.model("Order", OrderSchema);