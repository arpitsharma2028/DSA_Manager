import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import QuestionModal from "../components/QuestionModal";

export default function FolderPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [folder, setFolder] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [editQuestion, setEditQuestion] = useState(null);
  const [sortOption, setSortOption] = useState("due-priority");

  const fetchData = async () => {
    try {
      const [questionRes, folderRes] = await Promise.all([
        api.get(`/questions/folder/${id}`),
        api.get("/folders")
      ]);

      setQuestions(questionRes.data);
      const foundFolder = folderRes.data.find((f) => String(f.id) === String(id));
      setFolder(foundFolder || null);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleDeleteQuestion = async (questionId) => {
    const ok = window.confirm("Delete this question?");
    if (!ok) return;

    await api.delete(`/questions/${questionId}`);
    fetchData();
  };

  const handleRevisitDone = async (question) => {
    await api.put(`/questions/${question.id}`, {
      folder_id: question.folder_id,
      link: question.link,
      description: question.description,
      code: question.code,
      revisit: false,
      revisit_days: "",
      revisit_done: true
    });

    fetchData();
  };

  const getDayDifference = (revisitDate) => {
    if (!revisitDate) return null;

    const today = new Date();
    const target = new Date(revisitDate);

    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diffMs = target - today;
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  };

  const getRevisitStatus = (revisitDate) => {
    if (!revisitDate) {
      return {
        text: "Scheduled",
        className: "revisit-badge"
      };
    }

    const diffDays = getDayDifference(revisitDate);
    const target = new Date(revisitDate);

    const formattedDate = target.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

    if (diffDays > 0) {
      return {
        text: `${formattedDate} • Revisit in ${diffDays} day${diffDays > 1 ? "s" : ""}`,
        className: "revisit-badge"
      };
    }

    if (diffDays === 0) {
      return {
        text: `${formattedDate} • Due Today`,
        className: "revisit-badge due-today"
      };
    }

    const overdueDays = Math.abs(diffDays);

    return {
      text: `${formattedDate} • Overdue by ${overdueDays} day${overdueDays > 1 ? "s" : ""}`,
      className: "revisit-badge overdue"
    };
  };

  const sortedQuestions = useMemo(() => {
    const copied = [...questions];

    if (folder?.name !== "REVISIT") {
      return copied;
    }

    if (sortOption === "newest") {
      return copied.sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
    }

    if (sortOption === "oldest") {
      return copied.sort(
        (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0)
      );
    }

    return copied.sort((a, b) => {
      const aDiff = getDayDifference(a.revisit_date);
      const bDiff = getDayDifference(b.revisit_date);

      const normalize = (value) => {
        if (value === null) return 999999;
        return value;
      };

      return normalize(aDiff) - normalize(bDiff);
    });
  }, [questions, folder, sortOption]);

  return (
    <div className="dashboard">
      <div className={folder?.name === "REVISIT" ? "revisit-header" : "topbar"}>
        <button onClick={() => navigate("/")}>← Back</button>

        <h1>{folder?.name || "Folder"}</h1>

        <div className="folder-top-actions">
          {folder?.name === "REVISIT" && (
            <select
              className="sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="due-priority">Sort: Overdue → Due</option>
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
            </select>
          )}

          {folder?.name !== "REVISIT" && (
            <button
              onClick={() => {
                setEditQuestion(null);
                setOpen(true);
              }}
            >
              + Add Question
            </button>
          )}
        </div>
      </div>

      <div className="question-list">
        {sortedQuestions.map((q) => {
          const revisitStatus = getRevisitStatus(q.revisit_date);

          return (
            <div
              className={`question-row ${folder?.name === "REVISIT" ? "revisit" : ""}`}
              key={q.id}
            >
              <div className="question-main">
                <h3>{q.title}</h3>
                <a href={q.link} target="_blank" rel="noreferrer">
                  {q.link}
                </a>

                <div className="meta-row">
                  <span className={`badge ${q.difficulty?.toLowerCase()}`}>
                    {q.difficulty}
                  </span>

                  {Boolean(q.revisit) && !q.revisit_done && (
                    <span className={revisitStatus.className}>
                      ⏰ {revisitStatus.text}
                    </span>
                  )}
                </div>

                <p>
                  <strong>Your TC / SC:</strong> {q.my_tc} / {q.my_sc}
                </p>
                <p>
                  <strong>Expected TC / SC:</strong> {q.expected_tc} / {q.expected_sc}
                </p>
              </div>

              <div className="question-actions">
                {folder?.name !== "REVISIT" && (
                  <button
                    onClick={() => {
                      setEditQuestion(q);
                      setOpen(true);
                    }}
                  >
                    Edit
                  </button>
                )}

                <button onClick={() => handleDeleteQuestion(q.id)}>Delete</button>

                {Boolean(q.revisit) && !q.revisit_done && (
                  <button className="done-btn" onClick={() => handleRevisitDone(q)}>
                    Done
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <QuestionModal
        open={open}
        onClose={() => setOpen(false)}
        folderId={id}
        editQuestion={editQuestion}
        onSaved={fetchData}
      />
    </div>
  );
}