import { useEffect, useState } from "react";
import AppointmentTable from "../../../Components/appointmentsTable";
import Loader from "../../../Components/loader";
import getAllAppointments from "../../../services/appointment/getAll";
import useErrorContext from "../../../context/errorContext";

const itemsToShowAtATime = 5;

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [itemsRange, setItemsRange] = useState({
    start: 0,
    end: itemsToShowAtATime - 1,
  });
  const [totalItems, setTotalItems] = useState(0);

  const {addError} = useErrorContext()

  const makeAppointmentsDataRequest = async() => {
    setIsLoading(true);
    const { reponseData, error } = await getAllAppointments(
      itemsToShowAtATime,
      itemsRange.start
    );
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

    setTotalItems(reponseData.count);
    setAppointments(reponseData.data);
    setIsLoading(false)
  };

  useEffect(() => {
    makeAppointmentsDataRequest();
  }, [itemsRange]);

  return (
    <section className="w-full flex flex-col ">
      <div className="w-full flex justify-center space-x-1 my-2  md:my-4 lg:my-6">
        <p className="text-textColor font-medium  md:text-lg lg:text-xl ">
          Appointment(s)
        </p>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <div className="px-2 ">
          <AppointmentTable
            tableTitle={"Notifications"}
            itemsRange={itemsRange}
            itemsToShowAtATime={itemsToShowAtATime}
            appointments={appointments}
            totalItems={totalItems}
            setItemsRange={setItemsRange}
            viewRole="doctor"
          />
        </div>
      )}
    </section>
  );
}
