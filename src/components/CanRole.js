import useHasRole from "../hooks/useHasRole";

/**
 * Component hiển thị children nếu user có Role phù hợp
 * @param {Array<string> | string} allowRoles - Danh sách role được phép xem
 * @param {ReactNode} children - Component con được bảo vệ
 * @param {ReactNode} fallback - Giao diện hiển thị thay thế nếu không có quyền (mặc định: null)
 */
export default function CanRole({ allowRoles, children, fallback = null }) {
  const { hasRole } = useHasRole();

  if (hasRole(allowRoles)) {
    return <>{children}</>;
  }

  return fallback;
}
