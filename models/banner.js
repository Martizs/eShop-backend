import mongoose from "mongoose";

const BannerSchema = new mongoose.Schema({
  key: String,
  filename: String,
  imgUrl: String,
});

const Banner = mongoose.model("Banner", BannerSchema);
export default Banner;
