const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { analyzeResume, rankResumes } = require("./utils/resumeAnalyzer");
const { extractTextFromFile } = require("./utils/fileProcessor");

const app = express();
app.set("trust proxy", 1);

const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use("/api/", limiter);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "uploads");
    fs.ensureDirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedExts = [".pdf", ".docx"];
    const ext = path.extname(file.originalname || "").toLowerCase();

    if (!allowedTypes.includes(file.mimetype) || !allowedExts.includes(ext)) {
      return cb(new Error("Unsupported file type"), false);
    }
    cb(null, true);
  },
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Resume Analyzer API is running" });
});

app.post("/api/analyze-resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const extractedText = await extractTextFromFile(req.file.path, req.file.mimetype);
    const jobDescription = req.body?.jobDescription || "";

    if (!extractedText || extractedText.length < 50) {
      await fs.remove(req.file.path);
      return res.status(400).json({ error: "Unable to extract sufficient text from the file" });
    }

    const analysis = await analyzeResume(extractedText, req.file.originalname, jobDescription);
    await fs.remove(req.file.path);

    res.json({
      success: true,
      mode: "single",
      analysis,
      metadata: {
        filename: req.file.originalname,
        fileSize: req.file.size,
        uploadTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    if (req.file?.path) await fs.remove(req.file.path).catch(() => {});
    console.error("Analysis error:", error);
    res.status(500).json({ error: "Analysis failed", message: error.message });
  }
});

app.post("/api/rank-resumes", upload.array("resumes", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: "Upload at least 2 resumes for ranking" });
    }

    const jobDescription = req.body?.jobDescription || "";
    const candidates = [];

    for (const file of req.files) {
      const text = await extractTextFromFile(file.path, file.mimetype);
      if (text && text.length >= 50) {
        candidates.push({ filename: file.originalname, fileSize: file.size, text });
      }
    }

    await Promise.all((req.files || []).map((file) => fs.remove(file.path).catch(() => {})));

    if (!candidates.length) {
      return res.status(400).json({ error: "No readable resumes found." });
    }

    const result = await rankResumes(candidates, jobDescription);

    res.json({
      success: true,
      mode: "ranking",
      ...result,
      metadata: {
        resumeCount: candidates.length,
        uploadTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    await Promise.all((req.files || []).map((file) => fs.remove(file.path).catch(() => {})));
    console.error("Ranking error:", error);
    res.status(500).json({ error: "Ranking failed", message: error.message });
  }
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") return res.status(400).json({ error: "File too large. Maximum size is 5MB." });
  }
  if (error?.message === "Unsupported file type") {
    return res.status(400).json({ error: "Unsupported file type. Upload a .pdf or .docx file." });
  }
  console.error("Server error:", error);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Resume Analyzer API running on port ${PORT}`);
});

const clientBuildPath = path.join(__dirname, "..", "client", "build");
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get(/^\/(?!api\/).*/, (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}
