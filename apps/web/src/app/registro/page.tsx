import type { Metadata } from 'next';

import { AuthForm } from '@/components/auth/AuthForm';

export const metadata: Metadata = {
  title: 'Crear cuenta gratis',
};

export default function SignUpPage() {
  return <AuthForm mode="signUp" />;
}
