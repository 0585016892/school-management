import { ROLE_PERMISSIONS } from "../constants/rolePermissions";
import useAuth from "./useAuth";

export default function usePermission() {
  const { user } = useAuth();

  const can = (permission) => {
    const permissions = ROLE_PERMISSIONS[user?.role] || [];

    if (permissions.includes("*")) return true;

    return permissions.includes(permission);
  };

  return { can };
}
