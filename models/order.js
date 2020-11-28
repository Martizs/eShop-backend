import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  name: String,

  size: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Size",
  },
});

const Order = mongoose.model("Order", OrderSchema);
export default Order;
