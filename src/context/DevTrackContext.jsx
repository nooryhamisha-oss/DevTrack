import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext.jsx";
import { saveHistoryEntry } from "../services/history.js";

const DevTrackContext = createContext(null);
const STORAGE_KEY = "devtrack_data";

export function DevTrackProvider({ children }) {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [selectedRepos, setSelectedRepos] = useState([]);
  const [analyses, setAnalyses] = useState({});
  const [portfolioResult, setPortfolioResult] = useState(null);
  const [targetRole, setTargetRole] = useState("");
  const [skillGapResult, setSkillGapResult] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [guideNotification, setGuideNotification] = useState(null);
  const [userProfile, setUserProfileState] = useState({
    displayName: "",
    avatarColor: "#8B5CF6",
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setUsername(data.username || "");
      setProfile(data.profile || null);
      setRepos(data.repos || []);
      setSelectedRepos(data.selectedRepos || []);
      setAnalyses(data.analyses || {});
      setPortfolioResult(data.portfolioResult || null);
      setTargetRole(data.targetRole || "");
      setSkillGapResult(data.skillGapResult || null);
      setLearningPath(data.learningPath || null);
      setAnalysisHistory(data.analysisHistory || []);
      setGuideNotification(data.guideNotification || null);
      setUserProfileState(
        data.userProfile || { displayName: "", avatarColor: "#8B5CF6" },
      );
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        username,
        profile,
        repos,
        selectedRepos,
        analyses,
        portfolioResult,
        targetRole,
        skillGapResult,
        learningPath,
        analysisHistory,
        guideNotification,
        userProfile,
      }),
    );
  }, [
    username,
    profile,
    repos,
    selectedRepos,
    analyses,
    portfolioResult,
    targetRole,
    skillGapResult,
    learningPath,
    analysisHistory,
    guideNotification,
    userProfile,
  ]);

  function saveAnalysis(repo, result) {
    setAnalyses((prev) => ({ ...prev, [repo.name]: result }));
    setAnalysisHistory((prev) => [
      ...prev,
      {
        repoId: repo.id,
        repoName: repo.name,
        qualityScore: result.qualityScore,
        timestamp: new Date().toISOString(),
      },
    ]);
  
    
    if (user) {
      saveHistoryEntry(user.id, repo.name, result.qualityScore, result);
    }
  }

  function updateSelectedRepos(newSelection) {
    setSelectedRepos(newSelection);
    setPortfolioResult(null);
  }

  function updateTargetRole(role) {
    setTargetRole(role);
    setSkillGapResult(null);
    setLearningPath(null);
  }

  function pushGuideNotification(message) {
    setGuideNotification({ message, unread: true });
  }
  function markGuideNotificationRead() {
    setGuideNotification((prev) => (prev ? { ...prev, unread: false } : null));
  }

  function setUserProfile(updates) {
    setUserProfileState((prev) => ({ ...prev, ...updates }));
  }

  const value = {
    username,
    setUsername,
    profile,
    setProfile,
    repos,
    setRepos,
    selectedRepos,
    setSelectedRepos: updateSelectedRepos,
    analyses,
    saveAnalysis,
    portfolioResult,
    setPortfolioResult,
    targetRole,
    setTargetRole: updateTargetRole,
    skillGapResult,
    setSkillGapResult,
    learningPath,
    setLearningPath,
    analysisHistory,
    guideNotification,
    pushGuideNotification,
    markGuideNotificationRead,
    userProfile,
    setUserProfile,
  };
  return (
    <DevTrackContext.Provider value={value}>
      {children}
    </DevTrackContext.Provider>
  );
}

export function useDevTrack() {
  const ctx = useContext(DevTrackContext);
  if (!ctx) throw new Error("useDevTrack must be used inside DevTrackProvider");
  return ctx;
}
