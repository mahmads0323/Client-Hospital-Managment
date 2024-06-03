import { useEffect, useState } from "react";
import Loader from "../../../Components/loader";
import DoctorTable from "../../../Components/doctorTable";
import getDoctorsByStatus from "../../../services/doctor/getByStatus";
import useErrorContext from "../../../context/errorContext";

const itemsToShowAtATime = 5;

export default function Doctors() {
  const { addError } = useErrorContext();

  //   approved doctors
  const [approvedDoctors, setApprovedDoctors] = useState([]);
  const [approvedDoctorsLoading, setApprovedDoctorsLoading] = useState(true);

  const [approvedDoctorItemsRange, setApprovedDoctorItemsRange] = useState({
    start: 0,
    end: itemsToShowAtATime - 1,
  });
  const [approvedDoctorTotalItems, setApprovedDoctorTotalItems] = useState(0);

  //   pending doctors
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [pendingDoctorsLoading, setPendingDoctorsLoading] = useState(true);

  const [pendingDoctorItemsRange, setPendingDoctorItemsRange] = useState({
    start: 0,
    end: itemsToShowAtATime - 1,
  });
  const [pendingDoctorTotalItems, setPendingDoctorTotalItems] = useState(0);

  const makeApprovedDoctorsDataRequest = async () => {
    setApprovedDoctorsLoading(true);
    const { responseData, error } = await getDoctorsByStatus(
      itemsToShowAtATime,
      approvedDoctorItemsRange.start,
      "approved"
    );
    if (error) {
      addError(error);
      setApprovedDoctorsLoading(false);
      return;
    }
    if (!responseData.data) {
      addError(responseData.message);
      setApprovedDoctorsLoading(false);
      return;
    }
    setApprovedDoctorTotalItems(responseData.count);
    setApprovedDoctors(responseData.data);
    setApprovedDoctorsLoading(false);
  };

  const makePendingDoctorsDataRequest = async () => {
    setPendingDoctorsLoading(true);
    const { responseData, error } = await getDoctorsByStatus(
      itemsToShowAtATime,
      approvedDoctorItemsRange.start,
      "pending"
    );
    if (error) {
      addError(error);
      setPendingDoctorsLoading(false);
      return;
    }
    if (!responseData.data) {
      addError(responseData.message);
      setPendingDoctorsLoading(false);
      return;
    }
    setPendingDoctorTotalItems(responseData.count);
    setPendingDoctors(responseData.data);
    setPendingDoctorsLoading(false);
  };

  useEffect(() => {
    makeApprovedDoctorsDataRequest();
  }, [approvedDoctorItemsRange]);

  useEffect(() => {
    makePendingDoctorsDataRequest();
  }, [pendingDoctorItemsRange]);

  return (
    <section className="w-full flex flex-col ">
      {/* pending doctors */}

      <div className="w-full flex justify-center space-x-1 my-2  md:my-4 lg:my-6">
        <p className="text-textColor font-medium  md:text-lg lg:text-xl ">
          Pending Doctor(s)
        </p>
      </div>
      <div className="px-2 ">
        {pendingDoctorsLoading ? (
          <Loader />
        ) : (
          <div className="px-2 ">
            <DoctorTable
              doctors={pendingDoctors}
              tableTitle={"Pending Doctors"}
              itemsRange={pendingDoctorItemsRange}
              itemsToShowAtATime={itemsToShowAtATime}
              totalItems={pendingDoctorTotalItems}
              setItemsRange={setPendingDoctorItemsRange}
              viewRole="admin"
            />
          </div>
        )}
      </div>

      {/* Approved doctors */}

      <div className="w-full flex justify-center space-x-1 my-2  md:my-4 lg:my-6">
        <p className="text-textColor font-medium  md:text-lg lg:text-xl ">
          Approved Doctor(s)
        </p>
      </div>

      <div className="px-2 ">
        {approvedDoctorsLoading ? (
          <Loader />
        ) : (
          <div className="px-2 ">
            <DoctorTable
              doctors={approvedDoctors}
              tableTitle={"Notifications"}
              itemsRange={approvedDoctorItemsRange}
              itemsToShowAtATime={itemsToShowAtATime}
              totalItems={approvedDoctorTotalItems}
              setItemsRange={setApprovedDoctorItemsRange}
              viewRole="admin"
            />
          </div>
        )}
      </div>
    </section>
  );
}
