import { useEffect, useState } from "react";
import { createContext } from "react";
import { useCookies } from "react-cookie";
import validateToken from "../../services/validateToken";
import useErrorContext from "../errorContext";
import { useNavigate } from "react-router-dom";

export const UserContext = createContext(null);

const UserContextProvider = ({ children }) => {
  const [currentRole, setCurrentRole] = useState(null);
  const [cookies, setCookie, removeCookie] = useCookies(["token"]);

  const navigate = useNavigate();
  const { addError } = useErrorContext();

  const validateRoleDataRequest = async (token = cookies.token) => {
    const { responseData, error } = await validateToken(token);
    if (error) {
      addError(error);
      return null;
    }
    if (!responseData.role) {
      addError(responseData.message);
      setCurrentRole(null);
      return null;
    }
    setCurrentRole(responseData.role);
    if (!window.location.pathname.startsWith(`/${responseData.role}`)) {
      navigate(`/${responseData.role}`);
    }
    return responseData.role;
  };

  useEffect(()=>{
    validateRoleDataRequest()
  }, [])

  const handleSetCookie = (token) => {
    setCookie("token", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      secure: true,
    }); // 7 days
    validateRoleDataRequest(token);
  };

  const handleLogout = () => {
    removeCookie("token");
    navigate("/");
  };

  return (
    <UserContext.Provider
      value={{
        currentRole,
        validateRoleDataRequest,
        handleSetCookie,
        handleLogout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
