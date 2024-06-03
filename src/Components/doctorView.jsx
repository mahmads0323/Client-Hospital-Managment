import { useState, useEffect } from "react";
import USER_PROFILE from "/user-regular.png";
import Loader from "./loader";
import Button from "./button";
import { useNavigate, useParams } from "react-router-dom";
import NotFoundPage from "../pages/not-found";
import getDoctorById from "../services/doctor/getById";
import useErrorContext from "../context/errorContext";
import approveDoctorById from "../services/doctor/approve";
import createNotification from "../services/notification/createNotification";

export default function DoctorView({ viewRole = "patient" }) {
  const params = useParams();
  const { doctorId } = params;
  const [doctorDetails, setDoctorDetails] = useState({});
  const [doctorDetailsFound, setDoctorDetailsFound] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const { addError } = useErrorContext();

  const makeDataRequest = async () => {
    setIsLoading(true);
    const { responseData, error } = await getDoctorById(doctorId);
    if (error) {
      setDoctorDetailsFound(false);
      addError(error);
      setIsLoading(false);
      return;
    }
    if (!responseData.data) {
      setDoctorDetailsFound(false);
      addError(responseData.message);
      setIsLoading(false);
      return;
    }
    setDoctorDetailsFound(true);
    setDoctorDetails(responseData.data);
    setIsLoading(false);
  };

  const sendNotification = async (fromId, toId, fromName, title, message) => {
    const { responseData, error } = await createNotification({
      fromId,
      toId,
      fromName,
      title,
      message,
    });
    if (error) {
      addError(error);
      return;
    }
    if (!responseData.added) {
      addError(responseData.message);
      return;
    }
  };

  const handleApproveDoctor = async () => {
    const { responseData, error } = await approveDoctorById(doctorId);
    if (error) {
      addError(error);
      return;
    }
    if (!responseData.approved) {
      addError(responseData.message);
      return;
    }

    // send notification of approval
    const message = "You have been approved by admin";
    sendNotification(
      1, // admin by default
      doctorDetails.id,
      doctorDetails.name,
      "approval of doctor",
      message
    );

    navigate(-1);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    setIsLoading(true);
    makeDataRequest();
  }, [doctorId]);

  if (!doctorDetailsFound) {
    switch (viewRole) {
      case "patient":
        return <NotFoundPage redirectTo="/patient" />;
      case "admin":
        return <NotFoundPage redirectTo="/admin" />;
      default:
        <NotFoundPage redirectTo="/" />;
    }
  }
  return (
    <section className="w-full flex flex-col items-center">
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full p-2 sm:w-[90%] md:w-[85%] lg:w-[80%] xl:w-[75%]">
          <div className="w-full text-center bg-primary py-4">
            <h3 className="font-semibold lg:text-lg">Doctor Details</h3>
          </div>

          <div className="w-full flex justify-center items-center mt-4 bg-primary p-4 text-textColor rounded text-sm lg:text-base">
            <div className="flex-[75%] ">
              <h2>
                Name:{" "}
                <span className="font-semibold">{doctorDetails.name}</span>
              </h2>
              <h2>
                Field:{" "}
                <span className="font-semibold">{doctorDetails.field}</span>
              </h2>
              <h2>
                Qualification:{" "}
                <span className="font-semibold">
                  {doctorDetails.qualification}
                </span>
              </h2>
              {doctorDetails.status == "pending" && (
                <Button
                  text={"approve"}
                  handleOnClick={() => handleApproveDoctor(doctorDetails.id)}
                />
              )}
            </div>
            <div className="flex-[25%] flex items-center justify-center">
              <img
                src={USER_PROFILE}
                alt="USER_PROFILE"
                className="w-full rounded-full border border-black p-1 sm:w-[90%] md:w-[85%] lg:w-[80%] xl:w-[75%]"
              />
            </div>
          </div>
          <div className="flex justify-center py-2">
            <p className="w-[90%] text-sm lg:text-base">
              <span className="font-semibold"> About:</span>{" "}
              <span>{doctorDetails.about}</span>
            </p>
          </div>
          <div className="w-full text-left mt-2 lg:mt-4">
            <Button text={"back"} handleOnClick={handleGoBack} />
          </div>
        </div>
      )}
    </section>
  );
}
