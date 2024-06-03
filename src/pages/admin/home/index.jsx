import { useEffect, useState } from "react";
import { SampleAdmins } from "../../../sampleData/sampleAdmins";
import Loader from "../../../Components/loader";
import { SampleNotifications } from "../../../sampleData/sampleNotification";
import NotificationTable from "../../../Components/notificationTable";
import CustomLink from "../../../Components/link";
import getAdminUsingCookie from "../../../services/admin/getAdminUsingCookie";
import useErrorContext from "../../../context/errorContext";
import getAllNotification from "../../../services/notification/getAllNotification";

const sampleAdmin = SampleAdmins[0];
const itemsToShowAtATime = 5;

export default function Home() {
  const [admin, setAdmin] = useState({});
  const [adminLoading, setAdminLoading] = useState(true);

  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(true);
  const [itemsRange, setItemsRange] = useState({
    start: 0,
    end: itemsToShowAtATime - 1,
  });
  const [totalItems, setTotalItems] = useState(0);
  const [totalNotifications, setTotalNotifucations] = useState(0);

  const { addError } = useErrorContext();

  const makeAdminDataRequest = async () => {
    setAdminLoading(true);
    const { responseData, error } = await getAdminUsingCookie();
    if (error) {
      addError(error);
      setAdminLoading(false);
      return;
    }
    if (!responseData.data) {
      addError(responseData.message);
      setAdminLoading(false);
      return;
    }
    setAdmin(responseData.data);
    setAdminLoading(false);
  };

  const makeAdminNotificationRequest = async () => {
    setNotificationLoading(true);
    const {repsonseData, error} = await getAllNotification(itemsToShowAtATime, itemsRange.start);
    if(error){
      addError(error)
      setNotificationLoading(false)
      return;
    }
    if(!repsonseData.data){
      addError(repsonseData.message)
      setNotificationLoading(false)
      return;
    }

    setTotalItems(repsonseData.count)
    setNotifications(repsonseData.data)
    setNotificationLoading(false)
  };

  useEffect(() => {
    makeAdminDataRequest();
  }, []);

  useEffect(() => {
    makeAdminNotificationRequest();
  }, [admin, itemsRange]);

  return (
    <section className="w-full flex flex-col items-center ">
      <p className="text-textColor font-medium my-2 w-full text-center md:text-lg md:my-4 lg:text-xl lg:my-6">
        Welcome to Admin Dashboard
      </p>

      {adminLoading ? (
        <Loader />
      ) : (
        <div className="w-full p-2 sm:w-[90%] md:w-[85%] lg:w-[80%] xl:w-[75%]">
          <div className="flex flex-col px-2 text-xs sm:text-sm md:text-base">
            <div className="py-2">
              <p className="w-full text-left border-b border-designColor2 text-textColor font-semibold my-2">
                Personal details:{" "}
              </p>

              <h2>
                Name: <span className="font-semibold">{admin.name}</span>
              </h2>
              <h2>
                Email: <span className="font-semibold">{admin.email}</span>
              </h2>
              <h2>
                Gender:{" "}
                <span className="font-semibold capitalize">{admin.gender}</span>
              </h2>
              <h2>
                Age: <span className="font-semibold">{admin.age}</span>
              </h2>
              <CustomLink to="/admin/edit" text={"Edit"} />
            </div>

            <div>
              <p className="w-full text-left border-b border-designColor2 text-textColor font-semibold my-2">
                New Notifications{" "}
                <span className="text-sm text-red-700">
                  {totalNotifications}
                </span>
              </p>
              <div>
                {notificationLoading ? (
                  <Loader />
                ) : notifications.length == 0 ? (
                  "no new notifications"
                ) : (
                  <NotificationTable
                    notifications={notifications}
                    itemsRange={itemsRange}
                    totalItems={totalItems}
                    tableTitle={"Notifications"}
                    itemsToShowAtATime={itemsToShowAtATime}
                    setItemsRange={setItemsRange}
                    viewRole="admin"
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
