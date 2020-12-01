import stripe from "stripe";
import Product from "./../models/product";
import Size from "./../models/size";
import SendOption from "./../models/sendOption";
import Order from "./../models/order";
import NewsLetter from "./../models/newsLetter";
/* utils */
import findIndex from "lodash/findIndex";
import { handleResponse, getDateStamp, sendEmail } from "../utils/general";
import { removeOrder } from "./../utils/modelHelpers";

export const OrderController = {
  validateOrder: async (req, res) => {
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
  },
  addOrder: (req, res) => {
    // NOTE: this only gets called when the data is validated
    const { cartItems, orderData } = req.body;

    const adjOrderData = orderData;

    const ordSizes = [];

    cartItems.forEach((cartIt) => {
      const ordSizeInd = findIndex(ordSizes, ["size", cartIt.selectedSize._id]);

      if (ordSizeInd === -1) {
        ordSizes.push({
          selectedAmount: parseInt(cartIt.selectedAmount, 10),
          size: cartIt.selectedSize._id,
        });
      } else {
        ordSizes[ordSizeInd].selectedAmount += parseInt(
          cartIt.selectedAmount,
          10
        );
      }
    });

    adjOrderData.ordSizes = ordSizes;

    const payedCode =
      Math.random().toString(36).substr(2, 20) +
      Math.random().toString(36).substr(2, 20) +
      Math.random().toString(36).substr(2, 20) +
      Math.random().toString(36).substr(2, 20);

    adjOrderData.payedCode = payedCode;

    Order.create(adjOrderData, (err, order) => {
      if (err) {
        handleResponse(err, res, 500);
      } else {
        // and here we update size relationships with the newly
        // created order AND also update the amount of items remaining
        // for that size

        const updateSizes = [];

        ordSizes.forEach((ordSize) => {
          updateSizes.push({
            updateOne: {
              filter: { _id: ordSize.size },
              update: {
                $inc: {
                  amount: -ordSize.selectedAmount,
                },
                $push: {
                  orders: order._id,
                },
              },
            },
          });
        });

        Size.bulkWrite(updateSizes)
          .then(async () => {
            try {
              // And here we generate the payment session
              const myStripe = stripe(process.env.STRIPE_KEY);

              const session = await myStripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                  {
                    price_data: {
                      currency: "eur",
                      product_data: {
                        name: `Dzhiunglių užsakymas nr.: ${order.orderCode}`,
                      },
                      // NOTE: amount is in cents, and minimum amount is 50 cent
                      // thats why we multiply the float value by 100
                      unit_amount: parseFloat(order.payedAmount, 10) * 100,
                    },
                    quantity: 1,
                  },
                ],
                mode: "payment",
                success_url: `${process.env.FRONTEND_URL}/uzsakyta/${order.payedCode}`,
                cancel_url: `${process.env.FRONTEND_URL}/atsaukta/${order.payedCode}`,
              });

              if (!session) {
                console.log(
                  getDateStamp(),
                  "Stripe session create didnt work?",
                  session
                );
                handleResponse("Session error", res, 500);
              } else {
                // and finally we handle the user getting added to newsletter
                if (adjOrderData.newsLetter) {
                  NewsLetter.create(
                    { email: adjOrderData.email },
                    (newsErr) => {
                      if (newsErr) {
                        handleResponse(newsErr, res, 500);
                      } else {
                        handleResponse({ sessionId: session.id }, res);
                      }
                    }
                  );
                } else {
                  handleResponse({ sessionId: session.id }, res);
                }
              }
            } catch (rejError) {
              handleResponse(rejError, res, 500);
            }
          })
          .catch((sizeUpdtErr) => {
            handleResponse(sizeUpdtErr, res, 500);
          });
      }
    });
  },
  getOrders: (req, res) => {
    Order.find()
      .populate({
        path: "ordSizes.size",
        populate: { path: "product" },
      })
      .exec((err, orders) => {
        if (err) {
          handleResponse(err, res, 500);
        } else {
          handleResponse(orders, res);
        }
      });
  },
  confirmOrder: (req, res) => {
    const { id } = req.body;

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
  },
  declineOrder: (req, res) => {
    const { id } = req.body;
    removeOrder(id, res);
  },
  orderPayed: (req, res) => {
    const { payedCode } = req.body;

    if (payedCode) {
      Order.findOne({ payedCode }).exec((orderErr, order) => {
        if (orderErr) {
          handleResponse(orderErr, res, 500);
        } else {
          if (order && order.paymentPending) {
            order.paymentPending = false;
            order.payedCode = null;
            order.save((saveErr) => {
              if (saveErr) {
                handleResponse(saveErr, res, 500);
              } else {
                sendEmail(order.email, order.orderCode);
                handleResponse({ orderCode: order.orderCode }, res);
              }
            });
          } else {
            handleResponse("Payment Not pending", res, 405);
          }
        }
      });
    } else {
      handleResponse("Illegal", res, 405);
    }
  },
  cancelOrder: (req, res) => {
    const { payedCode } = req.body;

    if (payedCode) {
      Order.findOne({ payedCode }).exec((orderErr, order) => {
        if (order && order.paymentPending) {
          if (orderErr) {
            handleResponse(orderErr, res, 500);
          } else {
            removeOrder(order._id, res);
          }
        } else {
          handleResponse("Payment Not pending", res, 405);
        }
      });
    } else {
      handleResponse("Illegal", res, 405);
    }
  },
};
