import { getDB } from "../db.js";
import { ObjectId } from "mongodb";

const getReportHandler = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).send("Method Not Allowed");
    }

    const reportId = req.params.id;

    if (!ObjectId.isValid(reportId)) {
      return res.status(400).json({ error: "Invalid report ID format" });
    }

    const db = getDB();
    const reportsCollection = db.collection("Reports");

    const result = await reportsCollection.findOne({ _id: new ObjectId(reportId) });

    if (!result) {
      return res.status(404).json({ error: "Report not found" });
    }

    // Optional: Format or trim result fields
    return res.status(200).json({
      id: result._id,
      date: result.date,
      title: result.title,
      sender: result.sender,
      isPhishing: result.isPhishing,
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      suggestion: result.suggestion,
      urls: result.urls,
      flaggedKeywords: result.flaggedKeywords,
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export default getReportHandler;
