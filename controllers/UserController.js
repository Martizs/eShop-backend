import passport from "passport";
/* utils */
import { handleResponse, getDateStamp } from "../utils/general";

// and this be the main controller
export const UserController = {
  login: (req, res, next) => {
    passport.authenticate("local", (authErr, user, info) => {
      if (authErr) {
        console.log(getDateStamp(), "passport authenticate error: ", authErr);
        return next(authErr);
      }

      if (!user) {
        return handleResponse(info.message, res, 400);
      }

      req.login(user, (usrErr) => {
        if (usrErr) {
          console.log(getDateStamp(), "User save to session error: ", usrErr);
        } else {
          handleResponse("success", res);
        }
      });
    })(req, res, next);
  },
  logOut: (req, res) => {
    req.logout();
    res.send();
  },
  isLoggedIn: (req, res) => {
    handleResponse("success", res);
  },
};
