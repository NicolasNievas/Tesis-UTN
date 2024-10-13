export default function ErrorHandler(errorCode: string, message: string) {
  switch (errorCode) {
    case "auth/weak-password":
      return "The password is too weak."
    case "auth/email-already-in-use":
      return "This email address is already in use by another account."
    case "auth/invalid-credential":
      return "This email/password are invalid."
    case "auth/invalid-email":
      return "This email address is invalid."
    case "auth/operation-not-allowed":
      return "Email/password accounts are not enabled."
    case "auth/user-disabled":
      return "Email account is disabled."
    case "auth/unauthorized-domain":
      return "This domain hasn`t access."
    default:
      return message
  }
}