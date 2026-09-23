import RegisterForm from '../RegisterForm'

export default function UserRegister() {
  return (
    <RegisterForm
      role="user"
      title="Create User Account"
      subtitle="Join OfferMe to discover local deals"
      loginPath="/auth/user/login"
      loginLabel="Login"
    />
  )
}
