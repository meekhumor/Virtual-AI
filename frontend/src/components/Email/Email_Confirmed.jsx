import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants";

export default function EmailConfirmed() {
  const navigate = useNavigate();

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.slice(1)); // remove #
    const token = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem(ACCESS_TOKEN, token);
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN, refreshToken);
      }
      navigate("/dashboard");
    } else {
      const storedToken = localStorage.getItem(ACCESS_TOKEN);
      if (storedToken) {
        navigate("/dashboard");
      } else {
        navigate("/register");
      }
    }
  }, [navigate]);

  return (
    <div className="text-white text-center mt-20 flex-grow flex items-center justify-center">
      <h1 className="text-xl">Confirming your email...</h1>
    </div>
  );
}
