/* base */
import express from "express";
import passport from "passport";
import passportLocal from "passport-local";
import User from "./models/user";
/* controllers */
import { UserController } from "./controllers/UserController";
/* utils */
// import multer from "multer";
import { handleResponse } from "./utils/general";

const router = express.Router();

// getting the local authentication type
const LocalStrategy = passportLocal.Strategy;

// TODO: use this for file uploads
// destination for file uploads
// const profPicDest = multer({
//   dest: profilePics,
// });

/* ------------ PASSPORT CONFIG START ------------------ */
// base auth
passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },

    (username, password, done) => {
      User.findOne({ username }).exec((err, user) => {
        if (user) {
          user
            .comparePassword(password)
            .then(() => {
              // eslint-disable-next-line no-unused-vars
              const { password, ...userz } = user._doc;
              done(null, userz);
            })
            .catch(() => {
              done(null, false, { message: "Wrong password" });
            });
        } else {
          done(null, false, { message: "No such user" });
        }
      });
    }
  )
);

// retrieving data helper stuff?
passport.serializeUser((user, done) => {
  done(null, user._id);
});
// ah yes this for getting user data
// yet how secure is this hmmmm
passport.deserializeUser((id, done) => {
  User.findById(id).exec((err, user) => {
    if (err) {
      done(null, false, { message: "Wrong password" });
    } else {
      done(null, user);
    }
  });
});
/* ------------ PASSPORT CONFIG END  ------------------- */

/* ------------ MIDDLEWARE  START --------------------------*/
export const authMiddleware = (req, res, next) => {
  if (!req.isAuthenticated()) {
    handleResponse(401, "You are not authenticated", res);
  } else {
    // we will check here if the user has been blocked before letting
    // them procceed with any logged in routes
    User.findById(req.session.passport.user).exec((err) => {
      if (err) {
        handleResponse(401, "You are not authenticated", res);
      } else {
        next();
      }
    });
  }
};
/* ------------ MIDDLEWARE  END ----------------------------*/

/*--------------- USER ROUTES START ------------------------*/
router.post("/login", UserController.login);
router.get("/logOut", UserController.logOut);
/*--------------- USER ROUTES END --------------------------*/

/*--------------- ADMIN ROUTES START -----------------------*/
router.get("/isLoggedIn", authMiddleware, UserController.isLoggedIn);
/*--------------- ADMIN ROUTES START -----------------------*/

export default router;
