import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
});

const Contact = mongoose.model("Contact", ContactSchema);
export default Contact;
