import type { Metadata } from 'next';

import { AuthForm } from '@/components/auth/AuthForm';

export const metadata: Metadata = {
  title: 'Iniciar sesion - Jobtrack',
};

export default function SignInPage() {
  return <AuthForm mode="signIn" />;
}
