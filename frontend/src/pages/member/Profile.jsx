import MemberLayout from "../../components/common/MemberLayout";
import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export default function Profile() {
  const [profile, setProfile] = useState(null); const [error, setError] = useState("");
  useEffect(() => { apiFetch("/api/users/me").then((data) => setProfile(data.profile)).catch((e) => setError(e.message)); }, []);
  return <MemberLayout><main className="content-page"><p className="eyebrow">MEMBER ACCOUNT</p><h1>Profile</h1>{error && <p className="form-error">{error}</p>}<div className="account-card"><span className="large-avatar">{profile?.fullName?.[0] || "M"}</span><h2>{profile?.fullName || "Club member"}</h2><p>Member account · {profile?.role || "MEMBER"}</p></div></main></MemberLayout>;
}
