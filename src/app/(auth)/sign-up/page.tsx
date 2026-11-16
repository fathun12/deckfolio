import { SignUpForm } from "@/features/auth/ui/SignUpForm";
import { signUpAction, signInWithGoogleAction } from "@/server/actions/auth.actions";

export const metadata = { title: "Sign up" };

export default function SignUpPage() {
  return <SignUpForm action={signUpAction} googleAction={signInWithGoogleAction} />;
}