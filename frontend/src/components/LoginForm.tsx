import { useState } from "react";
import { EyeOff, Eye, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import { setLoading, setUser } from "../redux/authSlice";
import { RootState } from "../redux/store";

interface FormDataFields {
  username: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: number;
    username: string;
    email: string;
    fullname: string;
    profilepicture: string;
    isEmailVerified: boolean;
  };
  message: string;
  success: true; 
}

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((store: RootState) => store.auth);

  const [formData, setFormData] = useState<FormDataFields>({
    username: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log(`${formData.username} ${formData.password}`)
    try {
      dispatch(setLoading(true));
      const response = await axios.post<LoginResponse>(
        "http://localhost:3000/api/v1/users/login",
        {
          username: formData.username,
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("Upload success:", response.data);
      if (response.status === 200) {
        console.log("logged in")
        dispatch(setUser(response.data.user));
        toast.success("User Logged In successfully");
        setTimeout(() => navigate("/"), 1000);
      }
    } catch (error) {
      console.error("Upload error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
        alert(error.message);
      } else {
        alert("An unknown error occurred");
        toast.error("An unknown error occurred");
      }
    } finally {
      dispatch(setLoading(false));
    }
    formData.password = "";
    formData.username = "";
  };

  return (
    <div className="w-full max-w-md px-6">
      <div>
        <div className="inline-block border border-black/20 rounded-full px-6 py-2 mt-8 mb-4">
          <span className="text-lg">Kalpathon</span>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-6">Log In</h1>

      <form className="space-y-2" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label htmlFor="username" className="block font-medium">
            Username
          </label>
          <Input
            id="username"
            name="username"
            placeholder="Enter your username"
            className="bg-white py-5"
            value={formData.username}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block font-medium">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="bg-white py-5 pr-10"
              value={formData.password}
              onChange={handleInputChange}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {loading ? (
          <Button className="w-full bg-[#1e88e5] hover:bg-[#1976d2] py-6 text-base cursor-none">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please Wait
          </Button>
        ) : (
          <Button
            type="submit"
            className="w-full bg-[#1e88e5] hover:bg-[#1976d2] py-6 text-base cursor-pointer"
          >
            Log In
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          className="w-full py-6 text-base mt-2 cursor-pointer"
          onClick={() => navigate("/otp-login")}
        >
          Log In with OTP
        </Button>
      </form>

      <div className="mt-4 text-center">
        <span>Don't have an account? </span>
        <Link to="/signup" className="text-[#1e88e5] hover:underline">
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;
