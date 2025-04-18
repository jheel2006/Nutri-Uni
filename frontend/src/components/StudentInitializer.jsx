import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";
import { initStudent } from "../api/students";

function StudentInitializer() {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const run = async () => {
      if (
        isSignedIn &&
        user?.publicMetadata?.role !== "admin" &&
        location.pathname === "/"
      ) {
        try {
          await initStudent(user.id, user.emailAddresses[0].emailAddress);
          console.log("Student initialized!");
          navigate("/student/dashboard");
        } catch (err) {
          console.error("Error initializing student:", err.message);
        }
      }
    };

    run();
  }, [isSignedIn, user, navigate, location]);

  return null;
}

export default StudentInitializer;
