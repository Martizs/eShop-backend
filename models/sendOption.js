import mongoose from "mongoose";

const SendOptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  enName: {
    type: String,
    default: "",
  },

  short: {
    type: String,
    required: true,
  },

  extraInfo: String,

  enExtraInfo: {
    type: String,
    default: "",
  },

  price: {
    type: Number,
    required: true,
  },
});

const SendOption = mongoose.model("SendOption", SendOptionSchema);
export default SendOption;
