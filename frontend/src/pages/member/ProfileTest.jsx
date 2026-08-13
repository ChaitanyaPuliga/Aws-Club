import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

function ProfileTest() {
  const [result, setResult] = useState("Loading...");

  useEffect(() => {
    apiFetch("/api/users/me")
      .then((data) => {
        setResult(JSON.stringify(data, null, 2));
      })
      .catch((error) => {
        setResult(`Error: ${error.message}`);
      });
  }, []);

  return (
    <div>
      <h1>Profile API Test</h1>
      <pre>{result}</pre>
    </div>
  );
}

export default ProfileTest;