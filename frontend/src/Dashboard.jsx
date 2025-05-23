import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const { id } = useParams();
  const reportId = id;
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    const fetchAnalysis = async () => {
      try {
        const response = await axios.get(`/api/report/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setResult(response.data);
      } catch (err) {
        console.error(err);
        setError("We couldn't find any analysis result with the provided ID.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-center p-8">
        <div className="text-xl font-semibold">Loading analysis...</div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-center p-8">
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Analysis Not Found</h1>
          <p className="text-gray-700 mb-6">
            {error} (ID: <strong>{id}</strong>)
          </p>
          <button
            onClick={() => navigate("/history")}
            className="bg-[#d3941a] text-white px-6 py-3 rounded-lg hover:bg-[#e7a92f] transition"
          >
            Back to History
          </button>
        </div>
      </div>
    );
  }

  // Use fallback empty arrays to avoid undefined errors
  const urls = result.urls || [];
  const flaggedKeywords = result.flaggedKeywords || [];

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#333652] py-10 px-4 md:px-6 pb-6">
      {/* Analysis Completed Section */}
      <div className="flex flex-col items-center bg-white p-6 shadow-md rounded-3xl w-full max-w-4xl mb-6">
        <img
          src="/done.png"
          alt="Analysis Completed Icon"
          className="w-20 md:w-30 h-auto mb-4"
        />
        <h2 className="text-xl md:text-2xl font-bold text-[#333652]">
          Analysis Completed!
        </h2>
      </div>

      {/* Analysis Details */}
      <div className="bg-white p-6 shadow-md rounded-3xl w-full max-w-4xl mb-6 text-center">
        <p className="text-md md:text-lg font-semibold">
          Analysis ID: <span className="font-normal">{result.id}</span>
        </p>
        <p className="text-md md:text-lg font-semibold">
          Date Analysed: <span className="font-normal">{result.date}</span>
        </p>
        <p className="text-md md:text-lg font-semibold">
          Email / Dataset Title: <span className="font-normal">{result.title}</span>
        </p>
        <p className="text-md md:text-lg font-semibold">
          Sender: <span className="font-normal">{result.sender}</span>
        </p>
      </div>

      {/* Analysis Result */}
      <div
        className={`flex flex-col items-center w-full max-w-4xl p-6 shadow-md rounded-3xl ${
          result.isPhishing ? "bg-red-100" : "bg-green-100"
        }`}
      >
        <h3 className="text-lg md:text-xl font-bold mb-4">
          {result.isPhishing ? "⚠️ Phishing Email Detected" : "✅ Legitimate Email"}
        </h3>

        <img
          src={result.isPhishing ? "/phishing.png" : "/legitimate.png"}
          alt={result.isPhishing ? "Phishing Email" : "Legitimate Email"}
          className="w-20 md:w-30 h-auto mb-4"
        />

        {/* Risk Score Bar */}
        <h3 className="text-lg md:text-xl font-bold mb-2">Risk Score</h3>
        <div className="bg-gray-300 w-full rounded-full h-6 mb-2">
          <div
            className={`h-6 rounded-full text-center text-white text-sm leading-6 ${
              result.isPhishing ? "bg-red-600" : "bg-green-500"
            }`}
            style={{ width: `${result.riskScore}%` }}
          ></div>
        </div>

        {/* Risk Score Percentage & Level */}
        <p className="text-md md:text-lg font-semibold mt-1">
          {result.riskScore}% - {result.riskLevel}
        </p>

        {/* Suggestion */}
        <p className="text-md md:text-lg text-center mt-4">{result.suggestion}</p>

        {/* Suspicious Features (Phishing Only) */}
        {result.isPhishing && (
          <div className="w-full mt-4 p-4 bg-red-200 rounded-lg text-center">
            <h3 className="text-lg md:text-xl font-bold mb-2 text-red-700">
              🚨 Suspicious Features Detected
            </h3>

            {urls.length > 0 ? (
              urls.length === 1 ? (
                <p className="text-md md:text-lg break-words whitespace-normal overflow-x-auto">
                  <b>Suspicious URLs:</b>{" "}
                  <span
                    className="text-red-600 ml-2 break-words whitespace-normal"
                    style={{ wordBreak: "break-all" }}
                    title={urls[0]}
                  >
                    {urls[0]}
                  </span>
                </p>
              ) : (
                <div className="text-md md:text-lg text-left inline-block break-words whitespace-normal overflow-x-auto w-full max-w-full">
                  <b>Suspicious URLs:</b>
                  <ul className="list-disc list-inside mt-2">
                    {urls.map((url, index) => (
                      <li key={index}>
                        <span
                          className="text-red-600 break-words whitespace-normal"
                          style={{ wordBreak: "break-all" }}
                          title={url}
                        >
                          {url}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            ) : (
              <p className="text-md md:text-lg text-green-700">
                No suspicious URLs detected.
              </p>
            )}

            {flaggedKeywords.length > 0 ? (
              <p className="text-md md:text-lg mt-2">
                <b>Flagged Keywords:</b> {flaggedKeywords.join(", ")}
              </p>
            ) : (
              <p className="text-md md:text-lg text-green-700 mt-2">
                No flagged keywords detected.
              </p>
            )}
          </div>
        )}

        {/* Verified Features (Legitimate Only) */}
        {!result.isPhishing && (
          <div className="w-full mt-4 p-4 bg-green-200 rounded-lg text-center">
            <h3 className="text-lg md:text-xl font-bold mb-2 text-green-700">
              ✅ Verified Features
            </h3>

            {urls.length > 0 ? (
              urls.length === 1 ? (
                <p className="text-md md:text-lg break-words whitespace-normal overflow-x-auto">
                  <b>Verified URLs:</b>{" "}
                  <span
                    className="text-blue-500 ml-2 break-words whitespace-normal"
                    style={{ wordBreak: "break-all" }}
                    title={urls[0]}
                  >
                    {urls[0]}
                  </span>
                </p>
              ) : (
                <div className="text-md md:text-lg text-left inline-block break-words whitespace-normal overflow-x-auto w-full max-w-full">
                  <b>Verified URLs:</b>
                  <ul className="list-disc list-inside mt-2">
                    {urls.map((url, index) => (
                      <li key={index}>
                        <span
                          className="text-blue-500 break-words whitespace-normal"
                          style={{ wordBreak: "break-all" }}
                          title={url}
                        >
                          {url}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            ) : (
              <p className="text-md md:text-lg text-green-700">
                No verified URLs detected.
              </p>
            )}

            {flaggedKeywords.length > 0 ? (
              <p className="text-md md:text-lg mt-2">
                <b>Flagged Keywords:</b> {flaggedKeywords.join(", ")}
              </p>
            ) : (
              <p className="text-md md:text-lg text-green-700 mt-2">
                No flagged keywords detected.
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4 mt-6">
          <button
            onClick={() => navigate(`/report/${reportId}`, { state: { result } })}
            className="flex items-center justify-center gap-2 px-6 py-3 text-white text-md md:text-lg font-semibold rounded-lg bg-[#0f61a5] hover:bg-[#d3941a] transition-colors w-full md:w-auto"
          >
            <img src="/report.png" alt="Report Icon" className="w-5 md:w-6 h-5 md:h-6" />
            <span>Generate Report</span>
          </button>

          <button
            onClick={() => navigate("/feedback", { state: { dashboardId: result.id } })}
            className="flex items-center justify-center gap-2 px-6 py-3 text-white text-md md:text-lg font-semibold rounded-lg bg-[#0f61a5] hover:bg-[#d3941a] transition-colors w-full md:w-auto"
          >
            <img src="/feedback.png" alt="Feedback Icon" className="w-5 md:w-6 h-5 md:h-6" />
            <span>Submit Feedback</span>
          </button>
        </div>
      </div>

      {/* Back to Homepage Button */}
      <button
        onClick={() => navigate("/home")}
        className="mt-10 px-6 py-3 text-white text-lg font-semibold rounded-lg bg-[#d3941a] hover:bg-[#e7a92f] transition-colors"
      >
        Back to Homepage
      </button>
    </div>
  );
}

export default Dashboard;
