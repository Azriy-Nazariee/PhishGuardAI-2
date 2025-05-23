import multer from "multer";
import { getDB } from "../db.js";
import axios from "axios";
import { simpleParser } from "mailparser";

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

      // Extract URLs from text
      function extractUrls(text) {
        const urlRegex = /(https?:\/\/[^\s"<>()]+)|(www\.[^\s"<>()]+)/gi;
        const matches = text.match(urlRegex);
        return matches ? [...new Set(matches)] : [];
      }

      // Flag suspicious keywords
      function flagKeywords(text) {
        const keywords = ["urgent", "verify", "password", "login", "click here", "account", "security"];
        const lowerText = text.toLowerCase();
        return keywords.filter(keyword => lowerText.includes(keyword));
      }

      let emailText = file.buffer.toString("utf-8");
      let sender = "unknown@example.com";
      let subject = "(No Subject)";

      // Parse .eml file using mailparser
      if (file.originalname.endsWith(".eml")) {
        const parsed = await simpleParser(file.buffer);
        sender = parsed.from?.text || sender;
        subject = parsed.subject || subject;
        emailText = parsed.text || parsed.html || emailText;
      }

      const extractedUrls = extractUrls(emailText);
      const flaggedKeywords = flagKeywords(emailText);

      // Send to ML API
      const mlResponse = await axios.post("http://localhost:8000/predict", {
        body: emailText,
      });

      const { logistic_regression, random_forest } = mlResponse.data;
      // Use random forest instead of logistic regression
      const rfConfidence = random_forest.confidence;
      const prediction = random_forest.prediction;

      // Improved risk scoring
      let riskScore = Math.round(rfConfidence * 100);
      if (extractedUrls.length > 0) riskScore += extractedUrls.length * 2;
      if (flaggedKeywords.length > 0) riskScore += flaggedKeywords.length * 3;
      if (riskScore > 100) riskScore = 100;

      let riskLevel = "Low";
      if (riskScore >= 80) riskLevel = "High";
      else if (riskScore >= 50) riskLevel = "Medium";

      const analysisResult = {
        phishingDetected: prediction === "phishing",
        confidence: rfConfidence,
        rfConfidence,
        lrConfidence: logistic_regression.confidence, // optional, for reference
        riskScore,
        riskLevel,
        suggestion:
          prediction === "phishing"
            ? "Do not click links or respond"
            : "No action needed",
        flaggedKeywords,
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
