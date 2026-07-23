import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Admin/Auth/Login";
import AdminProfile from "../pages/Admin/Auth/AdminProfile";

// ================= ADMIN =================
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/Admin/Dashboard/Dashboard";

import TeacherList from "../pages/Admin/Teachers/TeacherList";
import TeacherAdd from "../pages/Admin/Teachers/TeacherAdd";
import TeacherEdit from "../pages/Admin/Teachers/TeacherEdit";
import TeacherProfile from "../pages/Admin/Teachers/TeacherProfile";

import StudentList from "../pages/Admin/Students/StudentList";
import StudentProfile from "../pages/Admin/Students/StudentProfile";

import ClassList from "../pages/Admin/Classes/ClassList";
import ClassDetail from "../pages/Admin/Classes/ClassDetail";

import SubjectPage from "../pages/Admin/Subjects/SubjectList";
import TuitionPage from "../pages/Admin/Tuition/TuitionList";

import ScorePage from "../pages/Admin/Scores/ScoreList";
import AttendancePages from "../pages/Admin/Attendance/AttendanceList";
import ScheduleList from "../pages/Admin/Schedules/ScheduleList";

import OrganizationPage from "../pages/Admin/Organization/OrganizationPage";

// ================= TEACHER =================
import TeacherLayout from "../layouts/TeacherLayout";
import TeacherDashboard from "../pages/Teacher/Dashboard";

import ClassDetail1 from "../pages/Teacher/ClassDetail";
import SchedulesTeacher from "../pages/Teacher/SchedulesTeacher";
import AttendanceTeacher from "../pages/Teacher/AttendanceTeacher";
import TeacherProfile1 from "../pages/Teacher/TeacherProfile";

// ================= STUDENT =================
import StudentLayout from "../layouts/StudentLayout";
import StudentDashboard from "../pages/Student/StudentDashboard";
import StudentProfileDetail from "../pages/Student/StudentProfileDetail";
import StudentScore from "../pages/Student/StudentScore";
import StudentSchedule from "../pages/Student/StudentSchedule";
import StudentTuition from "../pages/Student/StudentTuition";

// ================= AUTH GUARD & ROLES =================
import NotFound from "../components/NotFound";
import PrivateRoute from "../components/PrivateRoute";
import { ROLES } from "../constants/roles";

import StaffPage from "../pages/Admin/Staff/StaffPage";
import ManagementPage from "../pages/Admin/Management/ManagementPage";
import DepartmentPage from "../pages/Admin/Management/DepartmentPage";
import UnionPage from "../pages/Admin/Management/UnionPage";
import SchoolCouncilPage from "../pages/Admin/Management/SchoolCouncilPage";
import ParentManagementPage from "../pages/Admin/Management/ParentManagementPage";
import RewardPage from "../pages/Admin/Management/RewardPage";
import DisciplinePage from "../pages/Admin/Management/DisciplinePage";
import DocumentPage from "../pages/Admin/Management/DocumentPage";
import MeetingPage from "../pages/Admin/Management/MeetingPage";

