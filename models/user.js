import mongoose from "mongoose";
import bcrypt from "bcrypt";
/* consts */
import { userModelName } from "../consts/modelConsts";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    // field to store active socket id's
    // of the currently logged in user
    // so we could do them socket messages
    // to the frontend n shit
    activeSockets: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// NOTE: this gets fired on 'create' and 'user.save'
// this DOES NOT get fired on updateOne
UserSchema.pre("save", function (next) {
  const user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) {
    return next();
  }

  // generate a salt
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }

      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function (candidatePassword) {
  const checkPass = this.password;
  return new Promise((resolve, reject) => {
    return bcrypt.compare(candidatePassword, checkPass, function (
      err,
      isMatch
    ) {
      if (err || !isMatch) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const User = mongoose.model(userModelName, UserSchema);
export default User;
