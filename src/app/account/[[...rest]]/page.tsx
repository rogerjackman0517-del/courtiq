import { UserProfile } from "@clerk/nextjs";

export default function AccountPage() {
  return (
    <div className="flex justify-center px-4 py-10">
      <UserProfile
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
            card: "bg-[#111118] border border-white/[0.06]",
            navbar: "bg-[#0A0A0F]",
            navbarButton: "text-[#888899] hover:text-[#F0F0F0]",
          },
        }}
      />
    </div>
  );
}
