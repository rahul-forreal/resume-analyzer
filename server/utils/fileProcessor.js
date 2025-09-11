const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const fs = require("fs-extra");

async function extractTextFromFile(filePath, mimeType) {
  try {
    switch (mimeType) {
      case "application/pdf":
        return await extractTextFromPDF(filePath);

      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return await extractTextFromDOCX(filePath);

      case "application/msword":
        throw new Error(
          "Legacy .doc files are not supported. Please use .docx format."
        );

      default:
        throw new Error("Unsupported file type");
    }
  } catch (error) {
    console.error("Text extraction error:", error);
    throw error;
  }
}

async function extractTextFromPDF(filePath) {
  const dataBuffer = await fs.readFile(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

async function extractTextFromDOCX(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

module.exports = {
  extractTextFromFile,
};
