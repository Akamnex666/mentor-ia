import { redirect } from "next/navigation";

export default function LoginRedirectPage() {
  // Redirige a la ruta de autenticación que implementamos
  redirect("/auth/login");
}
