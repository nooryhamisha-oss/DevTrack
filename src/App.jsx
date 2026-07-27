import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import PublicShare from "./pages/PublicShare.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import RepoAnalysis from "./pages/RepoAnalysis.jsx";
import SkillGap from "./pages/SkillGap.jsx";
import ImprovementPlanner from "./pages/ImprovementPlanner.jsx";
import HistoryPage from "./pages/History.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/share/:slug" element={<PublicShare />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/app" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/repo/:repoName" element={<RepoAnalysis />} />
        <Route path="/skill-gap" element={<SkillGap />} />
        <Route path="/planner" element={<ImprovementPlanner />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
