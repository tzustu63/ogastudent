import { Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";
import zhTW from "antd/locale/zh_TW";
import { MainLayout } from "./components/Layout";
import { ProtectedRoute } from "./components";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import StudentsPage from "./pages/StudentsPage";
import CreateStudentPage from "./pages/CreateStudentPage";
import StudentDetailPage from "./pages/StudentDetailPage";
import UsersPage from "./pages/UsersPage";
import ReportsPage from "./pages/ReportsPage";
import TestPage from "./pages/TestPage";

import "./App.css";

function App() {
  return (
    <ConfigProvider locale={zhTW}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="students/create" element={<CreateStudentPage />} />
          <Route path="students/:id" element={<StudentDetailPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="test" element={<TestPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ConfigProvider>
  );
}

export default App;
