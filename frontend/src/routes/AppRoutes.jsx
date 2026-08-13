import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import ProtectedRoute from "./ProtectedRoute";

import Landing from "../pages/Landing";

import Dashboard from "../pages/member/Dashboard";
import Chat from "../pages/member/Chat";
import Chats from "../pages/member/Chats";
import Documents from "../pages/member/Documents";
import Profile from "../pages/member/Profile";
import Settings from "../pages/member/Settings";
import AdminDocuments from "../pages/member/AdminDocuments";

function AppRoutes() {
  return (
    <Routes>
      {/* Authentication */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/sign-in"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/sign-up"
        element={<Register />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      {/* Protected member routes */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/chat"
          element={<Chat />}
        />

        <Route
          path="/chats"
          element={<Chats />}
        />

        <Route
          path="/documents"
          element={<Documents />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

        {/* Admin */}
        <Route
          path="/admin/documents"
          element={<AdminDocuments />}
        />
      </Route>

      {/* Default */}
      <Route
        path="/"
        element={<Landing />}
      />

      {/* Temporary testing */}
      <Route
        path="/profile-test"
        element={
          <Navigate
            to="/profile"
            replace
          />
        }
      />

      {/* Unknown route */}
      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}

export default AppRoutes;