import { NeonAuthUIProvider } from "@neondatabase/auth-ui";
import "@neondatabase/auth-ui/css";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import { authClient } from "../../lib/auth";

function AuthLink({ href, ...props }) {
  return <RouterLink to={href} {...props} />;
}

function AuthProvider({ children }) {
  const navigate = useNavigate();

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      basePath=""
      navigate={navigate}
      replace={(to) => navigate(to, { replace: true })}
      redirectTo="/dashboard"
      Link={AuthLink}
    >
      {children}
    </NeonAuthUIProvider>
  );
}

export default AuthProvider;
