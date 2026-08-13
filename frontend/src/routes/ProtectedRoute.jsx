import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { authClient } from "../lib/auth";
import { apiFetch } from "../lib/api";

function ProtectedRoute() {
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!session) return undefined;
    let active = true;
    apiFetch("/api/users/me").then(() => {
      if (active) console.info("Club member profile synchronized");
    }).catch((error) => {
      if (active) console.error("Club member profile synchronization failed:", error.message);
    });
    return () => {
      active = false;
    };
  }, [session]);

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
