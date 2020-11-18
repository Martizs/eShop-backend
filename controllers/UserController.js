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
        return handleResponse(400, info.message, res);
      }

      req.login(user, (usrErr) => {
        if (usrErr) {
          console.log(getDateStamp(), "User save to session error: ", usrErr);
        } else {
          handleResponse(200, "success", res);
        }
      });
    })(req, res, next);
  },
  logOut: (req, res) => {
    req.logout();
    res.send();
  },
  isLoggedIn: (req, res) => {
    handleResponse(200, "success", res);
  },
  //   TODO: use this as file upload example
  //   uploadPic: (req, res) => {
  //     const _id = req.session.passport.user;
  //     User.findOne({ _id })
  //       .populate("role")
  //       .exec((err, user) => {
  //         if (err) {
  //           handleResponse(404, "User not found", res);
  //         } else {
  //           // so basically if the user is changing their previously
  //           // uploaded profile pic, we want to remove that
  //           // profile pic and replace it with the new one
  //           if (user.profilePic.indexOf("default_pic") === -1) {
  //             const picName = user.profilePic.substring(
  //               user.profilePic.lastIndexOf("/") + 1
  //             );
  //             const pathToPic = path.join(profilePics, picName);
  //             fs.unlinkSync(pathToPic);
  //           }

  //           user.profilePic = "/static/" + req.file.filename;

  //           user.save((saveErr) => {
  //             if (saveErr) {
  //               handleResponse(500, saveErr, res);
  //             } else {
  //               const userResp = {
  //                 _id: user._id,
  //                 role: user.role,
  //                 username: user.username,
  //                 profilePic: user.profilePic,
  //               };
  //               handleResponse(200, userResp, res);
  //             }
  //           });
  //         }
  //       });
  //   },
};
