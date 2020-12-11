import mongoose from "mongoose";

const InfoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  enText: {
    type: String,
    required: true,
    default: "",
  },
});

const Info = mongoose.model("Info", InfoSchema);
export default Info;
