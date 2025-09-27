import DashboardLayout from "@/components/DashboardLayout";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This is now a server component
  // Any server-side data fetching would happen here
  
  return <DashboardLayout>{children}</DashboardLayout>;
}
