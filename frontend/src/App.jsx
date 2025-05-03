


import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import {
  SignedIn,
  SignedOut,
  SignInButton,UserButton
} from "@clerk/clerk-react";

import ProtectedRoute from "./components/ProtectedRoute";
import StudentInitializer from "./components/StudentInitializer";
import AddFoodItemForm from "./components/AddFoodItemForm";
import AddMenuItemForm from "./components/AddMenuItemForm";
import RoleRedirector from "./components/RoleRedirector";
import UserProfile from "./components/UserProfile";
import LandingPage from "./components/LandingPage"; //used as modal 

function App() {
  const [showLanding, setShowLanding] = useState(true); 

  return (
    <Router>
      {/* Show Landing Modal for signed-out users */}
      <SignedOut>
        {showLanding && <LandingPage onClose={() => setShowLanding(false)} />}
      </SignedOut>

      <SignedIn>
        <RoleRedirector />
        <StudentInitializer />
        {/* <UserButton /> */}
      </SignedIn>

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
          path="/admin/add-item"
          element={
            <SignedIn>
              <ProtectedRoute roleRequired={["admin"]}>
                <AddFoodItemForm />
              </ProtectedRoute>
            </SignedIn>
          }
        />

        <Route
          path="/admin/add-to-menu"
          element={
            <SignedIn>
              <ProtectedRoute roleRequired={["admin"]}>
                <AddMenuItemForm />
              </ProtectedRoute>
            </SignedIn>
          }
        />

        <Route
          path="/student/profile"
          element={
            <SignedIn>
              <ProtectedRoute roleRequired={["student", undefined]}>
                <UserProfile />
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
  );
}

export default App;
