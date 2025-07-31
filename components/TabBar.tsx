import React, { useState, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { VscCode, VscSettingsGear } from "react-icons/vsc";
import { TabData } from "../types/syntax";

interface TabProps {
  tab: TabData;
  index: number;
  onClose: (id: string) => void;
  onSelect: (id: string) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
}

const Tab: React.FC<TabProps> = ({ tab, index, onClose, onSelect, onMove }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: "tab",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "tab",
    hover: (item: { index: number }) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  const tabStyle = {
    ...tabStyles.tab,
    ...(tab.isActive ? tabStyles.tabActive : {}),
    ...(isDragging ? tabStyles.tabDragging : {}),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={ref}
      style={tabStyle}
      onClick={() => onSelect(tab.id)}
      onMouseEnter={() => {
        if (ref.current) {
          ref.current.style.background = "#37373d";
        }
      }}
      onMouseLeave={() => {
        if (ref.current && !tab.isActive) {
          ref.current.style.background = "#2d2d30";
        }
      }}
    >
      <span style={tabStyles.tabIcon}>
        {tab.type === "language" ? <VscCode /> : <VscSettingsGear />}
      </span>
      <span style={tabStyles.tabTitle}>{tab.title}</span>
      <button
        style={tabStyles.tabClose}
        onClick={(e) => {
          e.stopPropagation();
          onClose(tab.id);
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLElement).style.background = "#e81123";
          (e.target as HTMLElement).style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLElement).style.background = "none";
          (e.target as HTMLElement).style.opacity = "0.6";
        }}
      >
        ×
      </button>
    </div>
  );
};

const tabStyles = {
  tab: {
    display: "flex",
    alignItems: "center",
    padding: "8px 12px",
    background: "#2d2d30",
    borderRight: "1px solid #464647",
    cursor: "pointer",
    userSelect: "none" as const,
    minWidth: "120px",
    maxWidth: "200px",
  },
  tabActive: {
    background: "#1e1e1e",
    borderTop: "2px solid #007acc",
  },
  tabDragging: {
    background: "#37373d",
  },
  tabIcon: {
    marginRight: "6px",
    fontSize: "12px",
  },
  tabTitle: {
    flex: 1,
    color: "#cccccc",
    fontSize: "13px",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  tabClose: {
    marginLeft: "6px",
    background: "none",
    border: "none",
    color: "#cccccc",
    cursor: "pointer",
    padding: "2px",
    borderRadius: "2px",
    opacity: 0.6,
  },
};

interface TabBarProps {
  tabs: TabData[];
  onTabClose: (id: string) => void;
  onTabSelect: (id: string) => void;
  onTabMove: (dragIndex: number, hoverIndex: number) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  onTabClose,
  onTabSelect,
  onTabMove,
}) => {
  return (
    <div className="tab-bar" style={tabBarStyles.tabBar}>
      <div className="tabs" style={tabBarStyles.tabs}>
        {tabs.map((tab, index) => (
          <Tab
            key={tab.id}
            tab={tab}
            index={index}
            onClose={onTabClose}
            onSelect={onTabSelect}
            onMove={onTabMove}
          />
        ))}
      </div>
    </div>
  );
};

const tabBarStyles = {
  tabBar: {
    display: "flex",
    alignItems: "center",
    background: "#2d2d30",
    borderBottom: "1px solid #464647",
    minHeight: "35px",
  },
  tabs: {
    display: "flex",
    flex: 1,
    overflowX: "auto" as const,
  },
};
