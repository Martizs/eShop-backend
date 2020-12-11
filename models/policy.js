import mongoose from "mongoose";

const PolicySchema = new mongoose.Schema({
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

const Policy = mongoose.model("Policy", PolicySchema);
export default Policy;
