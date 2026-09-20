import { redirect } from "next/navigation";
// [ROLE SELECTOR TEMPORARILY HIDDEN - APP IS CURRENTLY USER/CUSTOMER ONLY - DO NOT DELETE]
// import RoleSelector from "@/components/RoleSelector";

export default function Page() {
  // Directly open the user side app
  redirect("/customer");
  // return <RoleSelector />;
}

