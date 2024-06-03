import { Link, useNavigate } from "react-router-dom";
import Button from "../../Components/button";
import FormInput from "../../Components/formInput";
import { useState } from "react";
import useErrorContext from "../../context/errorContext";
import useUserContext from "../../context/userContext";
import getVerificationCode from "../../services/reset-password/getVerificationCode";
import verifyCode from "../../services/reset-password/verifyCode";

const initialDetails = {
  email: "",
  code: "",
  password: "",
  confirmPassword: "",
};

const EmailRegex = new RegExp(import.meta.env.VITE_EMAIL_REGEX);
const PasswordRegex = new RegExp(import.meta.env.VITE_PASSWORD_REGEX);

export default function ResetPassword() {
  const [resetDetails, setResetDetails] = useState(initialDetails);
  const [oneMinutePassed, setOneMinutePassed] = useState(true);
  const { addError, addSuccess } = useErrorContext();
  const { handleSetCookie } = useUserContext();

  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setResetDetails((prev) => ({ ...prev, email: e.target.value }));
  };

  const handleCodeChange = (e) => {
    setResetDetails((prev) => ({ ...prev, code: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setResetDetails((prev) => ({ ...prev, password: e.target.value }));
  };

  const handleConfirmPasswordChange = (e) => {
    setResetDetails((prev) => ({ ...prev, confirmPassword: e.target.value }));
  };

  const handleGetCode = async () => {
    if (!oneMinutePassed) {
      addError("Please wait 60 seconds before requesting another code");
      return;
    }
    if (!EmailRegex.test(resetDetails.email)) {
      addError("please add a valid email");
      return;
    }
    const { responseData, error } = await getVerificationCode(
      resetDetails.email
    );

    if (error) {
      addError(error);
      return;
    }
    if (!responseData.emailSent) {
      addError(responseData.message);
      return;
    }
    addSuccess("code sent to email");
    setOneMinutePassed(false);
    setTimeout(() => {
      setOneMinutePassed(true);
    }, 60000); // 60 secs
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (resetDetails.password != resetDetails.confirmPassword) {
      addError("password and conform password do not match");
      return;
    }
    if (!PasswordRegex.test(resetDetails.password)) {
      addError(
        "password must contain a low-case, a upper-case, a numeric and special letter"
      );
      return;
    }

    //   verify code
    const { responseData, error } = await verifyCode(
      resetDetails.email,
      resetDetails.code,
      resetDetails.password
    );
    if (error) {
      addError(error);
      return;
    }
    if (!responseData.token) {
      addError(responseData.message);
      return;
    }
    handleSetCookie(responseData.token);
    navigate(`/${responseData.role}`);
  };

  return (
    <main className=" flex items-center justify-center min-h-screen bg-primary">
      <div className="w-[70%] px-8 py-10 align-center bg-white rounded-md sm:w-[60%] md:w-[50%] lg:w-[40%] xl:w-[35%]">
        <h1 className="mt-6 text-center text-xl font-semibold text-textColor">
          Reset Password{" "}
        </h1>
        <form
          action="#"
          onSubmit={handleSubmit}
          className="flex flex-col space-y-2 "
        >
          <label htmlFor="login_email">
            <p className="text-sm text-textColor">Email</p>
            <FormInput
              id="reset_email"
              type="email"
              placeholder="Enter Email"
              value={resetDetails.email}
              required={true}
              handleChange={handleEmailChange}
            />
          </label>

          <label htmlFor="reset_code">
            <p className="text-sm text-textColor">Code</p>
            <FormInput
              id="reset_code"
              type="text"
              placeholder="Enter Code"
              value={resetDetails.code}
              required={true}
              handleChange={handleCodeChange}
            />
            <Button text={"Get"} handleOnClick={handleGetCode} />
          </label>

          <label>
            <p className="text-sm text-textColor">Password</p>
            <FormInput
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required={true}
              placeholder="Password"
              value={resetDetails.password}
              handleChange={handlePasswordChange}
            />
          </label>

          <label>
            <p className="text-sm text-textColor">Confirm password</p>
            <FormInput
              id="confirm-password"
              name="confirm-password"
              type="password"
              required={true}
              placeholder="Confirm Password"
              value={resetDetails.confirmPassword}
              handleChange={handleConfirmPasswordChange}
            />
            {resetDetails.password != "" &&
              resetDetails.confirmPassword != "" &&
              resetDetails.password != resetDetails.confirmPassword && (
                <p className="text-xs text-red-700">password do not match</p>
              )}
          </label>

          <div className="  flex flex-col justify-center gap-1 text-xs text-textColor ">
            <p>
              Have an account?{" "}
              <Link
                to={"/get-started/login"}
                className="font-semibold underline hover:scale-95"
              >
                Login
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
