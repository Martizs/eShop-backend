import mongoose from "mongoose";

const AboutSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
});

const About = mongoose.model("About", AboutSchema);
export default About;
