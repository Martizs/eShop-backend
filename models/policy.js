import mongoose from "mongoose";

const PolicySchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
});

const Policy = mongoose.model("Policy", PolicySchema);
export default Policy;
