import mongoose from "mongoose";

const AboutSchema = new mongoose.Schema({
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

const About = mongoose.model("About", AboutSchema);
export default About;
