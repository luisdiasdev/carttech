const express = require("express");
const multer = require("multer");
const Matricula = require("../models/matricula");
const { fork } = require("child_process");

const router = express.Router();

const upload = multer({ dest: "uploads/" });

function isMimePdfOrImage(mime) {
  return ["application/pdf", "image/png", "image/jpeg", "image/jpg"].includes(
    mime
  );
}

async function criarMatricula(file) {
  const matricula = new Matricula({
    filePath: file.path,
    mimeType: file.mimetype
  });
  await matricula.save();
  console.log(`Nova matrícula: ${matricula.filePath} - ${matricula.mimeType}`);
  return matricula;
}

router.post("/upload/matricula", upload.single("file"), async (req, res) => {
  const matricula = await criarMatricula(req.file);

  if (isMimePdfOrImage(req.file.mimetype)) {
    const process = fork("src/routes/process.js");
    process.send({
      fileName: req.file.path,
      matricula,
      mimeType: req.file.mimetype
    });
    process.on("message", async ({ id, atos, cpfs, ruas }) => {
      console.log(id, cpfs);
      await Matricula.findOneAndUpdate({ _id: id }, { cpfs, atos, ruas });
    });
  }

  res.json({
    message: "Upload success",
    id: matricula._id,
    filePath: matricula.filePath
  });
});

router.get("/matricula", async (req, res) => {
  const { busca } = req.params;
  const result = await Matricula.find({
    $or: [
      { cpfs: new RegExp("^" + busca + "$", "i") },
      { atos: new RegExp("^" + busca + "$", "i") },
      { ruas: new RegExp("^" + busca + "$", "i") }
    ]
  });
  return res.json(result);
});

module.exports = router;
