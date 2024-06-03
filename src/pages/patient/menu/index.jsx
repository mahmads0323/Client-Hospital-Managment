import { Link } from "react-router-dom";
import MenuItem from "../../../Components/menuItem";
import useUserContext from "../../../context/userContext";
import Button from "../../../Components/button";

const patientMenuDetails = [
  {
    linkText: "home",
    linkPath: "/patient",
  },
  {
    linkText: "doctors",
    linkPath: "/patient/doctors",
  },
  {
    linkText: "notifications",
    linkPath: "/patient/notifications",
  },

  {
    linkText: "appointments",
    linkPath: "/patient/appointments",
  },
];
export default function PatientMenu() {
  const { handleLogout } = useUserContext();
  return (
    <menu className="bg-secondary h-full text-textColor flex justify-between px-2 sm:px-4 md:px-8 lg:px-0 lg:flex-col lg:items-center">
      <Link
        to={"/patient"}
        className="flex items-center justify-center p-1 flex:h-[50%] "
      >
        <img
          src="/nobackground_logo.png"
          alt="logo"
          className=" w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] md:w-[70px] md:h-[70px] lg:w-[80%] lg:h-[80%]"
        />
      </Link>

      <div className=" flex space-x-2 items-center sm:space-x-4 md:space-x-6 lg:space-x-0 lg:flex-col lg:space-y-2 lg:flex-[50%] ">
        {patientMenuDetails.map((menuItem, index) => (
          <MenuItem
            linkPath={menuItem.linkPath}
            linkText={menuItem.linkText}
            key={index}
          />
        ))}
        <Button text={"Logout"} handleOnClick={handleLogout} variant="danger" />
      </div>
    </menu>
  );
}
