import { useEffect, useState } from "react";
import Loader from "../../../Components/loader";
import AppointmentTable from "../../../Components/appointmentsTable";
import CustomLink from "../../../Components/link";
import getByCookie from "../../../services/patient/getByCookie";
import useErrorContext from "../../../context/errorContext";
import getByStatus from "../../../services/appointment/getByStatus";

const itemsToShowAtATime = 5;

export default function Home() {
  const [patient, setPatient] = useState({});
  const [scheduledAppointments, setScheduledAppointmnts] = useState([]);
  const [scheduledAppointmentsLoading, setScheduledAppointmentsLoading] =
    useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [itemsRange, setItemsRange] = useState({
    start: 0,
    end: itemsToShowAtATime - 1,
  });
  const [totalItems, setTotalItems] = useState(0);

  const { addError } = useErrorContext();

  const makePatientDataRequest = async () => {
    setIsLoading(true);
    const { reponseData, error } = await getByCookie();
    if (error) {
      addError(error);
      setIsLoading(false);
      return;
    }
    if (!reponseData.data) {
      addError(reponseData.message);
      setIsLoading(false);
      return;
    }
    setPatient(reponseData.data);
    setIsLoading(false);
  };

  const makeScheduledAppointmentsRequest = async () => {
    setScheduledAppointmentsLoading(true);
    const { reponseData, error } = await getByStatus(
      "scheduled",
      itemsToShowAtATime,
      itemsRange.start
    );
    if (error) {
      addError(error);
      setScheduledAppointmentsLoading(false);
      return;
    }
    if (!reponseData.data) {
      addError(reponseData.message);
      setScheduledAppointmentsLoading(false);
      return;
    }
    setTotalItems(reponseData.count);
    setScheduledAppointmnts(reponseData.data);
    setScheduledAppointmentsLoading(false);
  };

  useEffect(() => {
    makePatientDataRequest();
  }, []);

  useEffect(() => {
    makeScheduledAppointmentsRequest();
  }, [patient]);

  return (
    <section className="w-full flex flex-col items-center ">
      <p className="text-textColor font-medium my-2 w-full text-center md:text-lg md:my-4 lg:text-xl lg:my-6">
        Welcome to Patient Dashboard
      </p>

      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full p-2 sm:w-[90%] md:w-[85%] lg:w-[80%] xl:w-[75%]">
          <div className="flex flex-col px-2 text-xs sm:text-sm md:text-base">
            <div className="py-2">
              <p className="w-full text-left border-b border-designColor2 text-textColor font-semibold my-2">
                Personal details:{" "}
              </p>

              <h2>
                Name: <span className="font-semibold">{patient.name}</span>
              </h2>
              <h2>
                Email: <span className="font-semibold">{patient.email}</span>
              </h2>
              <h2>
                Gender:{" "}
                <span className="font-semibold capitalize">
                  {patient.gender}
                </span>
              </h2>
              <h2>
                Age: <span className="font-semibold">{patient.age}</span>
              </h2>
              <CustomLink to="/patient/edit" text={"Edit"} />
            </div>

            <div className="py-2 md:py-4">
              <p className="w-full text-left border-b border-designColor2 text-textColor font-semibold my-2">
                Scheduled Appointments:{" "}
              </p>
              <div>
                {scheduledAppointmentsLoading ? (
                  <Loader />
                ) : scheduledAppointments.length == 0 ? (
                  "no Schduled appointments"
                ) : (
                  <AppointmentTable
                    tableTitle={"Notifications"}
                    itemsRange={itemsRange}
                    itemsToShowAtATime={itemsToShowAtATime}
                    appointments={scheduledAppointments}
                    totalItems={totalItems}
                    setItemsRange={setItemsRange}
                    viewRole="patient"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
