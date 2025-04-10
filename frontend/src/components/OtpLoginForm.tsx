import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser, setLoading } from "../redux/authSlice";

interface LoginResponse {
  user: {
    id: number;
    email: string;
    username: string;
    fullname: string;
    profilepicture: string;
    isEmailVerified: boolean;
  };
  message: string;
  success: true;
}

const OtpLoginForm = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"send" | "verify">("send");
  const [loading, setLoadingState] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!email) return toast.error("email is required");

    try {
      setLoadingState(true);
      await axios.post(
        "http://localhost:3000/api/v1/users/sendOtp",
        { email },
        { withCredentials: true }
      );
      toast.success("OTP sent to your registered email");
      setStep("verify");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send OTP");
    } finally {
      setLoadingState(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return toast.error("OTP is required");

    try {
      dispatch(setLoading(true));
      setLoadingState(true);
      const res = await axios.post<LoginResponse>(
        "http://localhost:3000/api/v1/users/verifyOtp",
        {
          email,
          otp: Number(otp),
        },
        { withCredentials: true }
      );

      dispatch(setUser(res.data.user));
      toast.success("Logged in successfully");
      navigate("/");
    } catch (error: any) {
      console.log(error);
      if (error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoadingState(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="w-full max-w-md px-6">
      <h1 className="text-3xl font-bold mb-6">Log In with OTP</h1>

      {step === "send" ? (
        <div className="space-y-4">
          <Input
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white py-5"
          />
          <Button
            onClick={handleSendOtp}
            className="w-full bg-[#1e88e5] hover:bg-[#1976d2] py-6"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            OTP sent to your registered email. Please check and enter below.
          </p>
          <Input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="bg-white py-5"
          />
          <Button
            onClick={handleVerifyOtp}
            className="w-full bg-[#1e88e5] hover:bg-[#1976d2] py-6"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default OtpLoginForm;
