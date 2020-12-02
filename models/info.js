import mongoose from "mongoose";

const InfoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
});

const Info = mongoose.model("Info", InfoSchema);
export default Info;
