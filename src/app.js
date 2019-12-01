const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const errorHandler = require("errorhandler");
const indexRouter = require("./routes/index");
const { connectDb } = require("./config/db");

connectDb()
  .then(() => console.log("Conectado ao MongoDB"))
  .catch(error => console.log("Falha ao conectar no MongoDB: ", error));

const app = express();

app.use(logger("dev"));
app.use(errorHandler());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/", indexRouter);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
