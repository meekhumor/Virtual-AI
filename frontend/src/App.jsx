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
import Email_Verification from "./components/Email_Verification/Email_Verification";
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
import ConfirmEmail from "./components/Confirm_Mail";
import EmailConfirmed from "./components/Email_Confirmed";

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
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="interview-category" element={<Category />} />
          <Route path="cam-permission" element={<Permission />} />
          <Route path="register" element={<RegisterAndLogout />} />
          <Route path="cam-preview1" element={<Camera_Preview1 />} />
          <Route path="cam-preview2" element={<Camera_Preview2 />} />
          <Route path="resume" element={<Resume />} />
          <Route path="review-interview" element={<Review_Interview />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="logout" element={<Logout />} />
          <Route path="courses" element={<Courses />} />
          <Route path="practice" element={<Practice />} />
          <Route path="email-verification" element={<Email_Verification />} />
          <Route path="interview-setting" element={<Interview_Setting />} />
          <Route path="interview-simulator" element={<Interview_Simulator />} />
          <Route path="home" element={<Home />} />
          <Route path="acknowledgement" element={<Acknowledgement />} />
          <Route path="support" element={<Support />} />
          <Route path="*" element={<NotFound />} />
          <Route path="review/:interviewId" element={<Review_Interface />} />
          <Route path="check" element={<TranscriptAnalysis />} />
          <Route path="profile" element={<Profile />} />
          <Route path="domain" element={<Domain />} />
          <Route path="coming-soon" element={<ComingSoon />} />
          <Route path="confirm-email" element={<ConfirmEmail />} />
          <Route path="confirmed" element={<EmailConfirmed />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
