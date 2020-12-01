import mongoose from "mongoose";

const SendOptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  extraInfo: String,

  price: {
    type: Number,
    required: true,
  },
});

const SendOption = mongoose.model("SendOption", SendOptionSchema);
export default SendOption;
