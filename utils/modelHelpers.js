import { handleResponse } from "./general";

export function saveCMS(req, res, model) {
  try {
    const { text, enText, id } = req.body;

    if (id) {
      // update
      model.updateOne({ _id: id }, { text, enText }, (err) => {
        if (err) {
          handleResponse(err, res, 500);
        } else {
          handleResponse("success", res);
        }
      });
    } else {
      // create
      model.create({ text, enText }, (err) => {
        if (err) {
          handleResponse(err, res, 500);
        } else {
          handleResponse("success", res);
        }
      });
    }
  } catch (catchErr) {
    handleResponse(catchErr, res, 500);
  }
}

export function getCMS(req, res, model) {
  try {
    model.find().exec((err, items) => {
      if (err) {
        handleResponse(err, res, 500);
      } else {
        handleResponse(items, res);
      }
    });
  } catch (catchErr) {
    handleResponse(catchErr, res, 500);
  }
}
