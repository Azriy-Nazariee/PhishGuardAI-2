import React from "react";
import "./index.css";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import SignUp from "./SignUp";
import Login from "./Login";
import Home from "./Home";
import Dashboard from "./Dashboard";
import History from "./History";
import Report from "./Report";
import Feedback from "./Feedback";

// Component to handle conditional Navbar display
const ConditionalNavbar = () => {
  const location = useLocation();
  const hideNavbarRoutes = ["/login", "/", "*"];
  return !hideNavbarRoutes.includes(location.pathname) ? <Navbar /> : null;
};

function App() {
  return (
    <Router>
      <ConditionalNavbar />
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard/:id" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/report/:id" element={<Report />} />
            <Route path="/feedback" element={<Feedback />} />

            {/* Catch-all route */}
            <Route
              path="*"
              element={
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 font-cabin">
                  <div className="text-center bg-white p-8 rounded-lg shadow-lg w-full max-w-lg mb-0">
                    <div className="mb-6">
                      <img
                        src="404.png"
                        alt="Lost in cyberspace"
                        className="w-64 h-64 object-cover rounded-lg items-center mx-auto"
                      />
                    </div>
                    <h1 className="text-4xl font-semibold text-gray-800 mb-4">
                      Oops! This page is lost in cyberspace!
                    </h1>
                    <p className="text-xl text-gray-600 mb-6">
                      Looks like this page went on a little adventure and got lost. Don’t worry, we’ll guide you back home!
                    </p>
                    <a
                      href="/"
                      className="px-6 py-3 bg-gold-dark text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Take me home, please!
                    </a>
                    <p className="text-sm text-gray-400 mt-4">
                      (Or you could keep exploring, but no pressure!)
                    </p>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
