import React, { useEffect, useRef, useState } from "react";
import api from "../api";

export default function QuestionModal({
  open,
  onClose,
  folderId,
  editQuestion,
  onSaved
}) {
  const [form, setForm] = useState({
    link: "",
    title: "",
    platform: "",
    difficulty: "Easy",
    description: "",
    code: "",
    revisit: false,
    revisit_days: "",
    my_tc: "",
    my_sc: "",
    expected_tc: "",
    expected_sc: ""
  });

  const [loadingMeta, setLoadingMeta] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const linkTimerRef = useRef(null);
  const codeTimerRef = useRef(null);

  useEffect(() => {
    if (editQuestion) {
      setForm({
        link: editQuestion.link || "",
        title: editQuestion.title || "",
        platform: editQuestion.platform || "",
        difficulty: editQuestion.difficulty || "Easy",
        description: editQuestion.description || "",
        code: editQuestion.code || "",
        revisit: !!editQuestion.revisit,
        revisit_days: "",
        revisit_done: !!editQuestion.revisit_done,
        my_tc: editQuestion.my_tc || "",
        my_sc: editQuestion.my_sc || "",
        expected_tc: editQuestion.expected_tc || "",
        expected_sc: editQuestion.expected_sc || ""
      });
    } else {
      setForm({
        link: "",
        title: "",
        platform: "",
        difficulty: "Easy",
        description: "",
        code: "",
        revisit: false,
        revisit_days: "",
        my_tc: "",
        my_sc: "",
        expected_tc: "",
        expected_sc: ""
      });
    }

    return () => {
      if (linkTimerRef.current) clearTimeout(linkTimerRef.current);
      if (codeTimerRef.current) clearTimeout(codeTimerRef.current);
    };
  }, [editQuestion]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const fetchMeta = async (linkValue) => {
    const finalLink = linkValue || form.link;
    if (!finalLink.trim()) return;

    try {
      setLoadingMeta(true);
      const res = await api.post("/questions/meta", { link: finalLink });

      setForm((prev) => ({
        ...prev,
        title: res.data.title || prev.title,
        difficulty: res.data.difficulty || prev.difficulty,
        platform: res.data.platform || prev.platform
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMeta(false);
    }
  };

  const analyze = async (codeValue, titleValue) => {
    const finalCode = codeValue ?? form.code;
    const finalTitle = titleValue ?? form.title;

    if (!finalCode.trim()) return;

    try {
      setLoadingAnalysis(true);
      const res = await api.post("/questions/analyze", {
        code: finalCode,
        title: finalTitle
      });

      setForm((prev) => ({
        ...prev,
        my_tc: res.data.my_tc || prev.my_tc,
        my_sc: res.data.my_sc || prev.my_sc,
        expected_tc: res.data.expected_tc || prev.expected_tc,
        expected_sc: res.data.expected_sc || prev.expected_sc
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleLinkChange = (e) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      link: value
    }));

    if (linkTimerRef.current) clearTimeout(linkTimerRef.current);

    const isSupportedLink =
      value.includes("leetcode.com") || value.includes("geeksforgeeks.org");

    if (isSupportedLink) {
      linkTimerRef.current = setTimeout(() => {
        fetchMeta(value);
      }, 600);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      code: value
    }));

    if (codeTimerRef.current) clearTimeout(codeTimerRef.current);

    if (value.trim().length > 20) {
      codeTimerRef.current = setTimeout(() => {
        analyze(value, form.title);
      }, 900);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      folder_id: folderId
    };

    if (editQuestion) {
      await api.put(`/questions/${editQuestion.id}`, payload);
    } else {
      await api.post("/questions", payload);
    }

    onSaved();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal big-modal">
        <div className="modal-header-row">
          <h2>{editQuestion ? "Edit Question" : "Add Question"}</h2>
          <div>
            <button type="button" className="secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary" form="question-form">
              Save
            </button>
          </div>
        </div>

        <form id="question-form" onSubmit={handleSubmit} className="question-form">
          <label>Question Link</label>
          <input
            name="link"
            value={form.link}
            onChange={handleLinkChange}
            placeholder="Paste LeetCode / GFG link"
            required
          />

          {loadingMeta && (
            <p style={{ color: "#9aa4b2", fontSize: "13px", margin: "0" }}>
              Fetching question details...
            </p>
          )}

          <label>Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Question title"
          />

          {form.platform && (
            <p style={{ color: "#9aa4b2", fontSize: "13px", margin: "0" }}>
              Platform: {form.platform}
            </p>
          )}

          <div className="row">
            <div style={{ flex: 1 }}>
              <label>Difficulty</label>
              <select
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <label>Description / Intuition / Approach</label>
          <textarea
            name="description"
            rows="6"
            value={form.description}
            onChange={handleChange}
            placeholder="Write your notes here"
          />

          <label>Code</label>
          <textarea
            name="code"
            rows="10"
            value={form.code}
            onChange={handleCodeChange}
            placeholder="Paste your code here"
          />

          {loadingAnalysis && (
            <p style={{ color: "#9aa4b2", fontSize: "13px", margin: "0" }}>
              Detecting TC / SC...
            </p>
          )}

          <div className="row">
            <div style={{ flex: 1 }}>
              <label>Your TC</label>
              <input
                name="my_tc"
                value={form.my_tc}
                onChange={handleChange}
                placeholder="O(n)"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Your SC</label>
              <input
                name="my_sc"
                value={form.my_sc}
                onChange={handleChange}
                placeholder="O(1)"
              />
            </div>
          </div>

          <div className="row">
            <div style={{ flex: 1 }}>
              <label>Expected TC</label>
              <input
                name="expected_tc"
                value={form.expected_tc}
                onChange={handleChange}
                placeholder="O(n)"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Expected SC</label>
              <input
                name="expected_sc"
                value={form.expected_sc}
                onChange={handleChange}
                placeholder="O(1)"
              />
            </div>
          </div>

          <div className="row">
            <label className="toggle-row">
              <input
                type="checkbox"
                name="revisit"
                checked={form.revisit}
                onChange={handleChange}
              />
              Mark for revisit
            </label>

            {form.revisit && (
              <input
                type="number"
                min="1"
                name="revisit_days"
                placeholder="Days later"
                value={form.revisit_days}
                onChange={handleChange}
              />
            )}
          </div>
        </form>
      </div>
    </div>
  );
}