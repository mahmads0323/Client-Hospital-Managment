import { useEffect, useState } from "react";
import PatientsTable from "../../../Components/patientsTable";
import Loader from "../../../Components/loader";
import getAllPatients from "../../../services/patient/getAll";
import useErrorContext from "../../../context/errorContext";

const itemsToShowAtATime = 5;

export default function MyPatients() {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [itemsRange, setItemsRange] = useState({
    start: 0,
    end: itemsToShowAtATime - 1,
  });
  const [totalItems, setTotalItems] = useState(0);

  const { addError } = useErrorContext();

  const makePateintsDataRequest = async () => {
    setIsLoading(true);
    const { responseData, error } = await getAllPatients(
      itemsToShowAtATime,
      itemsRange.start
    );
    if (error) {
      addError(error);
      setIsLoading(false);
      return;
    }
    if (!responseData.data) {
      addError(responseData.message);
      setIsLoading(false);
      return;
    }
    setPatients(responseData.data);
    setTotalItems(responseData.count);
    setIsLoading(false);
  };

  useEffect(() => {
    makePateintsDataRequest();
  }, [itemsRange]);

  return (
    <section className="w-full flex flex-col ">
      <p className="text-textColor font-medium my-2 w-full text-center md:text-lg md:my-4 lg:text-xl lg:my-6">
        Patients(s)
      </p>

      {isLoading ? (
        <Loader />
      ) : (
        <div className="px-2 ">
          <PatientsTable
            patients={patients}
            itemsToShowAtATime={itemsToShowAtATime}
            totalItems={totalItems}
            itemsRange={itemsRange}
            viewRole="doctor"
            setItemsRange={setItemsRange}
          />
        </div>
      )}
    </section>
  );
}
