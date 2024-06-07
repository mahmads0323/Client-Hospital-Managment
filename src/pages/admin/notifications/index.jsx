import { useEffect, useState } from "react";
import Loader from "../../../Components/loader";
import NotificationTable from "../../../Components/notificationTable";
import useErrorContext from "../../../context/errorContext";
import getAllNotification from "../../../services/notification/getAllNotification";

const itemsToShowAtATime = 5;

export default function AdminNotifications() {
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const [itemsRange, setItemsRange] = useState({
    start: 0,
    end: itemsToShowAtATime - 1,
  });
  const [totalItems, setTotalItems] = useState(0);
  const { addError } = useErrorContext();

  const makeAdminNotificationRequest = async () => {
    setIsLoading(true);
    const { repsonseData, error } = await getAllNotification(
      itemsToShowAtATime,
      itemsRange.start
    );
    if (error) {
      addError(error);
      setIsLoading(false);
      return;
    }
    if (!repsonseData.data) {
      addError(repsonseData.message);
      setIsLoading(false);
      return;
    }
    setTotalItems(repsonseData.count);
    setNotifications(repsonseData.data);
    setIsLoading(false);
  };

  useEffect(() => {
    makeAdminNotificationRequest();
  }, [itemsRange]);

  return (
    <section className="w-full flex flex-col ">
      <p className="text-textColor font-medium my-2 w-full text-center md:text-lg md:my-4 lg:text-xl lg:my-6">
        Notification(s)
      </p>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="px-2 ">
          <NotificationTable
            notifications={notifications}
            itemsRange={itemsRange}
            totalItems={totalItems}
            itemsToShowAtATime={itemsToShowAtATime}
            tableTitle={"Notifications"}
            viewRole="admin"
            setItemsRange={setItemsRange}
          />
        </div>
      )}
    </section>
  );
}
