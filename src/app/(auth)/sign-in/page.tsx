import { SignInForm } from "@/features/auth/ui/SignInForm";
import { signInAction, signInWithGoogleAction } from "@/server/actions/auth.actions";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return <SignInForm action={signInAction} googleAction={signInWithGoogleAction} />;
}