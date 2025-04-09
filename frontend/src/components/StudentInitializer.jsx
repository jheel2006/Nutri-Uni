import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { initStudent } from "../api/students";

function StudentInitializer() {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    const run = async () => {
      if (isSignedIn && user?.publicMetadata?.role !== "admin") {
        try {
          await initStudent(user.id, user.emailAddresses[0].emailAddress);
          console.log("Student initialized!");
        } catch (err) {
          console.error("Error initializing student:", err.message);
        }
      }
    };

    run();
  }, [isSignedIn, user]);

  return null;
}

export default StudentInitializer;
