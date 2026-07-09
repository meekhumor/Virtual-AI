import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./components/Register/Register";
import NotFound from "./components/NotFound";
import './index.css';
import 'regenerator-runtime/runtime';

import Home from './components/Home/Home';
import Layout from "./Layout";
import Dashboard from './components/Dashboard/Dashboard';
import Category from './components/Category/Category';
import Permission from './components/Permission/Permission';
import Camera_Preview1 from './components/Camera_Preview/Camera_Preview1';
import Camera_Preview2 from './components/Camera_Preview/Camera_Preview2';
import Resume from './components/Resume/Resume';
import Review_Interview from './components/Review_Interview/Review_Interview';
import Analysis from './components/Review_Interview/Analysis';
import About from "./components/Home/About";
import Contact from "./components/Home/Contact";
import Courses from "./components/Courses/Courses";
import Practice from "./components/Practice/Practice";
import Email_Verification from "./components/Email/Email_Verification";
import Interview_Setting from "./components/Interview_Setting/Interview_Setting";
import Interview_Simulator from "./components/Interview_Simulator/Interview_Simulator";
import Animation from "./components/Animation";
import Acknowledgement from "./components/Home/Acknowledgement";
import Support from "./components/Home/Support";
import Review_Interface from "./components/Review_Interview/Review_Interface";
import TranscriptAnalysis from "./components/Check";
import Profile from "./components/Dashboard/Profile";
import Domain from "./components/Interview_Setting/Domain";
import ComingSoon from "./components/Coming_soon";
import ConfirmEmail from "./components/Email/Confirm_Mail";
import EmailConfirmed from "./components/Email/Email_Confirmed";
import ProtectedRoute from "./components/ProtectedRoute";

function Logout() {
  localStorage.clear();
  return <Navigate to="/register" />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Animation />} />
          <Route path="register" element={<RegisterAndLogout />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="logout" element={<Logout />} />
          <Route path="home" element={<Home />} />
          <Route path="acknowledgement" element={<Acknowledgement />} />
          <Route path="support" element={<Support />} />
          <Route path="email-verification" element={<Email_Verification />} />
          <Route path="confirm-email" element={<ConfirmEmail />} />
          <Route path="confirmed" element={<EmailConfirmed />} />
          <Route path="*" element={<NotFound />} />

          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="resume" element={<ProtectedRoute><Resume /></ProtectedRoute>} />
          <Route path="interview-simulator" element={<ProtectedRoute><Interview_Simulator /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="review/:interviewId" element={<ProtectedRoute><Review_Interface /></ProtectedRoute>} />
          <Route path="review-interview" element={<ProtectedRoute><Review_Interview /></ProtectedRoute>} />
          <Route path="interview-setting" element={<ProtectedRoute><Interview_Setting /></ProtectedRoute>} />
          <Route path="interview-category" element={<ProtectedRoute><Category /></ProtectedRoute>} />
          <Route path="analysis" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
          <Route path="domain" element={<ProtectedRoute><Domain /></ProtectedRoute>} />

          <Route path="cam-permission" element={<Permission />} />
          <Route path="cam-preview1" element={<Camera_Preview1 />} />
          <Route path="cam-preview2" element={<Camera_Preview2 />} />
          <Route path="courses" element={<Courses />} />
          <Route path="practice" element={<Practice />} />
          <Route path="check" element={<TranscriptAnalysis />} />
          <Route path="coming-soon" element={<ComingSoon />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
