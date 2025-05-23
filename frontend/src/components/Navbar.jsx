import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelopeOpenText, FaHistory, FaSignOutAlt } from "react-icons/fa";

function Navbar() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const navigate = useNavigate();

  // Handle Logout
  const handleLogout = () => {
    setShowLogoutModal(false);
    setShowThankYouModal(true);
    setTimeout(() => {
      setShowThankYouModal(false);
      navigate("/login"); // Redirect to login after logout
    }, 2000);
  };

  return (
    <>
      {/* Navbar */}
      <nav className="w-full bg-white text-black py-4 shadow-lg">
        <ul className="flex justify-center space-x-12">
          <li>
            <Link
              to="/home"
              className="flex items-center space-x-2 hover:scale-105 transition-all duration-300"
            >
              <FaEnvelopeOpenText />
              <span className="hidden md:inline">Check Your Email</span>
            </Link>
          </li>
          <li>
            <Link
              to="/history"
              className="flex items-center space-x-2 hover:scale-105 transition-all duration-300"
            >
              <FaHistory />
              <span className="hidden md:inline">Analysis History</span>
            </Link>
          </li>
          <li>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center space-x-2 hover:scale-105 transition-all duration-300"
            >
              <FaSignOutAlt />
              <span className="hidden md:inline">Log Out</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-md">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold text-gray-800">
              Log Out Confirmation
            </h3>
            <p className="mt-4 text-gray-600">
              Are you sure you want to log out of PhishGuard AI?
            </p>
            <div className="mt-6 flex justify-around">
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300"
              >
                Yes
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thank You Modal */}
      {showThankYouModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-md">
          <div className="bg-white p-6 rounded-lg shadow-lg w-4/5 sm:w-96 flex flex-col items-center">
            {/* Centered Loading Spinner */}
            <div className="loader mb-4"></div>

            <h2 className="text-xl text-black font-semibold">
              Thank you for using our service!
            </h2>
            <p className="text-gray-600 mt-2">
              You will be redirected shortly.
            </p>
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
    </>
  );
}

export default Navbar;
