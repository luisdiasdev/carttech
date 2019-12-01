const mongoose = require("mongoose");

const matriculaSchema = new mongoose.Schema({
  filePath: {
    type: String
  },
  mimeType: {
    type: String
  },
  atos: [
    {
      type: String
    }
  ],
  ruas: [
    {
      type: String
    }
  ],
  cpfs: [
    {
      type: String
    }
  ]
});

const Matricula = mongoose.model("Matricula", matriculaSchema);

module.exports = Matricula;
