import Product from "./../models/product";
import Size from "./../models/size";
import SendOption from "./../models/sendOption";
/* utils */
import findIndex from "lodash/findIndex";
import { getDateStamp, handleResponse } from "../utils/general";

export const OrderController = {
  validateOrder: async (req, res) => {
    try {
      // so here we'll do validations if the prices have not been
      // tampered in any hacky way or if amounts of items have not
      // been tampered in any hacky way
      const { cartItems, sendOption } = req.body;

      const ordProdSizes = [];

      // checking if item prices are legit
      // const parsedItems = JSON.parse(cartItems);
      for (let i = 0; i < cartItems.length; i++) {
        const cartItem = cartItems[i];
        try {
          const product = await Product.findOne({ _id: cartItem.prodId });

          const cartItPrice = parseFloat(cartItem.price, 10);
          if (!cartItPrice) {
            return handleResponse("Invalid price", res, 405);
          }

          if (
            product.price !== cartItPrice &&
            product.discPrice !== cartItPrice
          ) {
            return handleResponse(" product Difference in prices", res, 405);
          }
        } catch (prodErr) {
          return handleResponse(prodErr, res, 500);
        }

        // forming validation array for ordered amount
        const ordSizeInd = findIndex(
          ordProdSizes,
          (ordSize) =>
            ordSize.sizeId === cartItem.selectedSize._id &&
            ordSize.prodId === cartItem.selectedSize.product
        );

        if (ordSizeInd === -1) {
          ordProdSizes.push({
            sizeId: cartItem.selectedSize._id,
            prodId: cartItem.selectedSize.product,
            selectedAmount: parseInt(cartItem.selectedAmount, 10),
          });
        } else {
          ordProdSizes[ordSizeInd].selectedAmount += parseInt(
            cartItem.selectedAmount,
            10
          );
        }
      }

      // here we cross check ordered size amount vs actual size amount in db
      for (let i = 0; i < ordProdSizes.length; i++) {
        const ordProdSize = ordProdSizes[i];
        try {
          const dbSize = await Size.findOne({ _id: ordProdSize.sizeId });

          if (dbSize.amount < ordProdSize.selectedAmount) {
            return handleResponse("Difference in size amounts", res, 405);
          }
        } catch (prodErr) {
          return handleResponse(prodErr, res, 500);
        }
      }

      // here we check if the send option price has not been
      // tampered with
      // const parsedOptions = JSON.parse(sendOption);

      try {
        const option = await SendOption.findOne({ _id: sendOption._id });

        if (option.price !== parseFloat(sendOption.price, 10)) {
          return handleResponse("Difference in prices", res, 405);
        }
      } catch (err) {
        return handleResponse(err, res, 500);
      }

      handleResponse("all is valid", res);
    } catch (catchErr) {
      handleResponse(catchErr, res, 500);
    }
  },

  orderSucces: (req, res) => {
    try {
      const { cartItems } = req.body;

      const updtSizes = [];

      const sizeIds = [];

      cartItems.forEach((cartIt) => {
        sizeIds.push(cartIt.selectedSize._id);

        updtSizes.push({
          updateOne: {
            filter: { _id: cartIt.selectedSize._id },
            update: {
              $inc: {
                amount: -parseInt(cartIt.selectedAmount, 10),
              },
            },
          },
        });
      });

      console.log(getDateStamp(), "Order made with sizeIds", sizeIds);

      Size.bulkWrite(updtSizes)
        .then(() => {
          handleResponse("success", res);
        })
        .catch((bulkErr) => {
          handleResponse(bulkErr, res, 500);
        });
    } catch (catchErr) {
      handleResponse(catchErr, res, 500);
    }
  },
};
