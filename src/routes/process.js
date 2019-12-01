const tesseract = require("node-tesseract-ocr");
const fs = require("fs");
const Matricula = require("../models/matricula");
const { execute } = require("./commandHelper");

const imageMagickOptions =
  "-quality 100 -density 350 -depth 8 -strip -background white -alpha off";

const configTesseract = {
  lang: "por",
  oem: 1,
  psm: 12
};

const regexesDocumentos = {
  cpf: /\d{3}\s?\.\s?\d{3}\s?\.\s?\d{3}\s?\-\s?\d{2}/g,
  cnpj: /\d{2}\s?\.\s?\d{3}\s?\.\s?\d{3}\s?\/\s?\d{4}\s?\-\s?\d{2}/g,
  cgc: /\b\d{2}\s?\.\s?\d{3}\s?\.\s?\d{3}\s?\-\s?\d{1}/g
};

const regexesAtos = {
  1: /(=\d+[\/\-]?[\d\w\=\-]?)/g
};

const regexesRuas = {
  1: /(RUA|Rua)[\w\s\ºÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑáàâãéèêíïóôõöúçñ-]{0,}[\.\,\;\n]+/gi
};

function concatArray(prev, current) {
  return [...prev, ...current];
}

/**
 *
 * @param {String} text
 * @param {RegExp} regex
 */
function* getAllMatches(text, regex) {
  let match;
  while ((match = regex.exec(text)) != null) {
    yield match[0];
  }
}

function getCpfsFromText(text) {
  return Object.values(regexesDocumentos)
    .map(regex =>
      Array.from(getAllMatches(text, regex)).map(s =>
        s.replace(new RegExp(" ", "g"), "")
      )
    )
    .reduce(concatArray, []);
}

function getRuasFromText(text) {
  return Object.values(regexesRuas)
    .map(regex => Array.from(getAllMatches(text, regex)))
    .reduce(concatArray, []);
}

function getAtosFromText(text) {
  return Object.values(regexesAtos)
    .map(regex => Array.from(getAllMatches(text, regex)))
    .reduce(concatArray, []);
}

async function regonizeTextFromTiff(fileName) {
  try {
    const text = await tesseract.recognize(fileName, configTesseract);
    const textAdjusted = text.toString("utf-8");
    return {
      cpfs: getCpfsFromText(textAdjusted),
      ruas: getRuasFromText(textAdjusted),
      atos: getAtosFromText(textAdjusted)
    };
  } catch (error) {
    console.log("Erro ao processar arquivo pelo tesseract", error.message);
  }
}

function getTiffFileName(fileName) {
  return `${fileName}.tiff`;
}

async function convertPdfToTiff(fileName) {
  const outputFileName = getTiffFileName(fileName);
  try {
    return execute(
      `convert ${imageMagickOptions} ${fileName} ${outputFileName}`
    );
  } catch (error) {
    return console.log("erro imagemagick: ", error);
  }
}

function isMimePdf(mime) {
  return ["application/pdf"].includes(mime);
}

process.on("message", async message => {
  try {
    const {
      fileName,
      matricula: { _id: id },
      mimeType
    } = message;

    if (isMimePdf(mimeType)) {
      await convertPdfToTiff(fileName);
    }

    const imageFileName = isMimePdf(mimeType)
      ? getTiffFileName(fileName)
      : fileName;

    const { atos, cpfs, ruas } = await regonizeTextFromTiff(imageFileName);
    process.send({
      id,
      atos,
      cpfs,
      ruas
    });
    console.log("Terminado processamento de texto para matricula: ", cpfs);
  } catch (error) {
    console.log("Erro ao processar arquivo: ", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
});
