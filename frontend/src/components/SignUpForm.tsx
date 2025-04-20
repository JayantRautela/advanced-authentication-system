"use client";
import { useState } from "react";
import { EyeOff, Eye, Loader2, UserRoundXIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import { setLoading } from "../redux/authSlice";
import { RootState } from "../redux/store";

interface FormDataFields {
  username: string;
  fullname: string;
  email: string;
  password: string;
  file: File | null;
}

interface BackendResponse {
  userId: number;
  message: string;
  success: true;
}

const SignUpForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { loading } = useSelector((store: RootState) => store.auth);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState<FormDataFields>({
    username: "",
    fullname: "",
    email: "",
    password: "",
    file: null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData((prev) => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("fullname", formData.fullname);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("username", formData.username);
    if (formData.file) {
      formDataToSend.append("file", formData.file);
    }

    try {
      dispatch(setLoading(true));
      const response = await axios.post<BackendResponse>(
        "http://localhost:3000/api/v1/users/register",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Upload success:", response.data);
      if (response.status === 201) {
        toast.success("User registered successfully");
        const userId = response.data.userId;
        setTimeout(() => navigate(`/verify-email?userId=${userId}`), 2000);
      }
    } catch (error: any) {
      console.log(error);
      if (error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
    } finally {
      dispatch(setLoading(false));
    }
    formData.email = "";
    formData.password = "";
    formData.fullname = "";
    formData.file = null;
    formData.username = "";
  };

  return (
    <div className="w-full max-w-md px-6">
      <div>
        <div className="inline-block border border-black/20 rounded-full px-6 py-2 mt-8 mb-4">
          <span className="text-lg">Kalpathon</span>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-6">Create an account</h1>

      <form className="space-y-2" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label htmlFor="name" className="block font-medium">
            Full Name
          </label>
          <Input
            id="name"
            name="fullname"
            placeholder="Enter your name"
            className="bg-white py-5"
            value={formData.fullname}
            onChange={handleInputChange}
          />
        </div>

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
          <label htmlFor="email" className="block font-medium">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            className="bg-white py-5"
            value={formData.email}
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

          <div className="space-y-1">
            <label htmlFor="file" className="block font-medium">
              Profile Picture
            </label>
            <Input
              id="file"
              name="file"
              accept="image/*"
              type="file"
              className="bg-white py-5 cursor-pointer"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* <Button type="submit" className="w-full bg-[#1e88e5] hover:bg-[#1976d2] py-6 text-base cursor-pointer">
          Sign Up
        </Button> */}
        {loading ? (
          <Button className="w-full bg-[#1e88e5] hover:bg-[#1976d2] py-6 text-base cursor-pointer">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please Wait
          </Button>
        ) : (
          <Button
            type="submit"
            className="w-full bg-[#1e88e5] hover:bg-[#1976d2] py-6 text-base cursor-pointer"
          >
            Sign Up
          </Button>
        )}
      </form>

      <div className="mt-4 text-center">
        <span>Already have an account? </span>
        <Link to="/login" className="text-[#1e88e5] hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default SignUpForm;
