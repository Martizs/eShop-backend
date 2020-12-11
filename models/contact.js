import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
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

const Contact = mongoose.model("Contact", ContactSchema);
export default Contact;
