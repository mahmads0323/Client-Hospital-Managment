import { useState, useEffect } from "react";
import { SampleAppintments } from "../sampleData/sampleAppointments";
import Loader from "./loader";
import Button from "./button";
import { useNavigate, useParams } from "react-router-dom";
import NotFoundPage from "../pages/not-found";
import getAppointmentById from "../services/appointment/getById";
import useErrorContext from "../context/errorContext";
import deleteAppointmentById from "../services/appointment/deleteById";
import createNotification from "../services/notification/createNotification";
import approveAppointmentById from "../services/appointment/approve";
import addPostDetails from "../services/appointment/addPostDetais";

export default function AppointmentView({ viewRole = "patient" }) {
  const params = useParams();
  const { appointmentId } = params;

  const [appointmentDetails, setAppointmentDetails] = useState({});
  const [appointmentDetailsFound, setAppointmentDetailsFound] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [appointmentPostDetails, setAppointmentPostDetails] = useState("");

  const navigate = useNavigate();
  const { addError } = useErrorContext();

  const makeDataRequest = async () => {
    setIsLoading(false);
    setAppointmentDetailsFound(false);
    const { responseData, error } = await getAppointmentById(appointmentId);
    if (error) {
      addError(error);
      setIsLoading(false);
      setAppointmentDetailsFound(false);
      return;
    }
    if (!responseData.data) {
      addError(responseData.message);
      setIsLoading(false);
      setAppointmentDetailsFound(false);
      return;
    }
    setAppointmentDetails(responseData.data);
    setIsLoading(false);
    setAppointmentDetailsFound(true);
    console.log("Data: ", responseData.data);
  };

  const handleGoBack = () => {
    navigate(-1);
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

  const handleDeleteAppointment = async () => {
    const { responseData, error } = await deleteAppointmentById(appointmentId);
    if (error) {
      addError(error);
      return;
    }
    if (!responseData.deleted) {
      addError(responseData.message);
      return;
    }
    // create a notification of deletion of appointment
    const message = "appointment deleted";
    sendNotification(
      appointmentDetails.doctorId,
      appointmentDetails.patientId,
      appointmentDetails.doctorName,
      "deletion of appointmet",
      message
    );
    navigate(-1);
  };

  const handleApproveAppointment = async () => {
    const { responseData, error } = await approveAppointmentById(appointmentId);
    if (error) {
      addError(error);
      return;
    }
    if (!responseData.approved) {
      addError(error);
      return;
    }

    // create a notification of approval
    const message = "The dcotor have approved your appointment";
    sendNotification(
      appointmentDetails.doctorId,
      appointmentDetails.patientId,
      appointmentDetails.doctorName,
      "approval of appointmet",
      message
    );

    navigate(-1);
  };

  const handleChangePostAppointmentDetails = (e) => {
    setAppointmentPostDetails(e.target.value);
  };

  const handleSubmitPostAppointmentDetails = async (e) => {
    e.preventDefault();
    const { responseData, error } = await addPostDetails(
      appointmentPostDetails,
      appointmentId
    );

    if (error) {
      addError(error);
      return;
    }

    if (!responseData.updated) {
      addError(responseData.message);
      return;
    }

    // create a notification of appointment post details
    const message = "Add post details to appointment: " + appointmentId;
    sendNotification(
      appointmentDetails.doctorId,
      appointmentDetails.patientId,
      appointmentDetails.doctorName,
      "post details addded",
      message
    );

    // for now we are navigating back, but will refresh the page using (0)
    navigate(-1);
  };

  useEffect(() => {
    setIsLoading(true);
    makeDataRequest();
  }, [appointmentId]);

  if (!appointmentDetailsFound) {
    switch (viewRole) {
      case "patient":
        return <NotFoundPage redirectTo="/patient" />;
      case "doctor":
        return <NotFoundPage redirectTo="/doctor" />;
      case "admin":
        return <NotFoundPage redirectTo="/admin" />;
      default:
        return <NotFoundPage redirectTo="/" />;
    }
  }

  //   First we will check whather the page is loading
  //  2nd Wheather the doctor has been found
  // if both condtions satified then we will render main content
  return (
    <section className="w-full flex flex-col items-center">
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full p-2 sm:w-[90%] md:w-[85%] lg:w-[80%] xl:w-[75%]">
          <div className="w-full text-center bg-primary py-4">
            <h3 className="font-semibold lg:text-lg">Appointment Details</h3>
          </div>

          <div className="w-full flex justify-between py-4">
            <div className="text-sm lg:text-base">
              <p>
                Patient Name:{" "}
                <span className="font-semibold">
                  {appointmentDetails.patientName}
                </span>
              </p>
              <p>
                Doctor Name:{" "}
                <span className="font-semibold">
                  {appointmentDetails.doctorName}
                </span>
              </p>
              <p>
                Scheduled:{" "}
                <span className="font-semibold">
                  {appointmentDetails.hoursTime > 12
                    ? `${appointmentDetails.hoursTime % 12} PM`
                    : `${appointmentDetails.hoursTime} AM`}{" "}
                  -{" "}
                  {new Date(appointmentDetails.dated).toLocaleString("en-US", {
                    year: "2-digit",
                    month: "short",
                    day: "2-digit",
                  })}
                </span>
              </p>
            </div>
            <div className="flex flex-col justify-between items-center">
              <p>Status</p>{" "}
              <span
                className={`${
                  appointmentDetails.status == "scheduled"
                    ? "bg-green-700 text-white"
                    : appointmentDetails.status == "pending"
                    ? "bg-designColor2 text-white"
                    : appointmentDetails.status == "deleted"
                    ? "bg-red-700 text-white"
                    : "bg-designColor1 text-black"
                } w-min mx-1 px-1 rounded capitalize`}
              >
                {appointmentDetails.status}
              </span>
            </div>
          </div>

          <div className="text-sm lg:text-base">
            <div className="py-2 md:py-4">
              <p className="w-full text-left border-b border-designColor2 text-textColor font-semibold my-2">
                Pre Details:{" "}
              </p>
              <p>
                {appointmentDetails.details.pre == ""
                  ? "No pre appointment Details."
                  : appointmentDetails.details.pre}
              </p>
            </div>

            <div className="py-2 md:py-4">
              <p className="w-full text-left border-b border-designColor2 text-textColor font-semibold my-2">
                Post Details:{" "}
              </p>

              { appointmentDetails.details.postDetailsWritten ? (
                appointmentDetails.details.post
              ) : !appointmentDetails.timePassed ? (
                appointmentDetails.status == "deleted" ? (
                  <p>
                    Appointment cancelled as time has passed before approving
                    appointment
                  </p>
                ) : (
                  <p>Please wait for appointment time</p>
                )
              ) : (
                <form onSubmit={handleSubmitPostAppointmentDetails}>
                  <label htmlFor="pre-details">
                    <span className="text-sm text-textColor">
                      Discuss post Details
                    </span>
                    <textarea
                      className="w-full bg-white  text-black my-1 p-1 border-designColor2 border rounded focus:outline-none focus:border-textColor"
                      id="pre-details"
                      name="pre-details"
                      type="text"
                      placeholder="Name"
                      value={appointmentPostDetails}
                      onChange={handleChangePostAppointmentDetails}
                    />
                  </label>
                  <div className="w-full text-right">
                    <Button type="submit" text={"save"} />
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="w-full flex justify-between text-left mt-2 lg:mt-4">
            <Button text={"back"} handleOnClick={handleGoBack} />
            {(viewRole == "doctor" || viewRole == "admin") &&
              appointmentDetails.status != "deleted" &&
              appointmentDetails.status != "completed" && (
                <div className="flex space-x-1">
                  {appointmentDetails.status != "scheduled" && (
                    <Button
                      text={"approve"}
                      handleOnClick={handleApproveAppointment}
                    />
                  )}
                  <Button
                    text={"delete"}
                    variant="danger"
                    handleOnClick={handleDeleteAppointment}
                  />
                </div>
              )}
          </div>
        </div>
      )}
    </section>
  );
}
