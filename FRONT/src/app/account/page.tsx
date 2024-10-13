"use client";
import { useState } from "react";
import Login from "./login/Login";
import Register from "./register/Register";
import ForgotPasswordModal from "@/components/organisms/ForgotPasswordModal";
import ResetPasswordModal from "@/components/organisms/ResetPasswordModal";
import VerifyEmailModal from "@/components/organisms/VerifyEmailModal";
import { LOGIN_VIEW } from "@/interfaces/enums";

export default function Account() {
  const [currentView, setCurrentView] = useState(LOGIN_VIEW.SIGN_IN);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {currentView === LOGIN_VIEW.SIGN_IN && <Login setCurrentView={setCurrentView} />}
      {currentView === LOGIN_VIEW.REGISTER && <Register setCurrentView={setCurrentView} />}
      {currentView === LOGIN_VIEW.FORGOT_PASSWORD && <ForgotPasswordModal setCurrentView={setCurrentView} />}
      {currentView === LOGIN_VIEW.RESET_PASSWORD && <ResetPasswordModal setCurrentView={setCurrentView} />}
      {currentView === LOGIN_VIEW.VERIFY_EMAIL && <VerifyEmailModal setCurrentView={setCurrentView} />}
    </div>
  );
}