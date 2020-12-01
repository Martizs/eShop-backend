import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    extraInfo: String,
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    postCode: {
      type: String,
      required: true,
    },

    sendOption: {
      extraInfo: String,
      extraVal: String,
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },

    orderCode: {
      type: String,
      required: true,
    },

    payedAmount: {
      type: Number,
      required: true,
    },

    paymentPending: {
      type: Boolean,
      default: true,
    },

    payedCode: String,

    ordSizes: [
      {
        size: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Size",
        },
        selectedAmount: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);
export default Order;
