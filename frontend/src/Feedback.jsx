import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Feedback() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [dashboardId, setDashboardId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (location.state?.dashboardId) {
            setDashboardId(location.state.dashboardId);
        } else {
            console.warn("No dashboard ID found in navigation state.");
        }
    }, [location.state]);

    const [feedback, setFeedback] = useState({
        type: "Positive",
        comments: "",
    });

    const handleChange = (e) => {
        setFeedback({ ...feedback, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (!dashboardId) {
        alert("Dashboard ID missing.");
        return;
    }

    setIsSubmitting(true); // Show loading animation

    try {
        const response = await fetch("http://localhost:5000/api/feedback", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                dashboardId,
                type: feedback.type,
                comments: feedback.comments,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to submit feedback");
        }

        // Wait 3s before redirect
        setTimeout(() => {
            navigate(`/dashboard/${dashboardId}`);
        }, 3000);
    } catch (err) {
        console.error("Feedback submission error:", err);
        alert("Error submitting feedback. Please try again.");
        setIsSubmitting(false);
    }
};


    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#333652] px-4">
            <div className="bg-white p-6 sm:p-8 shadow-lg rounded-lg w-full max-w-lg">
                <h1 className="text-xl sm:text-2xl font-bold text-center text-[#333652] mb-4">Submit Feedback</h1>
                <p className="text-center text-gray-600 mb-6">Your feedback helps us improve PhishGuard AI.</p>

                {/* Display Dashboard ID */}
                <div className="mb-4 p-3 bg-gray-100 text-gray-700 rounded-md text-center text-sm sm:text-base">
                    <b>Analysis ID:</b> {dashboardId || "Loading..."}
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Feedback Type */}
                    <label className="block mb-4">
                        <span className="text-sm sm:text-lg font-semibold">Feedback Type:</span>
                        <select
                            name="type"
                            value={feedback.type}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg mt-1 text-sm sm:text-base"
                        >
                            <option value="Positive">Positive</option>
                            <option value="Neutral">Neutral</option>
                            <option value="Negative">Negative</option>
                        </select>
                    </label>

                    {/* Comments */}
                    <label className="block mb-4">
                        <span className="text-sm sm:text-lg font-semibold">Additional Comments:</span>
                        <textarea
                            name="comments"
                            value={feedback.comments}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg mt-1 resize-none text-sm sm:text-base"
                            rows="4"
                            placeholder="Write your feedback here..."
                        ></textarea>
                    </label>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white text-sm sm:text-lg font-semibold rounded-lg bg-[#0f61a5] hover:bg-[#d3941a] transition-colors"
                        disabled={!dashboardId || isSubmitting}
                    >
                        Submit Feedback
                    </button>
                </form>
            </div>

            {/* Processing Modal with Loader */}
            {isSubmitting && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-md">
                <div className="bg-white p-6 rounded-lg text-center shadow-lg flex flex-col items-center">
                  {/* Spinner Animation */}
                  <div className="loader mb-4"></div>
      
                  <h2 className="text-xl font-semibold text-gray-800">Thank you for your feedback!</h2>
                  <p className="text-gray-600 mt-2">Redirecting you back to the dashboard.</p>
                </div>
              </div>
            )}
      
            {/* Loader Animation (CSS) */}
            <style>
              {`
                .loader {
                  border: 4px solid rgba(0, 0, 0, 0.1);
                  border-left-color: #d3941a;
                  width: 40px;
                  height: 40px;
                  border-radius: 50%;
                  animation: spin 1s linear infinite;
                }
      
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
        </div>
    );
}

export default Feedback;
