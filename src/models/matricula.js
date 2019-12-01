const mongoose = require("mongoose");

const matriculaSchema = new mongoose.Schema(
  {
    filePath: {
      type: String
    },
    mimeType: {
      type: String
    },
    matricula: {
      type: String,
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
  },
  {
    timestamps: true
  }
);

const Matricula = mongoose.model("Matricula", matriculaSchema);

module.exports = Matricula;
