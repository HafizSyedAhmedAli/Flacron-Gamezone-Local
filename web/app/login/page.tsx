import dynamic from 'next/dynamic';

const LoginClient = dynamic(
   () =>
      import('../../page-components/login/ui/LoginClient').then(
         (m) => m.LoginClient
      ),
   { ssr: false }
);

export default function LoginPage() {
   return <LoginClient />;
}
