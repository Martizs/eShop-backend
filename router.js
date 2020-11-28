/* base */
import express from "express";
import passport from "passport";
import passportLocal from "passport-local";
import User from "./models/user";
/* controllers */
import { UserController } from "./controllers/UserController";
import { ProductController } from "./controllers/ProductController";
/* utils */
import multer from "multer";
import mime from "mime-types";
import { handleResponse } from "./utils/general";
/* consts */
import { staticPath } from "./consts/general";

const router = express.Router();

const imgDest = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, staticPath);
    },
    filename: (req, file, cb) => {
      const name = Math.random().toString(36).substr(2, 20);
      const ext = mime.extension(file.mimetype);
      cb(null, name + "." + ext);
    },
  }),
});

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
    handleResponse("You are not authenticated", res, 401);
  } else {
    // we will check here if the user has been blocked before letting
    // them procceed with any logged in routes
    User.findById(req.session.passport.user).exec((err) => {
      if (err) {
        handleResponse("You are not authenticated", res, 401);
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
router.post(
  "/updateCreate",
  authMiddleware,
  imgDest.array("file"),
  ProductController.updateCreate
);
router.post("/delProd", authMiddleware, ProductController.delProd);
/*--------------- ADMIN ROUTES END -------------------------*/

/*--------------- PUBLIC ROUTES START -----------------------*/
router.get("/getProducts", ProductController.getProducts);
router.get("/getProduct", ProductController.getProduct);
/*--------------- PUBLIC ROUTES END -------------------------*/

export default router;
