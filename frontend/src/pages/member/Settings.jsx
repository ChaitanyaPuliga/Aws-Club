import MemberLayout from "../../components/common/MemberLayout";

export default function Settings() {
  return <MemberLayout><main className="content-page"><p className="eyebrow">PREFERENCES</p><h1>Settings</h1><div className="settings-card"><h2>Account security</h2><p>Password and account recovery are managed securely through the authentication service.</p><p>Use “Forgot password?” on the login page to request a reset link.</p></div></main></MemberLayout>;
}
