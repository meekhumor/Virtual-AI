import React from "react";

export default function ConfirmEmail() {
  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center p-6 text-white">
      <h1 className="text-3xl font-semibold mb-4">Confirm your Email</h1>
      <p className="text-center max-w-md">
        Thank you for registering! Please check your email inbox and follow the instructions to confirm your account.
      </p>
    </div>
  );
}
