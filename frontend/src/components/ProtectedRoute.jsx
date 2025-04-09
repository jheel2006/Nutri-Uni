import { useUser } from "@clerk/clerk-react";

function ProtectedRoute({ roleRequired, children }) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <p>Loading...</p>;

  const role = user?.publicMetadata?.role || "student";

  if (roleRequired.includes(role)) {
    return children;
  } else {
    return <p className="p-4 text-red-500">🚫 Access Denied</p>;
  }
}

export default ProtectedRoute;
