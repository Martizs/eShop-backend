import { handleResponse } from "./general";

export function saveCMS(req, res, model) {
  const { text, id } = req.body;

  if (id) {
    // update
    model.updateOne({ _id: id }, { text }, (err) => {
      if (err) {
        handleResponse(err, res, 500);
      } else {
        handleResponse("success", res);
      }
    });
  } else {
    // create
    model.create({ text }, (err) => {
      if (err) {
        handleResponse(err, res, 500);
      } else {
        handleResponse("success", res);
      }
    });
  }
}

export function getCMS(req, res, model) {
  model.find().exec((err, items) => {
    if (err) {
      handleResponse(err, res, 500);
    } else {
      handleResponse(items, res);
    }
  });
}
