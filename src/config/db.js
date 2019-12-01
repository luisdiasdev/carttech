const mongoose = require("mongoose");

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

module.exports = {
  connectDb: () => mongoose.connect("mongodb://172.17.0.4:27017/carttech")
};
