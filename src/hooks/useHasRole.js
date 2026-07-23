import useAuth from "./useAuth";

/**
 * Custom Hook kiểm tra quyền (Role) của User đang đăng nhập
 * @returns { object } { hasRole, userRole, user }
 */
export default function useHasRole() {
  const { user } = useAuth();

  // Lấy role của user và chuẩn hóa về chữ thường
  const userRole = (user?.role || "").toLowerCase();

  /**
   * Hàm kiểm tra user có sở hữu 1 trong các Role truyền vào hay không
   * @param  {...string | Array<string>} roles - Danh sách roles cần kiểm tra
   * @example
   * hasRole("admin")
   * hasRole(ROLES.ADMIN, ROLES.PRINCIPAL)
   * hasRole([ROLES.ADMIN, ROLES.TEACHER])
   * @returns {boolean}
   */
  const hasRole = (...roles) => {
    if (!userRole) return false;

    // Phẳng hóa tham số đầu vào (cho phép truyền cả tham số rời hoặc truyền mảng)
    const targetRoles = roles.flat().map((r) => (r || "").toLowerCase());

    return targetRoles.includes(userRole);
  };

  return {
    hasRole,
    userRole,
    user,
  };
}
