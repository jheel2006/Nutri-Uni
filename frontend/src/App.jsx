import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import ProtectedRoute from "./components/ProtectedRoute"; // adjust path if needed
import StudentInitializer from "./components/StudentInitializer";

function App() {
  return (
    <>
      <header className="p-4 flex justify-between">
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>

      <SignedIn>
        <StudentInitializer />
      </SignedIn>

      <Router>
        <Routes>
          <Route
            path="/admin/dashboard"
            element={
              <SignedIn>
                <ProtectedRoute roleRequired={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              </SignedIn>
            }
          />
          <Route
            path="/student/dashboard"
            element={
              <SignedIn>
                <ProtectedRoute roleRequired={["student", undefined]}>
                  <StudentDashboard />
                </ProtectedRoute>
              </SignedIn>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
