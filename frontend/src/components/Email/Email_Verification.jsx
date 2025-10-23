import {Link} from "react-router-dom"

export default function Email_Verification() {

    return (
      <div className="flex flex-col w-1/3 max-w-6xl min-h-screen mt-24 items-center mx-auto">

        <div className="flex flex-col gap-6 items-center">
            <img src="/email-verification.svg" className="w-36 h-36" alt="" />
            <h1 className="text-white text-3xl ">Let&apos;s verify your email</h1>
            <p className="text-md text-gray-400 text-center">Please check your email and click the verification link we sent to osmukherjee_b23@ee.vjti.ac.in. If you haven’t received the email, check your spam folder or click the button below to resend the verification email.</p>
            <div className="flex gap-8">
                <button className="bg-white text-darkblue rounded-3xl px-6 py-3  text-sm w-24">Resend</button>
                <button className="bg-blue1 text-white rounded-3xl px-6 py-3  text-sm w-24">Continue</button>
            </div>
        </div>
      </div>
    );
  }
  