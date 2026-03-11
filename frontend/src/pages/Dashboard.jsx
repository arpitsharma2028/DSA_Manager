
import React, { useEffect, useState } from "react";
import api from "../api";
import StatsCard from "../components/StatsCard";
import FolderCard from "../components/FolderCard";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    revisit: 0
  });
  const [folders, setFolders] = useState([]);

  const fetchData = async () => {
    try {
      const [statsRes, foldersRes] = await Promise.all([
        api.get("/stats"),
        api.get("/folders")
      ]);
      setStats(statsRes.data);
      setFolders(foldersRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addFolder = async () => {
    const name = prompt("Enter folder name");
    if (!name) return;
    await api.post("/folders", { name });
    fetchData();
  };

  const renameFolder = async (folder) => {
    const name = prompt("Rename folder", folder.name);
    if (!name) return;
    await api.put(`/folders/${folder.id}`, { name });
    fetchData();
  };

  const deleteFolder = async (id) => {
    const ok = window.confirm("Delete this folder?");
    if (!ok) return;
    await api.delete(`/folders/${id}`);
    fetchData();
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="dashboard">
      <div className="topbar">
        <h1>DSA Manager</h1>
        <button onClick={logout}>Logout</button>
      </div>

      <div className="stats-grid">
        <StatsCard title="Total Solved" value={stats.total} />
        <StatsCard title="Easy" value={stats.easy} />
        <StatsCard title="Medium" value={stats.medium} />
        <StatsCard title="Hard" value={stats.hard} />
        <StatsCard title="Revisit Pending" value={stats.revisit} />
      </div>

      <div className="section-header">
        <h2>Your Folders</h2>
        <button onClick={addFolder}>+ Add Folder</button>
      </div>

      <div className="folder-grid">
        {folders.map((folder) => (
          <FolderCard
            key={folder.id}
            folder={folder}
            onRename={renameFolder}
            onDelete={deleteFolder}
          />
        ))}
      </div>
    </div>
  );
}