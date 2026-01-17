export default function TwoFactorAuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <div className="flex flex-col gap-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Two-Factor Authentication</h1>
        <p>Enter the code from your authenticator app.</p>
      </div>
    </div>
  );
}
