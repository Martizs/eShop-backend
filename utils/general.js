export function getDateStamp() {
  const date = new Date();

  return `[${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()} T ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}]: `;
}

/* item - can be either a string or an object, 
if its a string a message response is sent, 
otherwise the whole object is sent */
// ALSO one thing to note if the error is of an object type, that means
// that a random error appeared so we will also console log it out to the
// logs and send a message to the front saying 'Something went wrong'
export function handleResponse(status, item, res) {
  if (status === 200) {
    if (typeof item === "string") {
      res.send({
        msg: item,
      });
    } else {
      res.send(item);
    }
  } else {
    if (typeof item === "string") {
      res.status(status).send({
        msg: item,
      });
    } else {
      console.log(getDateStamp(), "error: ", item);
      res.status(500).send({
        msg: "Something went wrong",
      });
    }
  }
}
