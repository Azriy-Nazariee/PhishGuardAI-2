import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 

function Home() {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);

  console.log("Stored token:", localStorage.getItem("token"));

  const handleUpload = async (event) => {
    if (event.target.files.length > 0) {
      setIsUploading(true);

      const file = event.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const token = localStorage.getItem("token"); // ✅ Get token from localStorage

        const response = await axios.post("/api/analyse-file", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // ✅ Send token
          },
        });

        const data = response.data;
        console.log("Analysis result:", data);

        setIsUploading(false);

        if (data.reportId) {
          navigate(`/dashboard/${data.reportId}`);
        } else {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Upload error:", error);
        setIsUploading(false);
        alert("Error uploading or analyzing file");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#333652] py-10 md:px-6">
      {/* Hero Section */}
      <header className="flex flex-col items-center text-center space-y-6">
        <img
          src="/welcome.png"
          alt="Home Icon"
          className="w-40 md:w-64 h-auto max-w-full"
        />
        <div className="flex flex-col items-center max-w-3xl">
          <h1 className="text-3xl md:text-5xl text-white font-bold">
            Welcome to PhishGuard AI!
          </h1>
          <p className="mt-4 text-lg md:text-2xl text-white leading-relaxed">
            Protect your inbox with ease. Upload your email or dataset, and let
            our AI-powered system detect phishing threats in just seconds.
          </p>
        </div>
      </header>

      <hr className="border-t-4 border-[#d3941a] my-8 w-1/2" />

      {/* Step-by-Step Guide */}
      <div className="w-full max-w-5xl px-4 md:px-6 mt-3">
        <h2 className="text-3xl md:text-5xl font-bold text-white text-center mb-12">
          How It Works?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              img: "/upload.png",
              title: "Upload Your File",
              text: "Drag and drop or browse your emails or datasets.",
            },
            {
              img: "/analyze.png",
              title: "Analyze Instantly",
              text: "Our advanced AI scans for phishing threats with precision.",
            },
            {
              img: "/secure.png",
              title: "Stay Secure",
              text: "Get actionable insights to safeguard your information.",
            },
          ].map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className="bg-white p-8 shadow-md rounded-3xl flex items-center justify-center w-32 h-32 md:w-40 md:h-40">
                <img
                  src={step.img}
                  alt={`${step.title} Icon`}
                  className="w-20 md:w-28 h-auto"
                />
              </div>
              <p className="text-lg md:text-xl text-white">
                <b>{step.title}</b>
                <br /> {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-t-4 border-[#d3941a] my-12 w-1/2" />

      <p className="mt-5 text-lg md:text-2xl text-white text-center px-6 max-w-3xl">
        <b>
          💡 Pro Tip: Regular checks keep your data safe from evolving threats!
        </b>
        <br /> Ready to secure your emails? Upload now!
      </p>

      <div className="flex flex-col items-center mt-10">
        <label
          htmlFor="fileUpload"
          className="cursor-pointer px-8 md:px-12 py-4 bg-[#d3941a] text-white text-lg font-semibold rounded-lg hover:bg-[#e7a92f] transition-colors flex items-center space-x-3"
        >
          <img
            src="/upload-button.png"
            alt="Upload Icon"
            className="w-6 md:w-7 h-auto"
          />
          <span>Upload Email File / Dataset</span>
        </label>
        <input
          type="file"
          id="fileUpload"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {isUploading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-md">
          <div className="bg-white p-6 rounded-lg text-center shadow-lg flex flex-col items-center">
            <div className="loader mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800">
              Processing...
            </h2>
            <p className="text-gray-600 mt-2">
              Analyzing the uploaded file, please wait.
            </p>
          </div>
        </div>
      )}

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

export default Home;
