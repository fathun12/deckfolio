import { ResetPasswordForm } from "@/features/auth/ui/ResetPasswordForm";
import { resetPasswordAction } from "@/server/actions/auth.actions";

export const metadata = { title: "New password" };

export default function ResetPasswordPage() {
  return <ResetPasswordForm action={resetPasswordAction} />;
}