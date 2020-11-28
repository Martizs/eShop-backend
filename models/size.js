import mongoose from "mongoose";

const SizeSchema = new mongoose.Schema({
  name: String,
  amount: {
    type: Number,
    required: true,
  },
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
});

const Size = mongoose.model("Size", SizeSchema);
export default Size;
