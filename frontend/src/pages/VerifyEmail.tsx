import React, { useState } from "react";
import axios from "axios";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button"; 
import { Card, CardContent } from "../components/ui/card";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

type VerifyEmailResponse = {
  message: string;
  success: boolean; 
};

const VerifyEmail: React.FC = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post<VerifyEmailResponse>(`http://localhost:3000/api/v1/users/verify-email/${userId}`, 
        { userId: Number(userId), otp: Number(otp) });
      console.log(response);
      if (response.data.success) {
        setOtp("");
        toast.success("Email Verified Successfully");
        setTimeout(() => navigate('/'), 2000);
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      console.log(error);
      if (error.response.data.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
    setOtp("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-6 space-y-6">
          <h2 className="text-2xl font-semibold text-center">Verify Your Email</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">OTP</label>
              <Input
                type="number"
                placeholder="Enter the OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center ">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Verifying...
                </span>
              ) : (
                "Verify Email"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
