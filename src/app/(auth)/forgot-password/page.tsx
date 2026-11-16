import { ForgotPasswordForm } from "@/features/auth/ui/ForgotPasswordForm";
import { forgotPasswordAction } from "@/server/actions/auth.actions";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm action={forgotPasswordAction} />;
}