import dynamic from 'next/dynamic';

const SignupClient = dynamic(
   () =>
      import('../../page-components/signup/ui/SignupClient').then(
         (m) => m.SignupClient
      ),
   { ssr: false }
);

export default function SignupPage() {
   return <SignupClient />;
}
