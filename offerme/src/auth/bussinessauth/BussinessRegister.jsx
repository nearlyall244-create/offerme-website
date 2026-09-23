import RegisterForm from '../RegisterForm'

export default function BusinessRegister() {
  return (
    <RegisterForm
      role="business"
      title="Create Business Account"
      subtitle="List your business and reach more local customers on OfferMe"
      loginPath="/auth/business/login"
      loginLabel="Login"
    />
  )
}