function AppRoutes() {
  return (
    <Routes>
      {/* ================= REDIRECT TRANG CHỦ ================= */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ================= LOGIN ================= */}
      <Route path="/login" element={<Login />} />

      {/* ================= ADMIN / SYSTEM PORTAL ROUTES ================= */}
      <Route
        path="/admin"
        element={
          <PrivateRoute roles={Object.values(ROLES)}>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        {/* Dashboard chung cho tất cả roles */}
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<AdminProfile />} />

        {/* Tổ chức nhà trường */}
        <Route
          path="organization"
          element={
            <PrivateRoute roles={[ROLES.ADMIN, ROLES.PRINCIPAL]}>
              <OrganizationPage />
            </PrivateRoute>
          }
        />
        <Route
          path="management"
          element={
            <PrivateRoute
              roles={[ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.VICE_PRINCIPAL]}
            >
              <ManagementPage />
            </PrivateRoute>
          }
        />
        <Route
          path="departments"
          element={
            <PrivateRoute
              roles={[
                ROLES.ADMIN,
                ROLES.PRINCIPAL,
                ROLES.VICE_PRINCIPAL,
                ROLES.DEPARTMENT_HEAD,
                ROLES.TEACHER,
              ]}
            >
              <DepartmentPage />
            </PrivateRoute>
          }
        />
        <Route
          path="union"
          element={
            <PrivateRoute
              roles={[ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.UNION_PRESIDENT]}
            >
              <UnionPage />
            </PrivateRoute>
          }
        />
        <Route
          path="schoolCouncil"
          element={
            <PrivateRoute
              roles={[ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.SCHOOL_COUNCIL]}
            >
              <SchoolCouncilPage />
            </PrivateRoute>
          }
        />

        {/* Quản lý Nhân sự */}
        <Route
          path="teachers"
          element={
            <PrivateRoute
              roles={[
                ROLES.ADMIN,
                ROLES.DEPARTMENT_HEAD,
                ROLES.PRINCIPAL,
                ROLES.VICE_PRINCIPAL,
                ROLES.UNION_PRESIDENT,
                ROLES.SCHOOL_COUNCIL,
              ]}
            >
              <TeacherList />
            </PrivateRoute>
          }
        />
        <Route
          path="teachers/add"
          element={
            <PrivateRoute roles={[ROLES.ADMIN, ROLES.PRINCIPAL]}>
              <TeacherAdd />
            </PrivateRoute>
          }
        />
        <Route
          path="teachers/edit/:id"
          element={
            <PrivateRoute roles={[ROLES.ADMIN, ROLES.PRINCIPAL]}>
              <TeacherEdit />
            </PrivateRoute>
          }
        />
        <Route
          path="teachers/profile/:id"
          element={
            <PrivateRoute
              roles={[
                ROLES.ADMIN,
                ROLES.DEPARTMENT_HEAD,
                ROLES.PRINCIPAL,
                ROLES.VICE_PRINCIPAL,
                ROLES.UNION_PRESIDENT,
                ROLES.SCHOOL_COUNCIL,
              ]}
            >
              <TeacherProfile />
            </PrivateRoute>
          }
        />

        <Route
          path="students"
          element={
            <PrivateRoute
              roles={[
                ROLES.ADMIN,
                ROLES.PRINCIPAL,
                ROLES.VICE_PRINCIPAL,
                ROLES.DEPARTMENT_HEAD,
                ROLES.TEACHER,
              ]}
            >
              <StudentList />
            </PrivateRoute>
          }
        />
        <Route
          path="students/:id"
          element={
            <PrivateRoute
              roles={[
                ROLES.ADMIN,
                ROLES.PRINCIPAL,
                ROLES.VICE_PRINCIPAL,
                ROLES.DEPARTMENT_HEAD,
                ROLES.TEACHER,
              ]}
            >
              <StudentProfile />
            </PrivateRoute>
          }
        />

        <Route
          path="parents"
          element={
            <PrivateRoute
              roles={[
                ROLES.ADMIN,
                ROLES.PRINCIPAL,
                ROLES.VICE_PRINCIPAL,
                ROLES.TEACHER,
                ROLES.SCHOOL_COUNCIL,
              ]}
            >
              <ParentManagementPage />
            </PrivateRoute>
          }
        />

        <Route
          path="staffs"
          element={
            <PrivateRoute
              roles={[
                ROLES.ADMIN,
                ROLES.PRINCIPAL,
                ROLES.DEPARTMENT_HEAD,
                ROLES.OFFICE_STAFF,
                ROLES.UNION_PRESIDENT,
                ROLES.SCHOOL_COUNCIL,
              ]}
            >
              <StaffPage />
            </PrivateRoute>
          }
        />

        {/* Đào tạo */}
        <Route
          path="classes"
          element={
            <PrivateRoute
              roles={[
                ROLES.ADMIN,
                ROLES.PRINCIPAL,
                ROLES.VICE_PRINCIPAL,
                ROLES.DEPARTMENT_HEAD,
                ROLES.TEACHER,
                ROLES.STUDENT,
              ]}
            >
              <ClassList />
            </PrivateRoute>
          }
        />
        <Route
          path="classes/:id"
          element={
            <PrivateRoute
              roles={[
                ROLES.ADMIN,
                ROLES.PRINCIPAL,
                ROLES.VICE_PRINCIPAL,
                ROLES.DEPARTMENT_HEAD,
                ROLES.TEACHER,
                ROLES.STUDENT,
              ]}
            >
              <ClassDetail />
            </PrivateRoute>
          }
        />

        <Route path="subjects" element={<SubjectPage />} />

        <Route
          path="schedules"
          element={
            <PrivateRoute
              roles={[
                ROLES.ADMIN,
                ROLES.PRINCIPAL,
                ROLES.VICE_PRINCIPAL,
                ROLES.DEPARTMENT_HEAD,
                ROLES.TEACHER,
                ROLES.STUDENT,
              ]}
            >
              <ScheduleList />
            </PrivateRoute>
          }
        />

        {/* Nghiệp vụ */}
        <Route
          path="attendance"
          element={
            <PrivateRoute
              roles={[
                ROLES.ADMIN,
                ROLES.PRINCIPAL,
                ROLES.VICE_PRINCIPAL,
                ROLES.DEPARTMENT_HEAD,
                ROLES.TEACHER,
                ROLES.STUDENT,
                ROLES.PARENT,
              ]}
            >
              <AttendancePages />
            </PrivateRoute>
          }
        />

        <Route path="scores" element={<ScorePage />} />

        <Route
          path="tuition"
          element={
            <PrivateRoute
              roles={[
                ROLES.ADMIN,
                ROLES.PRINCIPAL,
                ROLES.OFFICE_STAFF,
                ROLES.PARENT,
                ROLES.STUDENT,
              ]}
            >
              <TuitionPage />
            </PrivateRoute>
          }
        />

        <Route
          path="rewards"
          element={
            <PrivateRoute
              roles={[
                ROLES.ADMIN,
                ROLES.PRINCIPAL,
                ROLES.VICE_PRINCIPAL,
                ROLES.DEPARTMENT_HEAD,
                ROLES.UNION_PRESIDENT,
                ROLES.TEACHER,
                ROLES.SCHOOL_COUNCIL,
              ]}
            >
              <RewardPage />
            </PrivateRoute>
          }
        />

        <Route
          path="discipline"
          element={
            <PrivateRoute
              roles={[
                ROLES.ADMIN,
                ROLES.PRINCIPAL,
                ROLES.VICE_PRINCIPAL,
                ROLES.DEPARTMENT_HEAD,
                ROLES.TEACHER,
                ROLES.SCHOOL_COUNCIL,
              ]}
            >
              <DisciplinePage />
            </PrivateRoute>
          }
        />

        {/* Điều hành */}
        <Route
          path="documents"
          element={
            <PrivateRoute
              roles={[
                ROLES.ADMIN,
                ROLES.PRINCIPAL,
                ROLES.VICE_PRINCIPAL,
                ROLES.DEPARTMENT_HEAD,
                ROLES.TEACHER,
                ROLES.OFFICE_STAFF,
                ROLES.UNION_PRESIDENT,
                ROLES.SCHOOL_COUNCIL,
              ]}
            >
              <DocumentPage />
            </PrivateRoute>
          }
        />

        <Route
          path="meetings"
          element={
            <PrivateRoute
              roles={[
                ROLES.ADMIN,
                ROLES.PRINCIPAL,
                ROLES.VICE_PRINCIPAL,
                ROLES.DEPARTMENT_HEAD,
                ROLES.TEACHER,
                ROLES.UNION_PRESIDENT,
                ROLES.OFFICE_STAFF,
                ROLES.SCHOOL_COUNCIL,
              ]}
            >
              <MeetingPage />
            </PrivateRoute>
          }
        />
      </Route>

      {/* ================= TEACHER DEDICATED PORTAL ================= */}
      <Route
        path="/teacher"
        element={
          <PrivateRoute roles={[ROLES.TEACHER, ROLES.DEPARTMENT_HEAD]}>
            <TeacherLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<TeacherDashboard />} />
        <Route path="classes" element={<ClassDetail1 />} />
        <Route path="schedules" element={<SchedulesTeacher />} />
        <Route path="attendance" element={<AttendanceTeacher />} />
        <Route path="profile" element={<TeacherProfile1 />} />
      </Route>

      {/* ================= STUDENT DEDICATED PORTAL ================= */}
      <Route
        path="/student"
        element={
          <PrivateRoute roles={[ROLES.STUDENT]}>
            <StudentLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfileDetail />} />
        <Route path="scores" element={<StudentScore />} />
        <Route path="schedules" element={<StudentSchedule />} />
        <Route path="tuition" element={<StudentTuition />} />
      </Route>

      {/* ================= FALLBACK & ERROR ROUTES ================= */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
