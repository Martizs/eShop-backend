import Product from "./../models/product";
import Size from "./../models/size";
/* utils */
import fs from "fs";
import path from "path";
import { handleResponse } from "../utils/general";
import filter from "lodash/filter";
import find from "lodash/find";
import { getDateStamp } from "./../utils/general";
/* consts */
import { staticUrl, staticPath } from "./../consts/general";

export const ProductController = {
  updateCreate: (req, res) => {
    try {
      const {
        id,
        title,
        enTitle,
        price,
        discPrice,
        desc,
        enDesc,
        category,
        sizes,
        imgData,
      } = req.body;

      if (id) {
        Product.findOne({ _id: id })
          .populate("sizes")
          .exec((err, product) => {
            if (err) {
              handleResponse(err, res, 500);
            } else {
              const newSizesQ = [];
              const updateSizes = [];

              const parsedSizes = JSON.parse(sizes);
              parsedSizes.forEach((size) => {
                // adding new sizes
                if (size.new) {
                  newSizesQ.push({
                    insertOne: {
                      document: {
                        name: size.name,
                        amount: size.amount,
                        product: product._id,
                      },
                    },
                  });
                } else {
                  // updating sizes
                  product.sizes.forEach((dbSize) => {
                    if (dbSize._id == size._id) {
                      updateSizes.push({
                        updateOne: {
                          filter: { _id: dbSize._id },
                          update: {
                            $set: {
                              name: size.name,
                              amount: size.amount,
                            },
                          },
                        },
                      });
                    }
                  });
                }
              });

              // deleting sizes
              const delSizes = [];
              product.sizes.forEach((dbSize) => {
                const delSize = find(
                  parsedSizes,
                  (size) => dbSize._id == size._id
                );
                if (!delSize) {
                  delSizes.push({
                    deleteOne: {
                      filter: {
                        _id: dbSize._id,
                      },
                    },
                  });
                }
              });

              // and here we update all of them sizes accordingly
              Size.bulkWrite([...newSizesQ, ...updateSizes, ...delSizes])
                .then((sizeWriteRes) => {
                  // next we handle the image data similarly
                  const updtImgData = [];

                  const parsImages = JSON.parse(imgData);

                  parsImages.forEach((img) => {
                    // so we find the uploaded file equivalent
                    // by the filename, as thats the only metadata tag
                    // that comes with the file and that we try to keep unique
                    // on the frontend
                    const uploadedImg = filter(req.files, [
                      "originalname",
                      img.filename,
                    ]);

                    if (uploadedImg.length) {
                      const imgName = uploadedImg[0].filename;
                      const imgUrl = staticUrl + imgName;

                      updtImgData.push({
                        ...img,
                        filename: imgName,
                        imgUrl,
                      });
                    } else {
                      // and everything else means that the same img data
                      // has been passed in and if it has changes to the
                      // primary or secondary fields we'll just update them as is
                      updtImgData.push(img);
                    }
                  });

                  // and here we check if we need to delete any images
                  // and we need to delete only the files, as the newly
                  // passed in image array will always be updating/replacing
                  // the old
                  // also we use normal for loop cause .forEach
                  // dont wait
                  for (let i = 0; i < product.imgData.length; i++) {
                    const dbImg = product.imgData[i];
                    const delImg = find(parsImages, ["key", dbImg.key]);
                    if (!delImg) {
                      try {
                        fs.unlinkSync(path.join(staticPath, dbImg.filename));
                      } catch {
                        console.log(
                          getDateStamp(),
                          "Error unlinking file, product.imgData",
                          product.imgData,
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

                  // AAAAND finally we save the product

                  product.title = title;
                  product.enTitle = enTitle;
                  product.price = price;
                  product.discPrice = discPrice === "null" ? null : discPrice;
                  product.desc = desc === "null" ? null : desc;
                  product.enDesc = enDesc === "null" ? null : enDesc;
                  product.category = category;

                  const newProdSizes = [];

                  // pushing in new sizes if there were any
                  Object.values(sizeWriteRes.insertedIds).forEach((idItem) => {
                    newProdSizes.push(idItem._id);
                  });

                  updateSizes.forEach((updtSize) => {
                    newProdSizes.push(updtSize.updateOne.filter._id);
                  });

                  product.sizes = newProdSizes;

                  product.imgData = updtImgData;

                  product.save((updtErr) => {
                    if (updtErr) {
                      handleResponse(updtErr, res, 500);
                    } else {
                      handleResponse("success", res);
                    }
                  });
                })
                .catch((err) => {
                  handleResponse(err, res, 500);
                });
            }
          });
      } else {
        const prodData = {
          title,
          enTitle,
          price,
          discPrice,
          desc,
          enDesc,
          category,
          sizes: [],
          imgData: [],
        };
        const product = new Product(prodData);
        // first we create them sizes
        const parsedSizes = JSON.parse(sizes);
        Size.bulkWrite(
          parsedSizes.map((size) => ({
            insertOne: {
              document: {
                name: size.name,
                amount: size.amount,
                product: product._id,
              },
            },
          }))
        )
          .then((result) => {
            try {
              // then we save the image data
              const parsImages = JSON.parse(imgData);

              const newImgData = parsImages.map((img) => {
                // so we find the uploaded file equivalent
                // by the filename, as thats the only metadata tag
                // that comes with the file and that we try to keep unique
                // on the frontend
                const imgName = filter(req.files, [
                  "originalname",
                  img.filename,
                ])[0].filename;

                const imgUrl = staticUrl + imgName;

                return {
                  ...img,
                  filename: imgName,
                  imgUrl,
                };
              });

              const sizeIds = [];
              Object.values(result.insertedIds).forEach((idItem) => {
                sizeIds.push(idItem._id);
              });

              product.sizes = sizeIds;
              product.imgData = newImgData;

              product.save((creatErr) => {
                if (creatErr) {
                  handleResponse(creatErr, res, 500);
                } else {
                  handleResponse("success", res);
                }
              });
            } catch (tryCatchErr) {
              handleResponse("Something went wrong" + tryCatchErr, res, 500);
            }
          })
          .catch((err) => {
            handleResponse(err, res, 500);
          });
      }
    } catch (catchErr) {
      handleResponse(catchErr, res, 500);
    }
  },
  delProd: (req, res) => {
    try {
      const { id } = req.body;

      Product.findOne({ _id: id })
        .populate("sizes")
        .exec((err, product) => {
          if (err) {
            handleResponse(err, res, 500);
          } else {
            Size.deleteMany({ product: product.id }, (sizeErr) => {
              if (sizeErr) {
                handleResponse(sizeErr, res, 500);
              } else {
                // and after deleting sizes we delete the img files
                for (let i = 0; i < product.imgData.length; i++) {
                  const img = product.imgData[i];
                  fs.unlinkSync(path.join(staticPath, img.filename));
                }
                // and finally we remove the product itself
                product.remove((prodErr) => {
                  if (prodErr) {
                    handleResponse(prodErr, res, 500);
                  } else {
                    handleResponse("success", res);
                  }
                });
              }
            });
          }
        });
    } catch (catchErr) {
      handleResponse(catchErr, res, 500);
    }
  },
  getProducts: (req, res) => {
    try {
      const { page, size, cat, rand, noId } = req.query;

      const pageNumb = parseInt(page, 10);
      const sizeNumb = parseInt(size, 10);

      const query = {};

      if (cat && cat !== "all") {
        query.category = cat;
      }

      if (rand) {
        if (noId && noId !== "new") {
          query._id = { $ne: noId };
        }

        Product.find(query)
          .select("title enTitle price discPrice imgData sizes")
          .populate("sizes")
          .exec((err, products) => {
            if (err) {
              handleResponse(err, res, 500);
            } else {
              // VERY IMPORTANT, we only do the randomizing for
              // when there's at least 9 products, so as the randomizer would
              // not lag the response

              if (products.length > 8) {
                // and here we randomize
                const max = products.length;

                const randIndexes = [];

                for (let i = 0; i < size; i++) {
                  const randInd = Math.floor(Math.random() * Math.floor(max));
                  if (randIndexes.indexOf(randInd) === -1) {
                    randIndexes.push(randInd);
                  } else {
                    i--;
                  }
                }

                const randProds = [];

                randIndexes.forEach((randInd) => {
                  randProds.push(products[randInd]);
                });

                // here the count shouldnt matter as
                // it only applies for the suggested items
                // which dont have pagination
                handleResponse(
                  {
                    count: size,
                    products: randProds,
                  },
                  res
                );
              } else {
                // here the count shouldnt matter as
                // it only applies for the suggested items
                // which dont have pagination
                handleResponse(
                  {
                    count: size,
                    products,
                  },
                  res
                );
              }
            }
          });
      } else {
        // so first we do the document count
        // based on the querried documents
        Product.countDocuments(query).exec((countErr, count) => {
          if (countErr) {
            handleResponse(countErr, res, 500);
          } else {
            // and then we remake the actual query with pagination
            Product.find(query)
              .select("title enTitle price discPrice imgData sizes")
              .populate("sizes")
              .limit(sizeNumb)
              .skip((pageNumb - 1) * sizeNumb)
              .sort({
                createdAt: "desc",
              })
              .exec((err, products) => {
                if (err) {
                  handleResponse(err, res, 500);
                } else {
                  handleResponse(
                    {
                      count,
                      products,
                    },
                    res
                  );
                }
              });
          }
        });
      }
    } catch (catchErr) {
      handleResponse(catchErr, res, 500);
    }
  },
  getProduct: (req, res) => {
    try {
      const { id } = req.query;

      Product.findOne({ _id: id })
        .populate("sizes")
        .exec((err, product) => {
          if (err) {
            handleResponse(err, res, 500);
          } else {
            handleResponse(product, res);
          }
        });
    } catch (catchErr) {
      handleResponse(catchErr, res, 500);
    }
  },
};
