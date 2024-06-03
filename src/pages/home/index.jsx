import LOGO from "/logo.jpg";
import CustomLink from "../../Components/link";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUserContext from "../../context/userContext";

export default function HomePage() {

  const naviagte = useNavigate();
  const {currentRole} = useUserContext()

  useEffect(()=>{
       // check if user is logged in or not
       if (currentRole) {
        naviagte(`/${currentRole}`);
        return;
      }
  }, [])

  return (
    <main className="h-[100vh]  bg-primary flex ">
      <div className="relative flex-[50%]">
        <div className="h-full flex flex-col justify-center items-center lg:leading-[1px] ">
          <p className="text-xs md:text-sm xl:text-base ">Welcome to (HMS)</p>
          <h3 className="sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl mb-2 text-textColor">
            Hospital Mangement system{" "}
          </h3>
        </div>
        <div className="absolute w-full flex space-x-2 justify-center bottom-[40%] animate-slideUpAndFadeOut">
          <CustomLink to="/get-started" text={"Signup"} />
          <CustomLink to="/get-started/login" text={"Login"} />
        </div>
      </div>

      <div className="hidden md:block md:flex-[50%] nd:h-full">
        <img src={LOGO} alt="logo" className="h-full w-full" />
      </div>
    </main>
  );
}
