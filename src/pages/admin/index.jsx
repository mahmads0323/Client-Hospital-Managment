import { Route, Routes } from "react-router-dom";
import Home from "./home";
import AdminMenu from "./menu";
import NotificationView from "../../Components/notificationView";
import AdminNotifications from "./notifications";
import Patients from "./patients";
import PatientView from "../../Components/patientView";
import AppointmentView from "../../Components/appointmentView";
import Appointments from "./appointments";
import DoctorView from "../../Components/doctorView";
import Doctors from "./doctor";
import NotFoundPage from "../not-found";
import NewAppointment from "../new-appointment";
import EditAdmin from "./edit";

export default function Admin() {
  return (
    <main className="w-full  lg:min-h-screen">
      <div className="w-full lg:fixed lg:h-screen lg:w-[25%] ">
        <AdminMenu />
      </div>

      <div className="w-full lg:ml-[25%] lg:w-[75%]">
        <Routes>
          <Route path="/">
            <Route path="" element={<Home />} />
            <Route path="edit" element={<EditAdmin />} />

            <Route path="/notifications">
              <Route path="" element={<AdminNotifications />} />
              <Route
                path=":notificationId"
                element={<NotificationView viewRole="admin" />}
              />
            </Route>

            <Route path="/patients">
              <Route path="" element={<Patients />} />
              <Route
                path=":patientId"
                element={<PatientView viewRole="admin" />}
              />
            </Route>

            <Route path="/doctors">
              <Route path="" element={<Doctors />} />
              <Route
                path=":doctorId"
                element={<DoctorView viewRole="admin" />}
              />
            </Route>

            <Route path="/appointments">
              <Route path="" element={<Appointments />} />
              <Route path="new" element={<NewAppointment viewRole="admin" />} />
              <Route
                path=":appointmentId"
                element={<AppointmentView viewRole="admin" />}
              />
            </Route>

            <Route path="*" element={<NotFoundPage redirectTo="/admin" />} />
          </Route>
        </Routes>
      </div>
    </main>
  );
}
