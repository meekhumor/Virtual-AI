import React from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

export default function ConfirmEmail() {
  return (
    <div className="flex-grow flex items-center justify-center p-6 text-white bg-black">
      <div className="bg-black2 bg-opacity-40 border border-zinc-800 rounded-3xl p-10 max-w-md w-full text-center flex flex-col items-center gap-6 shadow-2xl">
        <h1 className="text-3xl font-semibold text-white">Confirm your Email</h1>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Thank you for registering! We have sent a verification link to your email inbox. Please follow the instructions in the email to confirm your account and get started.
        </p>
        <Link 
          to="/register" 
          className="mt-4 bg-blue1 hover:bg-darkblue text-white rounded-full px-8 py-2.5 text-sm font-medium transition-all"
        >
          Back to Sign Up
        </Link>
      </div>
    </div>
  );
}
