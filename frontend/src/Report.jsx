import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { generatePDF } from "./utils/generatePDF";

function Report() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const [isReady, setIsReady] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPDFModal, setShowPDFModal] = useState(false);
    const [pdfMessage, setPdfMessage] = useState("Generating PDF...");

    useEffect(() => {
        const stateResult = location.state?.result;

        if (stateResult) {
            setReportData(stateResult);
            setLoading(false);
            setIsReady(true);
        } else if (id) {
            axios.get(`/api/report/${id}`)
                .then((res) => {
                    setReportData(res.data);
                    setIsReady(true);
                })
                .catch((err) => {
                    console.error("Error fetching report:", err);
                    setError("Failed to load report.");
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setError("No report data provided.");
            setLoading(false);
        }
    }, [id, location.state]);

    const result = reportData || {};

    const handleGeneratePDF = async () => {
        try {
            setShowPDFModal(true);
            setPdfMessage("Generating PDF...");
            await generatePDF(result); // assuming generatePDF returns a Promise
            setPdfMessage("✅ PDF is generated and will be successfully downloaded to your device!");
        } catch (e) {
            setPdfMessage("❌ Failed to generate PDF.");
        } finally {
            setTimeout(() => setShowPDFModal(false), 2500);
        }
    };

    if (loading) {
        return <div className="text-white p-8 text-center">Loading report...</div>;
    }

    if (error) {
        return <div className="text-red-500 p-8 text-center">{error}</div>;
    }

    return (
        <div className="min-h-screen flex flex-col items-center bg-[#333652] px-4 md:px-6 py-10">
            <div id="report-content" className="bg-white p-6 sm:p-8 shadow-lg rounded-lg w-full max-w-4xl">
                <h1 className="text-2xl sm:text-3xl font-bold text-center text-[#333652] mb-4 sm:mb-6">
                    PhishGuard AI <br /> Email Analysis Report
                </h1>

                <div className="mb-4 sm:mb-6 text-sm sm:text-lg">
                    <p><b>Date Analysed:</b> {new Date(result.date).toLocaleString()}</p>
                    <p><b>Email Title:</b> {result.title}</p>
                    <p><b>Sender:</b> {result.sender}</p>
                </div>

                <h2 className="text-lg sm:text-2xl font-semibold mb-2">Analysis Result</h2>
                <div className="bg-gray-100 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
                    <p className="text-sm sm:text-lg">
                        <b>Prediction:</b>
                        <span className={`ml-2 font-bold ${result.isPhishing ? "text-red-500" : "text-green-500"}`}>
                            {result.isPhishing ? "Phishing Email" : "Legitimate Email"}
                        </span>
                    </p>
                    <p className="text-sm sm:text-lg"><b>Risk Score:</b> {result.riskScore}% ({result.riskLevel})</p>
                    <p className="text-sm sm:text-lg"><b>Recommendation:</b> {result.suggestion}</p>
                </div>

                {result.isPhishing ? (
                    <div>
                        <h2 className="text-lg sm:text-2xl font-semibold mb-2 text-red-600">🚨 Suspicious Features Detected</h2>
                        <div className="bg-red-100 p-3 sm:p-4 rounded-lg">
                            {result.urls?.length > 0 && (
                                <p className="text-sm sm:text-lg break-words whitespace-normal overflow-x-auto">
                                    <b>Suspicious URLs:</b>
                                    {result.urls.map((url, index) => (
                                        <span
                                            key={index}
                                            className="text-red-500 ml-2 break-words whitespace-normal"
                                            style={{ wordBreak: "break-all" }}
                                        >
                                            {url}
                                        </span>
                                    ))}
                                </p>
                            )}
                            <p className="text-sm sm:text-lg">
                                <b>Flagged Keywords:</b> {result.flaggedKeywords?.length > 0 ? result.flaggedKeywords.join(", ") : "None"}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-lg sm:text-2xl font-semibold mb-2 text-green-600">✅ Verified Features</h2>
                        <div className="bg-green-100 p-3 sm:p-4 rounded-lg">
                            {result.urls?.length > 0 && (
                                <p className="text-sm sm:text-lg">
                                    <b>Verified URLs:</b>
                                    {result.urls.map((url, index) => (
                                        <span key={index} className="text-blue-500 ml-2">{url}</span>
                                    ))}
                                </p>
                            )}
                            <p className="text-sm sm:text-lg">
                                <b>Flagged Keywords:</b> {result.flaggedKeywords?.length > 0 ? result.flaggedKeywords.join(", ") : "None"}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-4 mb-8">
                <button
                    onClick={handleGeneratePDF}
                    className="px-4 sm:px-6 py-3 text-white text-sm sm:text-lg font-semibold rounded-lg bg-[#0f61a5] hover:bg-[#d3941a] transition-colors min-w-[140px] max-w-[200px]"
                    disabled={!isReady}
                >
                    Download PDF
                </button>

                <button
                    onClick={() => navigate(`/dashboard/${result.id || ""}`)}
                    className="px-4 sm:px-6 py-3 text-white text-sm sm:text-lg font-semibold rounded-lg bg-[#0f61a5] hover:bg-[#d3941a] transition-colors min-w-[140px] max-w-[200px]"
                >
                    Back to Dashboard
                </button>
            </div>

            {showPDFModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-md z-50">
                    <div className="bg-white p-6 rounded-lg text-center shadow-lg">
                        <h2 className="text-xl font-bold text-[#333652]">{pdfMessage}</h2>
                        <div className="mt-4">
                            <div className="animate-spin rounded-full border-4 border-t-4 border-[#0f61a5] h-8 w-8 mx-auto"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Report;
