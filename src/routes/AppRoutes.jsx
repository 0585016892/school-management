import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Auth/Login";
import AdminProfile from "../pages/Auth/AdminProfile";

// ================= ADMIN =================
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/Dashboard/Dashboard";

import TeacherList from "../pages/Teachers/TeacherList";
import TeacherAdd from "../pages/Teachers/TeacherAdd";
import TeacherEdit from "../pages/Teachers/TeacherEdit";
import TeacherProfile from "../pages/Teachers/TeacherProfile";

import StudentList from "../pages/Students/StudentList";
import StudentProfile from "../pages/Students/StudentProfile";

import ClassList from "../pages/Classes/ClassList";
import ClassDetail from "../pages/Classes/ClassDetail";

import SubjectPage from "../pages/Subjects/SubjectList";
import TuitionPage from "../pages/Tuition/TuitionList";

import ScorePage from "../pages/Scores/ScoreList";
import AttendancePages from "../pages/Attendance/AttendanceList";

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

// ================= AUTH GUARD =================
import NotFound from "../components/NotFound"; // Đường dẫn tới file chứa trang 404 vừa tạo
import PrivateRoute from "../components/PrivateRoute";
import ScheduleList from "../pages/Schedules/ScheduleList";

function AppRoutes() {
  return (
    <Routes>
      {/* ================= LOGIN ================= */}
      <Route path="/login" element={<Login />} />

      {/* ================= ADMIN ROUTES ================= */}
      <Route
        path="/admin"
        element={
          <PrivateRoute role="admin">
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />

        <Route path="teachers" element={<TeacherList />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="teachers/add" element={<TeacherAdd />} />
        <Route path="teachers/edit/:id" element={<TeacherEdit />} />
        <Route path="teachers/profile/:id" element={<TeacherProfile />} />

        <Route path="students" element={<StudentList />} />
        <Route path="students/:id" element={<StudentProfile />} />

        <Route path="classes" element={<ClassList />} />
        <Route path="classes/:id" element={<ClassDetail />} />

        <Route path="subjects" element={<SubjectPage />} />
        <Route path="tuition" element={<TuitionPage />} />

        <Route path="scores" element={<ScorePage />} />
        <Route path="attendance" element={<AttendancePages />} />

        <Route path="schedules" element={<ScheduleList />} />
      </Route>

      {/* ================= TEACHER ROUTES ================= */}
      <Route
        path="/teacher"
        element={
          <PrivateRoute role="teacher">
            <TeacherLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<TeacherDashboard />} />
        <Route path="/teacher/classes" element={<ClassDetail1 />} />
        <Route path="/teacher/schedules" element={<SchedulesTeacher />} />
        <Route path="/teacher/attendance" element={<AttendanceTeacher />} />
        <Route path="/teacher/profile" element={<TeacherProfile1 />} />
        {/* <Route path="scores" element={<TeacherScore />} /> */}
      </Route>
      <Route
        path="/student"
        element={
          <PrivateRoute role="student">
            <StudentLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="/student/profile" element={<StudentProfileDetail />} />
        <Route path="/student/scores" element={<StudentScore />} />
        <Route path="/student/schedules" element={<StudentSchedule />} />
        <Route path="/student/tuition" element={<StudentTuition />} />
      </Route>
      {/* ================= FALLBACK ================= */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
