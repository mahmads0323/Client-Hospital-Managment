import { useEffect, useState } from "react";
import FormInput from "../../Components/formInput";
import Button from "../../Components/button";
import { Link, useNavigate } from "react-router-dom";
import login from "../../services/login";
import useErrorContext from "../../context/errorContext";
import useUserContext from "../../context/userContext";

const initialDetails = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const [loginDetails, setLoginDetails] = useState(initialDetails);
  const { addError } = useErrorContext();
  const { handleSetCookie } = useUserContext();
  const navigate = useNavigate();
  const {currentRole} = useUserContext()

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { responseData, error } = await login(loginDetails);
    if (error) {
      addError(error);
      return;
    }
    if (!responseData.token) {
      addError(responseData.message);
      return;
    }
    await handleSetCookie(responseData.token);
    navigate(`/${responseData.role}`);
  };

  useEffect(()=>{
       // check if user is logged in or not
       if (currentRole) {
        navigate(`/${currentRole}`);
        return;
      }
  }, [])

  return (
    <main className=" flex items-center justify-center min-h-screen bg-primary">
      <div className="w-[70%] px-8 py-10 align-center bg-white rounded-md sm:w-[60%] md:w-[50%] lg:w-[40%] xl:w-[35%]">
        <h1 className="mt-6 text-center text-xl font-semibold text-textColor">
          Login{" "}
        </h1>
        <form
          action="#"
          onSubmit={handleSubmit}
          className="flex flex-col space-y-2 "
        >
          <label htmlFor="login_email">
            <p className="text-sm text-textColor">Email</p>
            <FormInput
              id="login_email"
              type="email"
              placeholder="Enter Email"
              value={loginDetails.email}
              required={true}
              handleChange={(e) =>
                setLoginDetails((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </label>
          <label htmlFor="login_password">
            <p className="text-sm text-textColor">Password</p>
            <FormInput
              id="login_password"
              type="password"
              placeholder="Enter Password"
              value={loginDetails.password}
              required={true}
              handleChange={(e) =>
                setLoginDetails((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
            />
          </label>
          <div className="  flex flex-col justify-center gap-1 text-xs text-textColor ">
            <p>
              Forgot password?{" "}
              <Link
                to={"/get-started/reset"}
                className="font-semibold underline hover:scale-95"
              >
                Reset
              </Link>
            </p>
            <p>
              Do not have an account?{" "}
              <Link
                to={"/get-started"}
                className="font-semibold underline hover:scale-95"
              >
                Signup
              </Link>
            </p>
          </div>

          <Button text="Login" type="submit" />
        </form>
      </div>
    </main>
  );
}
