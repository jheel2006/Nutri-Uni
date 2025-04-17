//RoleRedirector.jsx - to redirect users based on their roles from / to the dashboards

import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const RoleRedirector = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) return;

    const role = user.publicMetadata?.role;
    const currentPath = location.pathname;

    if (currentPath === "/") {
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "student") {
        navigate("/student/dashboard");
      }
    }
  }, [user, location, navigate]);

  return null;
};

export default RoleRedirector;
