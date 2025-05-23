import multer from "multer";
import { getDB } from "../db.js";
import axios from "axios";
import emlformat from "eml-format";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const analyseFileHandler = [
  upload.single("file"),
  async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized. No user ID found." });
      }

      function extractUrls(text) {
        const urlRegex = /(https?:\/\/[^\s"<>()]+)|(www\.[^\s"<>()]+)/gi;
        const matches = text.match(urlRegex);
        return matches ? [...new Set(matches)] : []; // Deduplicate
      }

      const fileContent = file.buffer.toString("utf-8");

      let emailText = fileContent;
      let sender = "unknown@example.com";
      let subject = "(No Subject)";

      // If .eml, parse it
      if (file.originalname.endsWith(".eml")) {
        const parsedEmail = await new Promise((resolve, reject) => {
          emlformat.read(fileContent, (error, data) => {
            if (error) reject(error);
            else resolve(data);
          });
        });

        sender = parsedEmail.headers?.from || sender;
        subject = parsedEmail.headers?.subject || subject;
        emailText =
          parsedEmail.text || parsedEmail.html || fileContent;
      }
      
      const extractedUrls = extractUrls(emailText);

      // Send body to ML API
      const mlResponse = await axios.post("http://localhost:8000/predict", {
        body: emailText,
      });

      const { logistic_regression, random_forest } = mlResponse.data;

      const analysisResult = {
        phishingDetected: logistic_regression.prediction === "phishing",
        confidence: logistic_regression.confidence,
        rfConfidence: random_forest.confidence,
        lrConfidence: logistic_regression.confidence,
        riskScore: logistic_regression.prediction === "phishing" ? 80 : 10,
        riskLevel: logistic_regression.prediction === "phishing" ? "High" : "Low",
        suggestion:
          logistic_regression.prediction === "phishing"
            ? "Do not click links or respond"
            : "No action needed",
        flaggedKeywords: [], // Placeholder for enhancement
        urls: extractedUrls,
      };

      const db = getDB();
      const reportsCollection = db.collection("Reports");

      const reportDoc = {
        userId,
        date: new Date(),
        title: subject,
        sender,
        isPhishing: analysisResult.phishingDetected,
        riskScore: analysisResult.riskScore,
        riskLevel: analysisResult.riskLevel,
        suggestion: analysisResult.suggestion,
        urls: analysisResult.urls,
        flaggedKeywords: analysisResult.flaggedKeywords,
        modelResults: {
          logistic_regression,
          random_forest,
        },
      };

      const insertResult = await reportsCollection.insertOne(reportDoc);

      return res.status(200).json({
        message: "File analyzed and report saved successfully",
        reportId: insertResult.insertedId,
        analysisResult,
      });
    } catch (error) {
      console.error("Error analyzing file:", error.message || error);
      return res.status(500).json({ error: "Server error during analysis" });
    }
  },
];

export default analyseFileHandler;
