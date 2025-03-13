import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./components/login/LoginForm";
import Dashboard from "./components/dashboard/Dashboard";
import { App as AntdApp } from "antd";
import "@fontsource/manrope";
import { AuthProvider } from "./context/AuthContext";
import AuthGuard from "./guards/AuthGuard"; // Import AuthGuard

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router basename={process.env.PUBLIC_URL}>
        <AntdApp>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/login" element={<LoginForm />} />

            {/* Protected Routes using AuthGuard */}
            <Route element={<AuthGuard />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Routes>
        </AntdApp>
      </Router>
    </AuthProvider>
  );
};

export default App;
