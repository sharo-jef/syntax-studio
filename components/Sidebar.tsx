import React, { useState } from "react";
import {
  VscAdd,
  VscTrash,
  VscChevronLeft,
  VscChevronRight,
} from "react-icons/vsc";
import { SavedLanguage } from "../types/syntax";

interface SidebarProps {
  savedLanguages: SavedLanguage[];
  onLoadLanguage: (language: SavedLanguage) => void;
  onDeleteLanguage: (id: string) => void;
  onUpdateLanguageName: (id: string, newName: string) => void;
  onNewLanguage: () => void;
  currentLanguageId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  savedLanguages,
  onLoadLanguage,
  onDeleteLanguage,
  onUpdateLanguageName,
  onNewLanguage,
  currentLanguageId,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    language: SavedLanguage | null;
  }>({ isOpen: false, language: null });

  const handleStartEdit = (language: SavedLanguage) => {
    setEditingId(language.id);
    setEditingName(language.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      onUpdateLanguageName(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleDeleteConfirm = (language: SavedLanguage) => {
    setDeleteConfirmModal({ isOpen: true, language });
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmModal({ isOpen: false, language: null });
  };

  const handleDeleteExecute = () => {
    if (deleteConfirmModal.language) {
      onDeleteLanguage(deleteConfirmModal.language.id);
      setDeleteConfirmModal({ isOpen: false, language: null });
    }
  };

  return (
    <div
      style={{
        ...sidebarStyles.sidebar,
        width: isCollapsed ? "48px" : "300px",
        minWidth: isCollapsed ? "48px" : "300px",
        maxWidth: isCollapsed ? "48px" : "300px",
      }}
    >
      <div
        style={{
          ...sidebarStyles.header,
          justifyContent: isCollapsed ? "center" : "flex-start",
        }}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "展開" : "折りたたみ"}
          style={{
            ...sidebarStyles.collapseBtn,
            ...(isCollapsed ? { margin: "0 auto" } : {}),
          }}
        >
          {isCollapsed ? <VscChevronRight /> : <VscChevronLeft />}
        </button>
        {!isCollapsed && (
          <>
            <h3 style={sidebarStyles.title}>Syntax Studio</h3>
            <div style={sidebarStyles.headerActions}>
              <button
                onClick={onNewLanguage}
                title="新しい言語を作成"
                style={sidebarStyles.newTabBtn}
              >
                <VscAdd />
              </button>
            </div>
          </>
        )}
      </div>

      {!isCollapsed && (
        <div style={sidebarStyles.languageList}>
          {savedLanguages.length === 0 ? (
            <div style={sidebarStyles.emptyState}>
              <p style={sidebarStyles.emptyText}>保存された言語がありません</p>
              <p style={sidebarStyles.emptyText}>
                新しい言語を作成してください
              </p>
            </div>
          ) : (
            savedLanguages.map((language) => (
              <div
                key={language.id}
                style={{
                  ...sidebarStyles.languageItem,
                  ...(currentLanguageId === language.id
                    ? {
                        background: "#0e4775",
                        borderLeft: "3px solid #007acc",
                      }
                    : {}),
                }}
                onClick={() =>
                  editingId !== language.id && onLoadLanguage(language)
                }
              >
                <div style={sidebarStyles.languageInfo}>
                  {editingId === language.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={handleSaveEdit}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit();
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                      style={sidebarStyles.editInput}
                      autoFocus
                    />
                  ) : (
                    <div
                      style={sidebarStyles.languageName}
                      onDoubleClick={() => handleStartEdit(language)}
                    >
                      {language.name}
                    </div>
                  )}
                  <div style={sidebarStyles.languageMeta}>
                    更新: {new Date(language.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={sidebarStyles.languageActions}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConfirm(language);
                    }}
                    style={sidebarStyles.deleteButton}
                    title="削除"
                  >
                    <VscTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 削除確認モーダル */}
      {deleteConfirmModal.isOpen && deleteConfirmModal.language && (
        <div style={sidebarStyles.modalOverlay}>
          <div style={sidebarStyles.modal}>
            <div style={sidebarStyles.modalHeader}>
              <h4 style={sidebarStyles.modalTitle}>言語の削除</h4>
            </div>
            <div style={sidebarStyles.modalBody}>
              <p style={sidebarStyles.modalMessage}>
                「{deleteConfirmModal.language.name}」を削除しますか？
              </p>
              <p style={sidebarStyles.modalSubmessage}>
                この操作は取り消せません。
              </p>
            </div>
            <div style={sidebarStyles.modalFooter}>
              <button
                onClick={handleDeleteCancel}
                style={sidebarStyles.modalCancelButton}
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteExecute}
                style={sidebarStyles.modalDeleteButton}
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const sidebarStyles = {
  sidebar: {
    background: "#252526",
    borderRight: "1px solid #3c3c3c",
    display: "flex",
    flexDirection: "column" as const,
    transition: "width 0.2s ease",
  },
  header: {
    display: "flex",
    alignItems: "center",
    padding: "8px",
    borderBottom: "1px solid #3c3c3c",
    minHeight: "40px",
    gap: "8px",
  },
  collapseBtn: {
    background: "transparent",
    border: "none",
    color: "#cccccc",
    cursor: "pointer",
    padding: "6px",
    marginRight: "0",
    borderRadius: "2px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "24px",
    minHeight: "24px",
    fontSize: "16px",
    outline: "none",
  },
  title: {
    color: "#cccccc",
    margin: 0,
    fontSize: "13px",
    fontWeight: 600,
    flex: 1,
    lineHeight: "24px",
  },
  headerActions: {
    display: "flex",
    gap: "4px",
    marginLeft: "auto",
  },
  newTabBtn: {
    background: "transparent",
    border: "none",
    color: "#cccccc",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "2px",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "24px",
    minHeight: "24px",
    outline: "none",
  },
  languageList: {
    flex: 1,
    overflow: "auto",
    padding: "4px 0",
  },
  emptyState: {
    textAlign: "center" as const,
    color: "#6a6a6a",
    padding: "20px 8px",
  },
  emptyText: {
    margin: "0 0 8px 0",
    fontSize: "12px",
  },
  languageItem: {
    background: "transparent",
    border: "none",
    padding: "8px 12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    borderLeft: "3px solid transparent",
  },
  languageInfo: {
    flex: 1,
    marginRight: "8px",
  },
  languageName: {
    color: "#cccccc",
    fontSize: "13px",
    fontWeight: 400,
    marginBottom: "2px",
  },
  languageMeta: {
    color: "#6a6a6a",
    fontSize: "11px",
  },
  languageActions: {
    display: "flex",
    gap: "4px",
  },
  deleteButton: {
    background: "transparent",
    border: "none",
    color: "#6a6a6a",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "2px",
    fontSize: "14px",
    outline: "none",
  },
  editInput: {
    background: "#3c3c3c",
    border: "1px solid #007acc",
    color: "#cccccc",
    padding: "2px 4px",
    fontSize: "13px",
    borderRadius: "2px",
    width: "100%",
  },
  modalOverlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#2d2d30",
    borderRadius: "4px",
    border: "1px solid #464647",
    minWidth: "300px",
    maxWidth: "400px",
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.32)",
  },
  modalHeader: {
    padding: "12px 16px",
    borderBottom: "1px solid #464647",
    background: "#252526",
  },
  modalTitle: {
    margin: 0,
    color: "#cccccc",
    fontSize: "14px",
    fontWeight: 600,
  },
  modalBody: {
    padding: "16px",
  },
  modalMessage: {
    margin: "0 0 8px 0",
    color: "#cccccc",
    fontSize: "13px",
    lineHeight: "1.4",
  },
  modalSubmessage: {
    margin: 0,
    color: "#969696",
    fontSize: "12px",
    lineHeight: "1.4",
  },
  modalFooter: {
    padding: "12px 16px",
    borderTop: "1px solid #464647",
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    background: "#252526",
  },
  modalCancelButton: {
    background: "transparent",
    border: "1px solid #464647",
    color: "#cccccc",
    padding: "6px 12px",
    borderRadius: "2px",
    cursor: "pointer",
    fontSize: "12px",
    outline: "none",
  },
  modalDeleteButton: {
    background: "#f14c4c",
    border: "1px solid #f14c4c",
    color: "#ffffff",
    padding: "6px 12px",
    borderRadius: "2px",
    cursor: "pointer",
    fontSize: "12px",
    outline: "none",
  },
};
