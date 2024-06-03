import { useEffect, useState } from "react";
import Loader from "../../Components/loader";
import FormInput from "../../Components/formInput";
import Button from "../../Components/button";
import { useNavigate } from "react-router-dom";
import getByCookie from "../../services/patient/getByCookie";
import useErrorContext from "../../context/errorContext";
import getAllDcotors from "../../services/doctor/getAllDoctors";
import dailyDoctorSchedule from "../../services/doctor/dailySchedule";
import createAppointment from "../../services/appointment/create";
import createNotification from "../../services/notification/createNotification";

const todayDate = new Date().setUTCHours(0, 0, 0, 0);
const minDate = new Date(todayDate + 1 * 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10); // Tomorrows's date in YYYY-MM-DD format
const maxDate = new Date(todayDate + 7 * 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10); // 7 days from tomorrow

const initialAppointmentDetails = {
  doctorId: 0,
  doctorName: "",
  doctorField: "",
  patientName: "",
  patientCnic: 0,
  dated: 0,
  hoursTime: 0,
  status: "pending",
  pre: "",
};

export default function NewAppointment({ viewRole = "patient" }) {
  const [newAppointmentDetails, setNewAppointmentDetails] = useState(
    initialAppointmentDetails
  );
  const [isLaoding, setIsLaoding] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [doctorFields, setDoctorFields] = useState([]);
  const [allDoctorsNameAndId, setAllDoctorsNameAndId] = useState([]);
  const [selectedDoctorsNameAndId, setSelectedDoctorsNameAndId] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState({});

  const [selectedDateSchedule, setSelectedDateSchedule] = useState({});
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);

  const navigate = useNavigate();

  const { addError } = useErrorContext();

  const makeDataRequest = async () => {
    setIsLaoding(true);

    // base on view rol
    // if view role is admin, then admin must provide patient name and id
    // if view role is patiet, get pateint data from token
    if (viewRole == "patient") {
      //
      const { reponseData, error } = await getByCookie();
      if (error) {
        addError(error);
        setIsLaoding(false);
        return;
      }
      if (!reponseData.data) {
        addError(reponseData.message);
        setIsLaoding(false);
        return;
      }
      setNewAppointmentDetails((prev) => ({
        ...prev,
        patientName: reponseData.data.name,
        patientCnic: reponseData.data.cnic,
      }));
      setIsLaoding(false);
    } else if (viewRole == "admin") {
      setNewAppointmentDetails((prev) => ({
        ...prev,
        patientName: "",
        patientCnic: 0,
      }));
      setIsLaoding(false);
    }
  };

  const makeDoctorFieldsRequest = async () => {
    const { repsonseData, error } = await getAllDcotors(-1, 0); // specail condition to get all doctors
    if (error) {
      addError(error);
      return;
    }
    if (!repsonseData.data) {
      addError(repsonseData.message);
      return;
    }
    const tempFields = repsonseData.data.map((doctor) => doctor.field);
    setDoctorFields(tempFields);
    setAllDoctorsNameAndId(repsonseData.data);
  };

  const handleSetSelectedDoctorNameAndId = (fieldName) => {
    // it will be called when field is selected
    const tempDoctors = allDoctorsNameAndId.filter(
      (doctorItem) => doctorItem.field == fieldName
    );
    setSelectedDoctorsNameAndId(tempDoctors);
  };

  const makeDoctorDataRequest = (doctorId) => {
    // it will be called when doctor name is changed
    const doctor = selectedDoctorsNameAndId.find(
      (doctorItem) => doctorItem.id == doctorId
    );
    setNewAppointmentDetails((prev) => ({
      ...prev,
      doctorName: doctor.name,
      doctorId: doctor.id,
    }));
    setSelectedDoctor(doctor);
  };

  const makeselectedDateScheduleDataRequest = async (selectedDate) => {
    setIsScheduleLoading(true);
    const { responseData, error } = await dailyDoctorSchedule(
      selectedDoctor.id,
      selectedDate
    );
    if (error) {
      addError(error);
      return;
    }
    if (!responseData.data) {
      addError(responseData.message);
      return;
    }
    setSelectedDateSchedule(responseData.data);
    setIsScheduleLoading(false);
  };

  useEffect(() => {
    makeDataRequest();
    makeDoctorFieldsRequest();
  }, []);

  const handlePateintNameChange = (e) => {
    setNewAppointmentDetails((prev) => ({
      ...prev,
      patientName: e.target.value,
    }));
  };

  const handlePatientCnicChange = (e) => {
    setNewAppointmentDetails((prev) => ({
      ...prev,
      patientCnic: e.target.value,
    }));
  };

  const handleFieldChange = (e) => {
    const fieldName = e.target.value;
    setNewAppointmentDetails((prev) => ({
      ...prev,
      doctorField: fieldName,
    }));
    handleSetSelectedDoctorNameAndId(fieldName);
  };

  const handleDoctorChange = (e) => {
    const doctorId = e.target.value;
    makeDoctorDataRequest(doctorId);
  };

  const handleAppointmentDateChange = (e) => {
    const tempDate = new Date(e.target.value).getTime();
    setNewAppointmentDetails((prev) => ({ ...prev, dated: tempDate }));
    makeselectedDateScheduleDataRequest(tempDate);
  };

  const handleAppointmentTime = (e) => {
    const choosenHour = e.target.value;
    setNewAppointmentDetails((prev) => ({
      ...prev,
      hoursTime: choosenHour,
    }));
  };

  const handlePreMessageChange = (e) => {
    setNewAppointmentDetails((prev) => ({
      ...prev,
      pre: e.target.value,
    }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { responseData, error } = await createAppointment(
      newAppointmentDetails
    );
    if (error) {
      addError(error);
      setIsSubmitting(false);
      return;
    }
    if (!responseData.added) {
      addError(responseData.message);
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(false);
    console.log("response data: ", responseData);
    setNewAppointmentDetails(initialAppointmentDetails);

    // send user notification
    const message =
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";

    await sendNotification(
      1, // admin by default
      newAppointmentDetails.doctorId,
      newAppointmentDetails.doctorName,
      "New Appointment with patient having cnic: " +
        newAppointmentDetails.patientCnic,
      message
    );

    // navigate to home page
    switch (viewRole) {
      case "patient":
        navigate("/patient/appointments");
        break;
      case "admin":
        navigate("/patient/appointments");
        break;
      default:
        navigate("/");
    }
  };

  return (
    <section className="w-full flex flex-col ">
      <div className="w-full flex justify-center space-x-1 my-2  md:my-4 lg:my-6">
        <p className="text-textColor font-medium  md:text-lg lg:text-xl ">
          Book an Appointment
        </p>
      </div>

      <div className="mx-2 flex justify-center">
        {isLaoding ? (
          <div className="w-full flex justify-center">
            <Loader />
          </div>
        ) : (
          <div className="w-full p-2 sm:w-[90%] md:w-[85%] lg:w-[80%] xl:w-[75%]">
            <p className="w-full text-left border-b border-designColor2 text-textColor font-semibold my-2">
              Enter details:{" "}
            </p>

            <form
              action=""
              onSubmit={handleSubmit}
              className="flex flex-col space-y-2 md:space-y-3"
            >
              <label>
                <p className="text-sm text-textColor">Patient name</p>
                <FormInput
                  id="name"
                  name="name"
                  type="text"
                  required={true}
                  placeholder="Patient name"
                  value={newAppointmentDetails.patientName}
                  handleChange={handlePateintNameChange}
                />
              </label>

              <label>
                <p className="text-sm text-textColor">Patient CNIC</p>
                <FormInput
                  id="patient-id"
                  name="patient-id"
                  type="text"
                  required={true}
                  placeholder="Patient Id"
                  value={newAppointmentDetails.patientCnic}
                  handleChange={handlePatientCnicChange}
                />
              </label>

              <label>
                <p className="text-sm text-textColor">Problem Field</p>
                <select
                  onChange={handleFieldChange}
                  required
                  className="w-full bg-white  text-textColor my-1 p-1 border-designColor2 border rounded focus:outline-none focus:border-textColor"
                >
                  <option value="">none selected</option>
                  {doctorFields.map((field, index) => (
                    <option key={index} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <p className="text-sm text-textColor">Doctors</p>
                {newAppointmentDetails.doctorField == "" ? (
                  "Please choose a field first"
                ) : (
                  <select
                    onChange={handleDoctorChange}
                    required
                    className="w-full bg-white  text-textColor my-1 p-1 border-designColor2 border rounded focus:outline-none focus:border-textColor"
                  >
                    <option value="">none selected</option>
                    {selectedDoctorsNameAndId.map((field, index) => (
                      <option key={index} value={field.id}>
                        {field.name}
                      </option>
                    ))}
                  </select>
                )}
              </label>

              <label>
                <p className="text-sm text-textColor">Date </p>
                {newAppointmentDetails.doctorName == "" ? (
                  "Please seleact a doctor first"
                ) : (
                  <input
                    type="date"
                    name="dated"
                    id="dated"
                    min={minDate}
                    max={maxDate}
                    onChange={handleAppointmentDateChange}
                    required
                    className="w-full bg-white  text-textColor my-1 p-1 border-designColor2 border rounded focus:outline-none focus:border-textColor"
                  />
                )}
              </label>

              <label>
                <p className="text-sm text-textColor">Time </p>
                {newAppointmentDetails.dated == 0 ? (
                  "Please select a Date first"
                ) : isScheduleLoading ? (
                  "schedule Loading..."
                ) : (
                  <select
                    onChange={handleAppointmentTime}
                    required
                    className="w-full bg-white  text-textColor my-1 p-1 border-designColor2 border rounded focus:outline-none focus:border-textColor"
                  >
                    <option value="">none selected</option>
                    {[...Array(selectedDoctor.maxAppointments)].map(
                      (_, index) => (
                        <option
                          key={index}
                          value={selectedDoctor.appointmentHours.start + index}
                          disabled={selectedDateSchedule.appointedHours.includes(
                            index
                          )}
                          className={`${
                            selectedDateSchedule.appointedHours.includes(index)
                              ? "text-red-800 font-semibold text-sm"
                              : "text-textColor "
                          }`}
                        >
                          {selectedDoctor.appointmentHours.start + index > 12
                            ? `${
                                (selectedDoctor.appointmentHours.start +
                                  index) %
                                12
                              } P.M`
                            : `${
                                selectedDoctor.appointmentHours.start + index
                              } A.M`}
                          {" - "}
                          {selectedDateSchedule.appointedHours.includes(index)
                            ? "Booked"
                            : "Available"}
                        </option>
                      )
                    )}
                  </select>
                )}
              </label>

              <label htmlFor="pre-details">
                <p className="text-sm text-textColor">
                  Discuss Details 
                </p>
                <textarea
                  className="w-full bg-white  text-textColor my-1 p-1 border-designColor2 border rounded focus:outline-none focus:border-textColor"
                  id="pre-details"
                  name="pre-details"
                  type="text"
                  placeholder="Name"
                  value={newAppointmentDetails.pre}
                  onChange={handlePreMessageChange}
                />
              </label>

              <Button
                type="submit"
                text={"submit for approval"}
                disabled={isSubmitting}
              />
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
