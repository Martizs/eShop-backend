import seeder from "mongoose-seed";
/* consts */
import { userModelName } from "../consts/modelConsts";

require("dotenv").config();

// NOTE: call this js script from root, like so: node seeds\userSeedWithPolly.js test test
// first argument - username, second - password

// Data array containing seed data - documents organized by Model
const data = [
  {
    model: userModelName,
    documents: [
      {
        // so third and fourth arguments are the username
        // and password respectively
        username: process.argv[2],
        password: process.argv[3],
      },
    ],
  },
];

// Connect to MongoDB via Mongoose
seeder.connect(process.env.DATABASE_URL, function () {
  // Load Mongoose models
  seeder.loadModels(["models/user.js"]);

  // Clear specified collections
  seeder.clearModels([userModelName], function () {
    // Callback to populate DB once collections have been cleared
    seeder.populateModels(data, function () {
      console.log("populate models called");
      seeder.disconnect();
    });
  });
});
