import SendOption from "./../models/sendOption";
/* utils */
import { handleResponse } from "../utils/general";
import find from "lodash/find";

export const SendOptionsController = {
  optUpdtCreate: (req, res) => {
    try {
      const { sendOptions } = req.body;

      SendOption.find().exec((sendOptErr, dbSendOpts) => {
        if (sendOptErr) {
          handleResponse(sendOptErr, res, 500);
        } else {
          const newOptions = [];
          const updtOptions = [];

          const parsedOpts = JSON.parse(sendOptions);
          parsedOpts.forEach((option) => {
            // adding new sizes
            if (option.new) {
              newOptions.push({
                insertOne: {
                  document: {
                    name: option.name,
                    enName: option.enName,
                    price: option.price,
                    extraInfo: option.extraInfo,
                    enExtraInfo: option.enExtraInfo,
                    short: option.short,
                  },
                },
              });
            } else {
              // updating sizes
              dbSendOpts.forEach((dbOption) => {
                if (
                  dbOption._id == option._id &&
                  (dbOption.name !== option.name ||
                    dbOption.enName !== option.enName ||
                    dbOption.price !== option.price ||
                    dbOption.extraInfo !== option.extraInfo ||
                    dbOption.enExtraInfo !== option.enExtraInfo ||
                    dbOption.short !== option.short)
                ) {
                  updtOptions.push({
                    updateOne: {
                      filter: { _id: dbOption._id },
                      update: {
                        $set: {
                          name: option.name,
                          enName: option.enName,
                          price: option.price,
                          extraInfo: option.extraInfo,
                          enExtraInfo: option.enExtraInfo,
                          short: option.short,
                        },
                      },
                    },
                  });
                }
              });
            }
          });

          // deleting sizes
          const delOpts = [];
          dbSendOpts.forEach((dbOption) => {
            const delOpt = find(
              parsedOpts,
              (option) => dbOption._id == option._id
            );
            if (!delOpt) {
              delOpts.push({
                deleteOne: {
                  filter: {
                    _id: dbOption._id,
                  },
                },
              });
            }
          });

          // and here we update all of them sizes accordingly
          SendOption.bulkWrite([...newOptions, ...updtOptions, ...delOpts])
            .then(() => {
              handleResponse("success", res);
            })
            .catch((bulkErr) => {
              handleResponse(bulkErr, res, 500);
            });
        }
      });
    } catch (catchErr) {
      handleResponse(catchErr, res, 500);
    }
  },
  getOptions: (req, res) => {
    try {
      SendOption.find().exec((sendOptErr, dbSendOpts) => {
        if (sendOptErr) {
          handleResponse(sendOptErr, res, 500);
        } else {
          handleResponse(dbSendOpts, res);
        }
      });
    } catch (catchErr) {
      handleResponse(catchErr, res, 500);
    }
  },
};
