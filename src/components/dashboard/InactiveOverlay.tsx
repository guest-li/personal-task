export default function InactiveOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-8 text-center shadow-xl">
        <div className="mb-4 text-5xl">🔒</div>
        <h1 className="mb-4 text-2xl font-bold text-gray-900">Account Inactive</h1>
        <p className="text-gray-600">
          Your account is inactive — Please contact the administrator to activate your account.
        </p>
      </div>
    </div>
  );
}
