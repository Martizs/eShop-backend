import Banner from "./../models/banner";
/* utils */
import filter from "lodash/filter";
import find from "lodash/find";
import fs from "fs";
import path from "path";
import { getDateStamp, handleResponse } from "../utils/general";
/* consts */
import { staticUrl, staticPath } from "../consts/general";

export const BannerController = {
  updtCreateBan: (req, res) => {
    const { imgData } = req.body;

    const parsImages = JSON.parse(imgData);

    const newImages = [];

    parsImages.forEach((img) => {
      // so we find the uploaded file equivalent
      // by the filename, as thats the only metadata tag
      // that comes with the file and that we try to keep unique
      // on the frontend
      const uploadedImg = filter(req.files, ["originalname", img.filename]);

      if (uploadedImg.length) {
        const imgName = uploadedImg[0].filename;
        const imgUrl = staticUrl + imgName;

        newImages.push({
          insertOne: {
            document: {
              ...img,
              filename: imgName,
              imgUrl,
            },
          },
        });
      }
    });

    Banner.find().exec((banErr, banners) => {
      if (banErr) {
        handleResponse(banErr, res, 500);
      } else {
        // and here we check if we need to delete any images
        // and we need to delete only the files, as the newly
        // passed in image array will always be updating/replacing
        // the old
        // also we use normal for loop cause .forEach
        // dont wait
        const delBanImgs = [];
        for (let i = 0; i < banners.length; i++) {
          const dbImg = banners[i];
          const delImg = find(parsImages, ["key", dbImg.key]);
          if (!delImg) {
            try {
              fs.unlinkSync(path.join(staticPath, dbImg.filename));

              delBanImgs.push({
                deleteOne: {
                  filter: {
                    _id: dbImg._id,
                  },
                },
              });
            } catch {
              console.log(
                getDateStamp(),
                "Error unlinking file, banners",
                banners,
                "req imgData",
                imgData,
                "req.files",
                req.files,
                "dbImg",
                dbImg
              );
            }
          }
        }

        Banner.bulkWrite([...newImages, ...delBanImgs])
          .then(() => {
            handleResponse("success", res);
          })
          .catch((bulkErr) => {
            handleResponse(bulkErr, res, 500);
          });
      }
    });
  },
  getBanners: (req, res) => {
    Banner.find().exec((err, banners) => {
      if (err) {
        handleResponse(err, res, 500);
      }

      handleResponse(banners, res);
    });
  },
};
