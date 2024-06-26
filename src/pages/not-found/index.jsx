import { useNavigate } from "react-router-dom";
import Button from "../../Components/button";

export default function NotFoundPage({ redirectTo = "/" }) {
  const navigate = useNavigate();
  const hanldeClick = () => {
    navigate(redirectTo, { replace: true });
  };
  return (
    <section className="w-full h-screen flex flex-col items-center justify-center space-y-2">
      <p>You are not supposed to be here</p>
      <Button text={"Home"} handleOnClick={hanldeClick} />
    </section>
  );
}
