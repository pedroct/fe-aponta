import React from "react";

/**
 * Ícones oficiais de Work Items do Azure DevOps
 * SVGs obtidos diretamente da API: GET /_apis/wit/workitemicons/{icon}
 * Cores oficiais do Azure DevOps
 */

interface WorkItemIconProps {
  type: string;
  size?: number;
  className?: string;
}

// Cores oficiais do Azure DevOps por tipo de Work Item
export const WORK_ITEM_COLORS: Record<string, string> = {
  Task: "#F2CB1D",
  Bug: "#CC293D",
  "User Story": "#009CCC",
  Feature: "#773B93",
  Epic: "#FF7B00",
  Issue: "#CC293D",
  "Product Backlog Item": "#009CCC",
  Impediment: "#CC293D",
};

// SVGs oficiais do Azure DevOps (viewBox 0 0 448 448)
// Obtidos via: GET https://dev.azure.com/{org}/_apis/wit/workitemicons/{icon}?api-version=7.2-preview.1
const OfficialIcons: Record<string, React.ReactNode> = {
  // icon_clipboard - Task
  Task: (
    <path
      fill="currentColor"
      d="M320 64h-32c0-35.297-28.703-64-64-64s-64 28.703-64 64H64v384h320V64h-64zM128 96h64V64c0-17.641 14.359-32 32-32s32 14.359 32 32v32h64v32H128V96zm56 287.758l-79.844-79.828 31.688-31.688L184 320.414l128.156-128.172 31.688 31.688L184 383.758z"
    />
  ),
  // icon_insect - Bug
  Bug: (
    <path
      fill="currentColor"
      d="M315.754 144.311c2.537-8.59 4.246-17.281 4.246-26.107 0-21.189-7.117-40.617-18.789-56.514.387-.32.865-.453 1.227-.814L336 27.313c6.25-6.25 6.25-16.375 0-22.625s-16.375-6.25-22.625 0L279.813 38.25c-.412.412-.57.953-.928 1.396C263.303 28.725 244.432 22.203 224 22.203c-20.436 0-39.311 6.527-54.895 17.453-.359-.447-.52-.992-.934-1.406L134.609 4.688c-6.25-6.25-16.375-6.25-22.625 0s-6.25 16.375 0 22.625l33.563 33.563c.365.365.846.5 1.236.822C135.115 77.594 128 97.016 128 118.203c0 8.828 1.707 17.52 4.244 26.107-45.719 30.018-76.082 81.572-76.082 140.229 0 71.904 46.189 135.646 114.963 158.592L185.68 448l8.557-36.496C203.891 414.174 213.801 416 224 416c10.197 0 20.109-1.826 29.764-4.498L262.32 448l14.555-4.869c68.773-22.945 114.963-86.688 114.963-158.592 0-58.656-30.363-110.211-76.084-140.228zM256 224c0-17.674 14.326-32 32-32s32 14.326 32 32c0 17.672-14.326 32-32 32s-32-14.328-32-32zm-96-105.797c0-35.297 28.703-64 64-64 35.281 0 64 28.703 64 64 0 3.648-.559 7.293-1.238 10.932-19.426-7.875-40.547-12.434-62.762-12.434s-43.336 4.559-62.762 12.434c-.679-3.639-1.238-7.283-1.238-10.932zM160 192c17.674 0 32 14.326 32 32 0 17.672-14.326 32-32 32s-32-14.328-32-32c0-17.674 14.326-32 32-32zM96 320c0-17.674 14.326-32 32-32s32 14.326 32 32c0 17.672-14.326 32-32 32s-32-14.328-32-32zm105.625 59.98L224 284.539l22.375 95.443a84.149 84.149 0 0 1-44.75-.002zM320 352c-17.674 0-32-14.328-32-32 0-17.674 14.326-32 32-32s32 14.326 32 32c0 17.672-14.326 32-32 32z"
    />
  ),
  // icon_book - User Story / Product Backlog Item
  "User Story": (
    <path
      fill="currentColor"
      d="M320 352c-22.846 0-60.713 5.861-80 16.588V55.635C257.752 40.563 296.084 32 320 32h64v320h-64zm-192 32H32V64H0v352h208s-16-32-80-32zM64 32v320h64c22.848 0 60.707 5.865 80 16.594V55.635C190.244 40.561 151.902 32 128 32H64zm352 32v320h-96c-64 0-80 32-80 32h208V64h-32z"
    />
  ),
  // icon_trophy - Feature
  Feature: (
    <path
      fill="currentColor"
      d="M145.619 384H128c-17.674 0-32 14.326-32 32v32h256v-32c0-17.674-14.327-32-32-32h-17.619c-7.434-36.47-39.75-64-78.381-64s-70.947 27.53-78.381 64zM224 352c20.832 0 38.425 13.418 45.053 32h-90.106c6.627-18.582 24.221-32 45.053-32zM352 64V32H96v32H32v80c0 40.051 29.686 73.018 68.153 78.8C114.003 278.531 163.984 320 224 320c60.016 0 109.997-41.469 123.846-97.2C386.313 217.018 416 184.051 416 144V64h-64zM96 189.053C77.417 182.426 64 164.832 64 144V96h32v93.053zM384 144c0 20.832-13.418 38.426-32 45.053V96h32v48z"
    />
  ),
  // icon_crown - Epic
  Epic: (
    <path
      fill="currentColor"
      d="M448 96c0 17.672-14.326 32-32 32v288H32V128c-17.674 0-32-14.328-32-32 0-17.674 14.326-32 32-32s32 14.326 32 32c0 11.191-6.094 20.564-14.797 26.283L136.727 256 216.79 94.543C202.699 91.191 192 79.113 192 64c0-17.674 14.326-32 32-32s32 14.326 32 32c0 15.113-10.699 27.191-24.789 30.543L311.273 256l87.523-133.717C390.094 116.564 384 107.191 384 96c0-17.674 14.326-32 32-32s32 14.326 32 32z"
    />
  ),
  // icon_traffic_cone - Impediment
  Impediment: (
    <path
      fill="currentColor"
      d="M379.82 416L256 32h-64l-41.273 128H224v32h-83.592l-30.955 96H256v32H99.135L68.18 416H0v32h448v-32z"
    />
  ),
};

// Alias para Product Backlog Item (mesmo ícone de User Story)
OfficialIcons["Product Backlog Item"] = OfficialIcons["User Story"];

// Issue usa o mesmo ícone de Bug
OfficialIcons["Issue"] = OfficialIcons["Bug"];

// Ícone padrão (clipboard genérico)
const DefaultIcon = OfficialIcons.Task;

export function WorkItemIcon({ type, size = 16, className }: WorkItemIconProps) {
  const color = WORK_ITEM_COLORS[type] || "#666";
  const iconPath = OfficialIcons[type] || DefaultIcon;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 448 448"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ color, flexShrink: 0 }}
    >
      {iconPath}
    </svg>
  );
}

export function getWorkItemColor(type: string): string {
  return WORK_ITEM_COLORS[type] || "#666";
}
