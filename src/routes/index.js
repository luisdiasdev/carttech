const express = require("express");
const multer = require("multer");
const imagickal = require("imagickal");
const router = express.Router();
const tesseract = require("node-tesseract-ocr");

const configTesseract = {
  lang: "por",
  oem: 1,
  psm: 12
};
const actionsImageMagic = {
  quality: 100,
  density: 350,
  depth: 8,
  strip: true,
  background: "white",
  alpha: "off"
};

const upload = multer({ dest: "uploads/" });

function isMimePdf(mime) {
  return mime === "application/pdf";
}

function getTiffFileName(fileName) {
  return `${fileName}.tiff`;
}

function convertPdfToTiff(fileName) {
  return imagickal
    .transform(fileName, getTiffFileName(fileName), actionsImageMagic)
    .then(() => console.log("done"))
    .catch(err => console.log("errrrr: ", err));
}

function regonizeTextFromTiff(fileName) {
  return tesseract
    .recognize(getTiffFileName(fileName), configTesseract)
    .catch(error => console.log("erro tesseract", error.message));
}

router.post("/upload/matricula", upload.single("file"), (req, res) => {
  console.log(req.file);
  if (isMimePdf(req.file.mimetype)) {
    console.log("isPdf");
    convertPdfToTiff(req.file.path).then(() =>
      regonizeTextFromTiff(req.file.path)
    );
  }

  res.json({
    message: "Upload success"
  });
});

module.exports = router;
