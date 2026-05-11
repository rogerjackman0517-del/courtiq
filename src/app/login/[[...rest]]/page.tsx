import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-barlow)] font-black text-3xl text-[#F0F0F0] mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-[#888899]">Sign in to your CourtIQ account</p>
        </div>
        <SignIn
          appearance={{
            variables: {
              colorPrimary: "#C8A84B",
              colorBackground: "#111118",
              colorText: "#F0F0F0",
              colorTextSecondary: "#888899",
              colorInputBackground: "#1A1A24",
              colorInputText: "#F0F0F0",
              borderRadius: "0.75rem",
            },
            elements: {
              card: "bg-[#111118] border border-white/[0.06] shadow-2xl",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "bg-[#1A1A24] border border-white/[0.06] text-[#F0F0F0] hover:bg-[#1A1A24]/80",
              formButtonPrimary: "bg-[#C8A84B] hover:bg-[#D4B55F] text-black font-bold",
              footerAction: "text-[#888899]",
            },
          }}
        />
      </div>
    </div>
  );
}
