import { getCurrentUser } from "./auth";

export async function getCurrentTenant() {
  const currentUser = await getCurrentUser();

  if (!currentUser || !currentUser.organization) {
    return null;
  }

  return {
    user: currentUser.user,
    organization: currentUser.organization,
    role: currentUser.role,
  };
}
