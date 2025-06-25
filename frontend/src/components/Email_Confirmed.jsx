import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function EmailConfirmed() {
  const navigate = useNavigate();

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.slice(1)); // remove #
    const token = hashParams.get("access_token");
    const type = hashParams.get("type");

    if (token && type === "signup") {
      localStorage.setItem("token", token);

      navigate("/dashboard");
    } else {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="text-white text-center mt-20">
      <h1>Confirming your email...</h1>
    </div>
  );
}
