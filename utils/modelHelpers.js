import Order from "./../models/order";
import Size from "./../models/size";
/* utils */
import { handleResponse } from "./general";

export function removeOrder(id, res) {
  Order.findOne({ _id: id })
    .populate({
      path: "ordSizes.size",
    })
    .exec((err, order) => {
      if (err) {
        handleResponse(err, res, 500);
      } else {
        // so we update sizes by increasing their amount
        // by the removed orders selectedAmount
        const updateSizes = [];

        order.ordSizes.forEach((ordSize) => {
          updateSizes.push({
            updateOne: {
              filter: { _id: ordSize.size._id },
              update: {
                $inc: {
                  amount: ordSize.selectedAmount,
                },
                $pull: { orders: id },
              },
            },
          });
        });

        Size.bulkWrite(updateSizes)
          .then(() => {
            // and then we delete the order
            order.remove((remErr) => {
              if (remErr) {
                handleResponse(remErr, res, 500);
              } else {
                handleResponse("success", res);
              }
            });
          })
          .catch((catchErr) => {
            handleResponse(catchErr, res, 500);
          });
      }
    });
}
