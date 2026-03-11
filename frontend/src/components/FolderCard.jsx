import React from "react";
import { useNavigate } from "react-router-dom";

export default function FolderCard({ folder, onRename, onDelete }) {
  const navigate = useNavigate();

  return (
    <div className="folder-card">
      <div
        className="folder-content"
        onClick={() => navigate(`/folder/${folder.id}`)}
      >
        <div className="folder-icon">📁</div>
        <h3>{folder.name}</h3>
        <p>{folder.question_count || 0} questions</p>
      </div>

      <div className="folder-actions">
        {Boolean(folder.can_rename) && (
          <button onClick={() => onRename(folder)}>Rename</button>
        )}

        {Boolean(folder.can_delete) && (
          <button onClick={() => onDelete(folder.id)}>Delete</button>
        )}
      </div>
    </div>
  );
}