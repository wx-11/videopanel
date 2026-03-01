import React, { useState, useEffect, useRef } from 'react';
import { comfyuiEndpoints, comfyuiProgressPercent, pickComfyuiVideoUrl, parseComfyuiModelsList, parseOpenAiLikeErrorMessage } from './comfyuiApi.js';
import { detectUpstreamStreamFailure } from './streamErrors.js';

// --- 图标组件 (Icons) ---
const IconPlus = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);
const IconMinus = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/></svg>
);
const IconEdit = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
);
const IconFolder = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
);
const IconSettings = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);
const IconTerminal = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
);
const IconCheck = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>
);
const IconLink = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
);
const IconLoader = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`animate-spin ${className}`}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);
const IconX = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const IconTrash = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);
const IconClock = ({ size = 16, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const IconLayers = ({ size = 16, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
);
const IconImage = ({ size = 16, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
);
const IconType = ({ size = 16, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>
);
const IconRepeat = ({ size = 16, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>
);
const IconScript = ({ size = 16, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
);
const IconCopy = ({ size = 16, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
);
const IconMic = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 14a4 4 0 0 0 4-4V6a4 4 0 1 0-8 0v4a4 4 0 0 0 4 4Z" />
    <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="8" y1="22" x2="16" y2="22" />
  </svg>
);
const IconArrowUp = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 19V5" />
    <path d="m5 12 7-7 7 7" />
  </svg>
);

const STORAGE_KEYS = {
  config: 'sora2_manager_config_v1',
  queue: 'sora2_manager_queue_v1',
  projects: 'sora2_manager_projects_v1',
  ui: 'sora2_manager_ui_v1',
};

const MAX_SAVED_TASKS = 200;
const PROJECT_IMAGES_DB = {
  name: 'sora2_manager_project_images_v1',
  version: 1,
  store: 'images',
};
const TASK_OUTPUTS_DB = {
  name: 'sora2_manager_task_outputs_v1',
  version: 1,
  store: 'outputs',
};

const safeJsonParse = (value, fallback) => {
  if (!value || typeof value !== 'string') return fallback;
  try {
    return JSON.parse(value);
  } catch (e) {
    return fallback;
  }
};

const inferDefaultBaseUrl = () => {
  try {
    if (typeof window === 'undefined') return 'http://localhost:8000/v1/chat/completions';
    const protocol = window.location?.protocol;
    const hostname = window.location?.hostname;
    const port = window.location?.port;
    const isHttp = protocol === 'http:' || protocol === 'https:';
    const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isViteDev = port === '5173' || port === '4173';
    if (isHttp && hostname) {
      if (!isLocalHost) return '/v1/chat/completions';
      if (!isViteDev) return '/v1/chat/completions';
    }
  } catch (e) { }
  return 'http://localhost:8000/v1/chat/completions';
};

const inferDefaultComfyuiBaseUrl = () => {
  try {
    const fromEnv = String(import.meta?.env?.VITE_COMFYUI2API_BASE_URL || '').trim();
    if (fromEnv) return fromEnv;
  } catch (e) { }

  try {
    if (typeof window === 'undefined') return 'http://127.0.0.1:8000';
    const protocol = window.location?.protocol;
    const hostname = window.location?.hostname;
    const port = window.location?.port;
    const isHttp = protocol === 'http:' || protocol === 'https:';
    const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isViteDev = port === '5173' || port === '4173';
    if (isHttp && hostname) {
      if (!isLocalHost) return '/comfyui';
      if (!isViteDev) return '/comfyui';
    }
  } catch (e) { }

  return 'http://127.0.0.1:8000';
};

const DEFAULT_CONFIG = {
  baseUrl: inferDefaultBaseUrl(),
  comfyuiBaseUrl: inferDefaultComfyuiBaseUrl(),
  apiKey: '',
  maxConcurrent: 3,
  taskInterval: 1.0,
};

const DEFAULT_UI_STATE = {
  workMode: 'video',
  activeProjectId: 1,
  videoProvider: 'sora',
  comfyuiModel: '',
  orientation: 'portrait',
  duration: '15s',
  modelFamily: 'sora2',
  imageModel: 'gpt-image',
  generationType: 'image',
  recordsScope: 'project',
  batchMode: 'script',
  repeatCount: 5,
};

const getInitialConfig = () => {
  if (typeof window === 'undefined' || !window.localStorage) return { ...DEFAULT_CONFIG };

  const saved = safeJsonParse(window.localStorage.getItem(STORAGE_KEYS.config), null);
  if (!saved || typeof saved !== 'object') return { ...DEFAULT_CONFIG };

  return {
    ...DEFAULT_CONFIG,
    baseUrl: typeof saved.baseUrl === 'string' ? saved.baseUrl : DEFAULT_CONFIG.baseUrl,
    comfyuiBaseUrl: typeof saved.comfyuiBaseUrl === 'string' ? saved.comfyuiBaseUrl : DEFAULT_CONFIG.comfyuiBaseUrl,
    apiKey: typeof saved.apiKey === 'string' ? saved.apiKey : DEFAULT_CONFIG.apiKey,
    maxConcurrent: Math.max(1, parseInt(saved.maxConcurrent, 10) || DEFAULT_CONFIG.maxConcurrent),
    taskInterval: Math.max(0.1, parseFloat(saved.taskInterval) || DEFAULT_CONFIG.taskInterval),
  };
};

const getInitialUiState = () => {
  if (typeof window === 'undefined' || !window.localStorage) return { ...DEFAULT_UI_STATE };

  const saved = safeJsonParse(window.localStorage.getItem(STORAGE_KEYS.ui), null);
  if (!saved || typeof saved !== 'object') return { ...DEFAULT_UI_STATE };

  const rawActiveProjectId = saved.activeProjectId;
  let activeProjectId = typeof rawActiveProjectId === 'number' ? rawActiveProjectId : parseInt(rawActiveProjectId, 10);
  if (!Number.isFinite(activeProjectId)) activeProjectId = DEFAULT_UI_STATE.activeProjectId;

  const allowedModelFamilies = new Set([
    'sora2',
    'sora2pro',
    'sora2pro-hd',
    'prompt-enhance-short',
    'prompt-enhance-medium',
    'prompt-enhance-long',
  ]);
  const allowedVideoProviders = new Set(['sora', 'comfyui']);
  const allowedWorkModes = new Set(['video', 'image']);
  const allowedImageModels = new Set(['gpt-image', 'gpt-image-landscape', 'gpt-image-portrait']);

  return {
    ...DEFAULT_UI_STATE,
    workMode: (typeof saved.workMode === 'string' && allowedWorkModes.has(saved.workMode)) ? saved.workMode : DEFAULT_UI_STATE.workMode,
    activeProjectId,
    videoProvider: (typeof saved.videoProvider === 'string' && allowedVideoProviders.has(saved.videoProvider)) ? saved.videoProvider : DEFAULT_UI_STATE.videoProvider,
    comfyuiModel: typeof saved.comfyuiModel === 'string' ? saved.comfyuiModel : DEFAULT_UI_STATE.comfyuiModel,
    orientation: saved.orientation === 'landscape' || saved.orientation === 'portrait' ? saved.orientation : DEFAULT_UI_STATE.orientation,
    duration: saved.duration === '10s' || saved.duration === '15s' ? saved.duration : DEFAULT_UI_STATE.duration,
    modelFamily: (typeof saved.modelFamily === 'string' && allowedModelFamilies.has(saved.modelFamily)) ? saved.modelFamily : DEFAULT_UI_STATE.modelFamily,
    imageModel: (typeof saved.imageModel === 'string' && allowedImageModels.has(saved.imageModel)) ? saved.imageModel : DEFAULT_UI_STATE.imageModel,
    generationType: saved.generationType === 'text' || saved.generationType === 'image' ? saved.generationType : DEFAULT_UI_STATE.generationType,
    recordsScope: saved.recordsScope === 'all' ? 'all' : DEFAULT_UI_STATE.recordsScope,
    batchMode: saved.batchMode === 'repeat' || saved.batchMode === 'script' ? saved.batchMode : DEFAULT_UI_STATE.batchMode,
    repeatCount: Math.max(1, parseInt(saved.repeatCount, 10) || DEFAULT_UI_STATE.repeatCount),
  };
};

const normalizeLoadedProject = (input) => {
  if (!input || typeof input !== 'object') return null;

  const rawId = input.id;
  let id = typeof rawId === 'number' ? rawId : parseInt(rawId, 10);
  if (!Number.isFinite(id)) id = Date.now() + Math.random();

  const project = {
    id,
    name: input.name ? String(input.name) : `项目 ${id}`,
    prompt: input.prompt ? String(input.prompt) : '',
    image: (typeof input.image === 'string' && input.image.startsWith('data:')) ? input.image : null,
    imageName: input.imageName ? String(input.imageName) : null,
  };

  return project;
};

const getInitialProjects = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [
      { id: 1, name: '示例项目 A', prompt: 'Product cinematic shot on a wooden table, 这是台词文案, 4k resolution.', image: null, imageName: null },
    ];
  }

  const saved = safeJsonParse(window.localStorage.getItem(STORAGE_KEYS.projects), null);
  if (!Array.isArray(saved) || saved.length === 0) {
    return [
      { id: 1, name: '示例项目 A', prompt: 'Product cinematic shot on a wooden table, 这是台词文案, 4k resolution.', image: null, imageName: null },
    ];
  }

  const projects = saved.map(normalizeLoadedProject).filter(Boolean);
  return projects.length > 0 ? projects : [
    { id: 1, name: '示例项目 A', prompt: 'Product cinematic shot on a wooden table, 这是台词文案, 4k resolution.', image: null, imageName: null },
  ];
};

let projectImagesDbPromise = null;
const getProjectImagesDb = () => {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  if (projectImagesDbPromise) return projectImagesDbPromise;

  projectImagesDbPromise = new Promise((resolve) => {
    try {
      const request = indexedDB.open(PROJECT_IMAGES_DB.name, PROJECT_IMAGES_DB.version);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(PROJECT_IMAGES_DB.store)) {
          db.createObjectStore(PROJECT_IMAGES_DB.store);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });

  return projectImagesDbPromise;
};

const idbGetProjectImage = async (projectId) => {
  const db = await getProjectImagesDb();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(PROJECT_IMAGES_DB.store, 'readonly');
      const store = tx.objectStore(PROJECT_IMAGES_DB.store);
      const req = store.get(String(projectId));
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
};

const idbSetProjectImage = async (projectId, dataUrl) => {
  const db = await getProjectImagesDb();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(PROJECT_IMAGES_DB.store, 'readwrite');
      const store = tx.objectStore(PROJECT_IMAGES_DB.store);
      store.put({ dataUrl: String(dataUrl), updatedAt: Date.now() }, String(projectId));
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
};

const idbDeleteProjectImage = async (projectId) => {
  const db = await getProjectImagesDb();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(PROJECT_IMAGES_DB.store, 'readwrite');
      const store = tx.objectStore(PROJECT_IMAGES_DB.store);
      store.delete(String(projectId));
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
};

let taskOutputsDbPromise = null;
const getTaskOutputsDb = () => {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  if (taskOutputsDbPromise) return taskOutputsDbPromise;

  taskOutputsDbPromise = new Promise((resolve) => {
    try {
      const request = indexedDB.open(TASK_OUTPUTS_DB.name, TASK_OUTPUTS_DB.version);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(TASK_OUTPUTS_DB.store)) {
          db.createObjectStore(TASK_OUTPUTS_DB.store);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });

  return taskOutputsDbPromise;
};

const idbGetTaskOutput = async (taskId) => {
  const db = await getTaskOutputsDb();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(TASK_OUTPUTS_DB.store, 'readonly');
      const store = tx.objectStore(TASK_OUTPUTS_DB.store);
      const req = store.get(String(taskId));
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
};

const idbSetTaskOutput = async (taskId, dataUrl) => {
  const db = await getTaskOutputsDb();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(TASK_OUTPUTS_DB.store, 'readwrite');
      const store = tx.objectStore(TASK_OUTPUTS_DB.store);
      store.put({ dataUrl: String(dataUrl), updatedAt: Date.now() }, String(taskId));
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
};

const idbDeleteTaskOutput = async (taskId) => {
  const db = await getTaskOutputsDb();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(TASK_OUTPUTS_DB.store, 'readwrite');
      const store = tx.objectStore(TASK_OUTPUTS_DB.store);
      store.delete(String(taskId));
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
};

const normalizeLoadedTask = (input) => {
  if (!input || typeof input !== 'object') return null;

  const rawProjectId = input.projectId;
  let projectId = typeof rawProjectId === 'number' ? rawProjectId : parseInt(rawProjectId, 10);
  if (!Number.isFinite(projectId)) projectId = null;

  const status = typeof input.status === 'string' ? input.status : 'FAILED';
  const progressRaw = typeof input.progress === 'number' ? input.progress : parseInt(input.progress, 10);
  const progress = Number.isFinite(progressRaw) ? Math.max(0, Math.min(100, progressRaw)) : 0;
  const mediaType = input.mediaType === 'image' ? 'image' : 'video';
  const rawGenerationType = typeof input.generationType === 'string' ? input.generationType : null;
  const generationType = rawGenerationType === 'text' || rawGenerationType === 'image' ? rawGenerationType : 'image';
  const rawProvider = typeof input.provider === 'string' ? input.provider : null;
  const provider = (rawProvider === 'sora' || rawProvider === 'comfyui')
      ? rawProvider
      : (mediaType === 'video' ? 'sora' : null);

  const normalized = {
    id: input.id ?? (Date.now() + Math.random()),
    projectId,
    projectName: input.projectName ? String(input.projectName) : '',
    prompt: input.prompt ? String(input.prompt) : '',
    scriptSnippet: input.scriptSnippet ? String(input.scriptSnippet) : '',
    mediaType,
    provider,
    status,
    stage: input.stage ? String(input.stage) : '',
    progress,
    videoUrl: input.videoUrl ? String(input.videoUrl) : null,
    imageUrl: input.imageUrl ? String(input.imageUrl) : null,
    imageStored: Boolean(input.imageStored),
    errorMessage: input.errorMessage ? String(input.errorMessage) : null,
    streamLog: input.streamLog ? String(input.streamLog) : '',
    warning: input.warning ? String(input.warning) : null,
    timestamp: input.timestamp ? String(input.timestamp) : new Date().toLocaleString(),
    modelUsed: input.modelUsed ? String(input.modelUsed) : undefined,
    generationType,
    image: null,
  };

  const isTerminal = normalized.status === 'COMPLETED' || normalized.status === 'FAILED';
  if (!isTerminal) {
    normalized.status = 'FAILED';
    normalized.stage = '已中断';
    normalized.progress = 0;
    normalized.errorMessage = normalized.errorMessage || '任务在上次运行中被中断（未完成）。';
  }

  if (normalized.status === 'COMPLETED' && normalized.mediaType === 'video' && !normalized.videoUrl) {
    normalized.status = 'FAILED';
    normalized.stage = '无视频链接';
    normalized.progress = 0;
    normalized.errorMessage = normalized.errorMessage || '记录缺少 videoUrl，无法播放或下载。';
  }

  if (normalized.status === 'COMPLETED' && normalized.mediaType === 'image' && !normalized.imageUrl && !normalized.imageStored) {
    normalized.status = 'FAILED';
    normalized.stage = 'No image result';
    normalized.progress = 0;
    normalized.errorMessage = normalized.errorMessage || 'Record missing imageUrl; cannot preview or download.';
  }

  return normalized;
};

const getInitialQueue = () => {
  if (typeof window === 'undefined' || !window.localStorage) return [];

  const saved = safeJsonParse(window.localStorage.getItem(STORAGE_KEYS.queue), []);
  if (!Array.isArray(saved)) return [];

  return saved.map(normalizeLoadedTask).filter(Boolean);
};


export default function App() {
  const initialUiStateRef = useRef(null);
  if (initialUiStateRef.current === null) {
    initialUiStateRef.current = getInitialUiState();
  }
  const initialUiState = initialUiStateRef.current;

  // --- 全局配置 ---
  const [config, setConfig] = useState(() => getInitialConfig());
  const [gatewayAuthStatus, setGatewayAuthStatus] = useState(() => ({ enabled: false, authed: true, checked: false }));
  const [showGatewayAuthModal, setShowGatewayAuthModal] = useState(false);
  const [gatewayPasswordDraft, setGatewayPasswordDraft] = useState('');
  const [gatewayAuthSubmitting, setGatewayAuthSubmitting] = useState(false);
  const [gatewayAuthError, setGatewayAuthError] = useState('');

  // --- 项目管理状态 ---
  const [projects, setProjects] = useState(() => getInitialProjects());
  const [activeProjectId, setActiveProjectId] = useState(() => initialUiState.activeProjectId);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editName, setEditName] = useState('');
  const [pendingDeleteProject, setPendingDeleteProject] = useState(null);

  // --- 当前项目输入状态 ---
  const [workMode, setWorkMode] = useState(() => initialUiState.workMode);
  const [activeProject, setActiveProject] = useState(() => projects.find(p => p.id === initialUiState.activeProjectId) || projects[0]);
  const [videoProvider, setVideoProvider] = useState(() => initialUiState.videoProvider || 'sora');
  const [comfyuiModel, setComfyuiModel] = useState(() => initialUiState.comfyuiModel || '');
  const [comfyuiModels, setComfyuiModels] = useState([]);
  const [comfyuiModelsLoading, setComfyuiModelsLoading] = useState(false);
  const [comfyuiModelsError, setComfyuiModelsError] = useState('');
  const [orientation, setOrientation] = useState(() => initialUiState.orientation);
  const [duration, setDuration] = useState(() => initialUiState.duration);
  const [modelFamily, setModelFamily] = useState(() => initialUiState.modelFamily);
  const [imageModel, setImageModel] = useState(() => initialUiState.imageModel);
  const selectedVideoModelName = videoProvider === 'comfyui'
      ? String(comfyuiModel || '').trim()
      : (modelFamily.startsWith('prompt-enhance')
          ? `${modelFamily}-${duration}`
          : `${modelFamily}-${orientation}-${duration}`);
  const selectedImageModelName = imageModel;
  const selectedModelName = workMode === 'image' ? selectedImageModelName : selectedVideoModelName;
  const [generationType, setGenerationType] = useState(() => initialUiState.generationType); 
  const [recordsScope, setRecordsScope] = useState(() => initialUiState.recordsScope || 'project');

  const desiredComfyuiWorkflowKind = generationType === 'image' ? 'img2video' : 'txt2video';
  const comfyuiModelsForVideoKind = Array.isArray(comfyuiModels) ? comfyuiModels.filter((m) => String(m?.kind || '').toLowerCase() === desiredComfyuiWorkflowKind) : [];
  const comfyuiWorkflowSuggestions = comfyuiModelsForVideoKind.length > 0 ? comfyuiModelsForVideoKind : (Array.isArray(comfyuiModels) ? comfyuiModels : []);

  // --- 批量生成状态 ---
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchMode, setBatchMode] = useState(() => initialUiState.batchMode); 
  const [batchScripts, setBatchScripts] = useState(['']);
  const [repeatCount, setRepeatCount] = useState(() => initialUiState.repeatCount);
  
  // --- App 状态 ---
  const [showDebug, setShowDebug] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [queue, setQueue] = useState(() => getInitialQueue());
  const [logs, setLogs] = useState([]);
  const [curlPreview, setCurlPreview] = useState('');
  
  // --- 交互状态 (Toast, Tooltip) ---
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [activeVideoTaskId, setActiveVideoTaskId] = useState(null);
  const [activeImageTaskId, setActiveImageTaskId] = useState(null);
  const [composerText, setComposerText] = useState('');
  const [composerImage, setComposerImage] = useState(null);
  const [composerImageName, setComposerImageName] = useState('');

  // --- 调度器状态 ---
  const logsEndRef = useRef(null);
  const chatScrollRef = useRef(null);
  const chatEndRef = useRef(null);
  const composerFileInputRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);
  const batchInputRef = useRef(null);
  const lastTaskStartTime = useRef(0);
  const [tick, setTick] = useState(0);
  const toastTimer = useRef(null);
  const persistConfigTimer = useRef(null);
  const persistQueueTimer = useRef(null);
  const persistProjectsTimer = useRef(null);
  const persistUiTimer = useRef(null);
  const didMigrateQueueProjectIds = useRef(false);

  const gatewayAuthEnabled = Boolean(gatewayAuthStatus?.enabled);
  const gatewayAuthChecked = Boolean(gatewayAuthStatus?.checked);
  const isGatewayAuthed = !gatewayAuthEnabled || Boolean(gatewayAuthStatus?.authed);

  const redirectToLogin = () => {
    try {
      if (typeof window === 'undefined') return;
      const pathname = String(window.location?.pathname || '/');
      if (pathname === '/login' || pathname.startsWith('/login/')) return;
      const next = `${pathname}${String(window.location?.search || '')}`;
      window.location.href = `/login?next=${encodeURIComponent(next || '/')}`;
    } catch (e) { }
  };

  const refreshGatewayAuthStatus = async ({ openModalOnNeed = false } = {}) => {
    try {
      const response = await fetch('/auth/status', { credentials: 'same-origin' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const next = {
        enabled: Boolean(data?.enabled),
        authed: Boolean(data?.authed),
        checked: true,
      };
      setGatewayAuthStatus(next);
      if (next.enabled && !next.authed) redirectToLogin();
      return next;
    } catch (e) {
      const next = { enabled: false, authed: true, checked: true };
      setGatewayAuthStatus(next);
      return next;
    }
  };

  const openGatewayAuthModal = () => {
    setGatewayAuthError('');
    setGatewayPasswordDraft('');
    setShowGatewayAuthModal(true);
  };

  const submitGatewayLogin = async () => {
    const password = String(gatewayPasswordDraft || '').trim();
    if (!password) return;
    setGatewayAuthSubmitting(true);
    setGatewayAuthError('');
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'same-origin',
      });

      if (!response.ok) {
        let msg = `HTTP ${response.status}`;
        try {
          const errorText = await response.text();
          if (errorText) msg = errorText;
        } catch (e) { }
        throw new Error(msg);
      }

      await refreshGatewayAuthStatus();
      setShowGatewayAuthModal(false);
      setGatewayPasswordDraft('');
    } catch (e) {
      setGatewayAuthError('密码错误或服务端未正确配置鉴权');
      await refreshGatewayAuthStatus();
    } finally {
      setGatewayAuthSubmitting(false);
    }
  };

  const logoutGatewayAuth = async () => {
    try {
      await fetch('/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } catch (e) { }
    await refreshGatewayAuthStatus();
  };

  const getAuthorizationHeader = () => {
    const apiKey = String(config.apiKey || '').trim();
    return apiKey ? `Bearer ${apiKey}` : null;
  };

  const buildRequestHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    const authHeader = getAuthorizationHeader();
    if (authHeader) headers.Authorization = authHeader;
    return headers;
  };

  const loadComfyuiModels = async () => {
    try {
      setComfyuiModelsError('');
      setComfyuiModelsLoading(true);

      const base = String(config?.comfyuiBaseUrl || '').trim();
      if (!base) throw new Error('Missing ComfyUI2API Base URL');
      const { models } = comfyuiEndpoints(base);

      const res = await fetch(models, { headers: buildRequestHeaders() });
      if (!res.ok) {
        let errorMsg = `HTTP ${res.status}`;
        try {
          const errorText = await res.text();
          errorMsg = parseOpenAiLikeErrorMessage(errorText) || errorText || errorMsg;
        } catch (e) { }
        throw new Error(errorMsg);
      }

      const payload = await res.json();
      const list = parseComfyuiModelsList(payload).sort((a, b) => String(a.id).localeCompare(String(b.id)));
      setComfyuiModels(list);
      if (list.length === 0) setComfyuiModelsError('No workflows found from /v1/models');
    } catch (e) {
      setComfyuiModels([]);
      setComfyuiModelsError(String(e?.message || e || 'Failed to load models'));
    } finally {
      setComfyuiModelsLoading(false);
    }
  };

  const ensureGatewayAuthed = () => {
    if (!gatewayAuthChecked) {
      refreshGatewayAuthStatus({ openModalOnNeed: true });
      return false;
    }
    if (!gatewayAuthEnabled) return true;
    if (isGatewayAuthed) return true;
    redirectToLogin();
    return false;
  };

  // --- 辅助函数：复制并显示 Toast ---
  const handleCopy = (text) => {
      if (!text) return;
      const strToCopy = typeof text === 'string' ? text : JSON.stringify(text);
      navigator.clipboard.writeText(strToCopy);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToastVisible(true);
      toastTimer.current = setTimeout(() => setToastVisible(false), 1000);
  };

  // --- 效果钩子 ---

  useEffect(() => {
    const checkConnection = () => {
        if (window.electronAPI && (typeof window.electronAPI.downloadFile === 'function' || typeof window.electronAPI.downloadVideo === 'function')) {
            addLog("系统: 原生模块已成功连接。", "success");
        } else {
            addLog("系统: 未检测到原生模块，功能受限 (网页模式)。", "error");
        }
    };
    const timer = setTimeout(checkConnection, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    refreshGatewayAuthStatus({ openModalOnNeed: true });
  }, []);

  useEffect(() => {
    setComfyuiModels([]);
    setComfyuiModelsError('');
  }, [config.comfyuiBaseUrl]);

  useEffect(() => {
    if (workMode !== 'video') return;
    if (videoProvider !== 'comfyui') return;
    if (comfyuiModelsLoading) return;
    if (Array.isArray(comfyuiModels) && comfyuiModels.length > 0) return;
    const base = String(config?.comfyuiBaseUrl || '').trim();
    if (!base) return;
    loadComfyuiModels();
  }, [workMode, videoProvider, config.comfyuiBaseUrl]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return;

    if (persistConfigTimer.current) clearTimeout(persistConfigTimer.current);
    persistConfigTimer.current = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(config));
      } catch (e) { }
    }, 200);

    return () => {
      if (persistConfigTimer.current) clearTimeout(persistConfigTimer.current);
    };
  }, [config]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return;

    if (persistQueueTimer.current) clearTimeout(persistQueueTimer.current);
    persistQueueTimer.current = setTimeout(() => {
      try {
        const tasksToSave = queue.slice(0, MAX_SAVED_TASKS).map((t) => {
          const rawImageUrl = t.imageUrl ? String(t.imageUrl) : null;
          const safeImageUrl = rawImageUrl && !rawImageUrl.startsWith('data:') ? rawImageUrl : null;
          const imageStored = Boolean(t.imageStored) || (rawImageUrl && rawImageUrl.startsWith('data:'));

          return {
            id: t.id,
            projectId: t.projectId,
            projectName: t.projectName,
            prompt: t.prompt,
            scriptSnippet: t.scriptSnippet,
            mediaType: t.mediaType,
            provider: t.provider,
            status: t.status,
            stage: t.stage,
            progress: t.progress,
            videoUrl: t.videoUrl,
            imageUrl: safeImageUrl,
            imageStored,
            errorMessage: t.errorMessage,
            streamLog: t.streamLog ? String(t.streamLog).slice(-1000) : '',
            warning: t.warning,
            timestamp: t.timestamp,
            modelUsed: t.modelUsed,
            generationType: t.generationType,
          };
        });
        window.localStorage.setItem(STORAGE_KEYS.queue, JSON.stringify(tasksToSave));
      } catch (e) { }
    }, 1000);

    return () => {
      if (persistQueueTimer.current) clearTimeout(persistQueueTimer.current);
    };
  }, [queue]);

  useEffect(() => {
    if (didMigrateQueueProjectIds.current) return;
    if (!Array.isArray(queue) || queue.length === 0) {
      didMigrateQueueProjectIds.current = true;
      return;
    }
    if (!Array.isArray(projects) || projects.length === 0) return;

    const nameToId = new Map(projects.map(p => [String(p.name || ''), p.id]));
    let changed = false;
    const migrated = queue.map((t) => {
      if (t.projectId !== null && t.projectId !== undefined) return t;
      const mappedId = nameToId.get(String(t.projectName || ''));
      if (mappedId === null || mappedId === undefined) return t;
      changed = true;
      return { ...t, projectId: mappedId };
    });

    if (changed) setQueue(migrated);
    didMigrateQueueProjectIds.current = true;
  }, [queue, projects]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return;

    if (persistUiTimer.current) clearTimeout(persistUiTimer.current);
    persistUiTimer.current = setTimeout(() => {
      try {
        const uiState = {
          workMode,
          activeProjectId,
          videoProvider,
          comfyuiModel,
          orientation,
          duration,
          modelFamily,
          imageModel,
          generationType,
          recordsScope,
          batchMode,
          repeatCount,
        };
        window.localStorage.setItem(STORAGE_KEYS.ui, JSON.stringify(uiState));
      } catch (e) { }
    }, 200);

    return () => {
      if (persistUiTimer.current) clearTimeout(persistUiTimer.current);
    };
  }, [workMode, activeProjectId, videoProvider, comfyuiModel, orientation, duration, modelFamily, imageModel, generationType, recordsScope, batchMode, repeatCount]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return;

    if (persistProjectsTimer.current) clearTimeout(persistProjectsTimer.current);
    persistProjectsTimer.current = setTimeout(() => {
      try {
        const canUseIdb = typeof indexedDB !== 'undefined';
        const projectsToSave = projects.map((p) => ({
          id: p.id,
          name: p.name,
          prompt: p.prompt,
          imageName: p.imageName,
          image: canUseIdb ? undefined : p.image,
        }));
        window.localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projectsToSave));
      } catch (e) { }
    }, 500);

    return () => {
      if (persistProjectsTimer.current) clearTimeout(persistProjectsTimer.current);
    };
  }, [projects]);

  useEffect(() => {
    if (!Array.isArray(projects) || projects.length === 0) return;
    if (!projects.some(p => p.id === activeProjectId)) {
      setActiveProjectId(projects[0].id);
    }
  }, [projects, activeProjectId]);

  useEffect(() => {
    let cancelled = false;

    const hydrateImages = async () => {
      const snapshot = Array.isArray(projects) ? projects : [];
      for (const proj of snapshot) {
        if (cancelled) return;
        if (!proj?.id || proj.image) continue;

        const record = await idbGetProjectImage(proj.id);
        if (cancelled) return;

        const dataUrl = record?.dataUrl;
        if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
          setProjects(prev => prev.map(p => p.id === proj.id ? { ...p, image: dataUrl } : p));
        }
      }
    };

    hydrateImages();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const hydrateTaskOutputs = async () => {
      const snapshot = Array.isArray(queue) ? queue : [];
      for (const task of snapshot) {
        if (cancelled) return;
        if (!task?.id) continue;
        if (task.mediaType !== 'image') continue;
        if (task.status !== 'COMPLETED') continue;
        if (task.imageUrl) continue;
        if (!task.imageStored) continue;

        const record = await idbGetTaskOutput(task.id);
        if (cancelled) return;

        const dataUrl = record?.dataUrl;
        if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
          setQueue(prev => prev.map(t => t.id === task.id ? { ...t, imageUrl: dataUrl } : t));
        }
      }
    };

    hydrateTaskOutputs();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const runningCount = queue.filter(t => t.status === 'GENERATING' || t.status === 'STARTING' || t.status === 'PROCESSING' || t.status === 'CACHING').length;
    const pendingTasks = queue.filter(t => t.status === 'PENDING');

    if (!gatewayAuthChecked) return;
    if (gatewayAuthEnabled && !isGatewayAuthed) return;

    if (runningCount < parseInt(config.maxConcurrent) && pendingTasks.length > 0) {
        const now = Date.now();
        const intervalMs = (parseFloat(config.taskInterval) || 1.0) * 1000;
        const timeSinceLastStart = now - lastTaskStartTime.current;
        
        if (timeSinceLastStart < intervalMs) {
            const delay = intervalMs - timeSinceLastStart;
            const timerId = setTimeout(() => setTick(t => t + 1), delay);
            return () => clearTimeout(timerId);
        }

        const nextTask = pendingTasks[pendingTasks.length - 1]; 
        if (nextTask) {
            lastTaskStartTime.current = Date.now();
            updateTask(nextTask.id, { status: 'STARTING', stage: '准备发射' });
             processTask(nextTask.id, nextTask.prompt, nextTask.image, nextTask.generationType, nextTask.modelUsed, nextTask.mediaType, nextTask.provider);
         }
     }
  }, [queue, config.maxConcurrent, config.taskInterval, tick, isGatewayAuthed, gatewayAuthChecked, gatewayAuthEnabled]);

  useEffect(() => {
      const proj = projects.find(p => p.id === activeProjectId);
      if (!proj) return;
      setActiveProject(prev => {
          if (!prev) return proj;
          if (prev.id !== proj.id) return proj;
          if (
              prev.name === proj.name &&
              prev.prompt === proj.prompt &&
              prev.image === proj.image &&
              prev.imageName === proj.imageName
          ) {
              return prev;
          }
          return proj;
      });
  }, [activeProjectId, projects]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (!shouldAutoScrollRef.current) return;
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [queue, recordsScope, activeProjectId]);

  useEffect(() => {
      if (showBatchModal && batchMode === 'script') {
          batchInputRef.current?.focus();
      }
  }, [showBatchModal, batchMode]);

  useEffect(() => {
    if (!activeProject) return;
    let previewPrompt = String(activeProject.prompt || '');
    if (previewPrompt.includes('台词文案')) {
        previewPrompt = previewPrompt.replace('这是台词文案', '[台词文案]');
    }

    if (workMode === 'video' && videoProvider === 'comfyui') {
      const { createVideo } = comfyuiEndpoints(config.comfyuiBaseUrl);
      const resolvedUrl = typeof window !== 'undefined' && String(createVideo || '').startsWith('/')
          ? `${window.location.origin}${String(createVideo)}`
          : String(createVideo || '');
      const authLine = config.apiKey ? `  -H "Authorization: Bearer ${config.apiKey}" \\\n` : '';

      const seconds = parseInt(String(duration || ''), 10);
      const previewJson = {
        prompt: previewPrompt,
        ...(Number.isFinite(seconds) ? { duration: seconds } : {}),
        size: orientation === 'portrait' ? '720x1280' : '1280x720',
        ...(selectedModelName ? { model: selectedModelName } : {}),
        ...(generationType === 'image' ? { image: activeProject.image || 'data:image/...' } : {}),
      };
      if (generationType === 'image' && typeof previewJson.image === 'string' && previewJson.image.length > 100) {
        previewJson.image = 'data:image/...[已截断]';
      }

      const cmd = `curl -X POST "${resolvedUrl}" \\\n${authLine}  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(previewJson, null, 2)}'`;
      setCurlPreview(cmd);
      return;
    }
    const content = generationType === 'text'
        ? previewPrompt
        : [{ type: "text", text: previewPrompt }, { type: "image_url", image_url: { url: activeProject.image || "data:image/..." } }];
    const payload = {
        model: selectedModelName,
        messages: [{ role: "user", content: content }],
        stream: true
    };
    const previewJson = JSON.parse(JSON.stringify(payload));
    if (generationType === 'image' && Array.isArray(previewJson.messages[0].content)) {
        if (previewJson.messages[0].content[1].image_url.url.length > 100) {
            previewJson.messages[0].content[1].image_url.url = "data:image/...[已截断]";
        }
    }
    const resolvedUrl = typeof window !== 'undefined' && String(config.baseUrl || '').startsWith('/')
        ? `${window.location.origin}${String(config.baseUrl)}`
        : String(config.baseUrl || '');
    const authLine = config.apiKey ? `  -H "Authorization: Bearer ${config.apiKey}" \\\n` : '';
    const cmd = `curl -X POST "${resolvedUrl}" \\\n${authLine}  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(previewJson, null, 2)}'`;
    setCurlPreview(cmd);
  }, [config, activeProject, selectedModelName, generationType, workMode, videoProvider, orientation, duration]);

  // --- 处理器 ---

  const handleCreateProject = () => {
      const newId = Date.now();
      const newProject = { id: newId, name: `新项目 ${projects.length + 1}`, prompt: '', image: null, imageName: null };
      setProjects([...projects, newProject]);
      setActiveProjectId(newId);
  };

  const performDeleteProject = (id) => {
      if (!Number.isFinite(id)) return;

      setProjects((prevProjects) => {
          if (!Array.isArray(prevProjects) || prevProjects.length <= 1) return prevProjects;
          const nextProjects = prevProjects.filter((p) => p.id !== id);
          if (nextProjects.length === 0) return prevProjects;

          setActiveProjectId((prevActiveId) => (prevActiveId === id ? nextProjects[0].id : prevActiveId));
          return nextProjects;
      });

      idbDeleteProjectImage(id);
  };

  const handleDeleteProject = (e, id) => {
      e.stopPropagation();
      if (projects.length <= 1) return;
      const target = projects.find((p) => p.id === id);
      setPendingDeleteProject({
          id,
          name: target?.name || `项目 ${id}`,
      });
  };

  const startRenaming = (e, project) => {
      e.stopPropagation();
      setEditingProjectId(project.id);
      setEditName(project.name);
  };

  const saveRename = () => {
      if (!editName.trim()) return;
      setProjects(prev => prev.map(p => p.id === editingProjectId ? { ...p, name: editName } : p));
      setEditingProjectId(null);
  };

  const updateActiveProject = (field, value) => {
      setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, [field]: value } : p));
      setActiveProject(prev => (prev && prev.id === activeProjectId) ? { ...prev, [field]: value } : prev);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : null;
      if (!dataUrl) return;

      updateActiveProject('image', dataUrl);
      updateActiveProject('imageName', file.name);
      idbSetProjectImage(activeProjectId, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleScriptChange = (index, value) => {
      const newScripts = [...batchScripts];
      newScripts[index] = value;
      if (index === newScripts.length - 1 && value !== '') {
          newScripts.push('');
      }
      setBatchScripts(newScripts);
  };

  const handleOpenBatchModal = () => {
      if (generationType === 'image' && !activeProject.image) {
          const typeLabel = workMode === 'video' ? '图生视频' : '图生图';
          addLog(`错误: ${typeLabel} 模式下必须上传项目图片。`, 'error');
          return;
      }
      setShowBatchModal(true);
  };

  const handleBatchAddToQueue = () => {
      if (!ensureGatewayAuthed()) return;
      if (batchMode === 'script') {
          const validScripts = batchScripts.filter(s => s.trim() !== '');
          if (validScripts.length === 0) return;
          validScripts.forEach((script) => {
              let finalPrompt = String(activeProject.prompt || '');
              if (finalPrompt.includes('这是台词文案')) {
                  finalPrompt = finalPrompt.replace('这是台词文案', script);
              } else {
                  finalPrompt = `${finalPrompt} ${script}`;
              }
              addToQueue(finalPrompt, script);
          });
      } else {
          const count = parseInt(repeatCount) || 1;
          for(let i=0; i<count; i++) {
              addToQueue(String(activeProject.prompt || ''), `重复任务 #${i + 1}`);
          }
      }
      setShowBatchModal(false);
      if (batchMode === 'script') setBatchScripts(['']);
  };
  
  const addToQueue = (prompt, scriptSnippet, overrides = {}) => {
      const taskMediaType = overrides.mediaType === 'image' ? 'image' : (overrides.mediaType === 'video' ? 'video' : workMode);
      const taskGenerationType = overrides.generationType === 'text' ? 'text' : (overrides.generationType === 'image' ? 'image' : generationType);
      const taskImage = Object.prototype.hasOwnProperty.call(overrides, 'image') ? overrides.image : activeProject?.image;
      const taskProvider = taskMediaType === 'video'
          ? ((overrides.provider === 'comfyui' || overrides.provider === 'sora') ? overrides.provider : videoProvider)
          : null;
      const taskModelUsed = typeof overrides.modelUsed === 'string' && overrides.modelUsed
          ? overrides.modelUsed
          : (taskMediaType === 'image' ? selectedImageModelName : selectedVideoModelName);

      const trimmedPrompt = String(prompt || '').trim();
      if (!trimmedPrompt) {
          addLog('错误: 提示词不能为空。', 'error');
          return;
      }
      if (taskGenerationType === 'image' && !taskImage) {
          const typeLabel = taskMediaType === 'image' ? '图生图' : '图生视频';
          addLog(`错误: ${typeLabel} 模式下必须附带输入图片。`, 'error');
          return;
      }

      const newTaskId = Date.now() + Math.random(); 
      const newTask = {
          id: newTaskId,
          projectId: activeProjectId,
          projectName: activeProject?.name,
          prompt: trimmedPrompt,
          mediaType: taskMediaType,
          provider: taskProvider,
          scriptSnippet: String(scriptSnippet || ''), 
          status: 'PENDING',
          stage: '等待中',
          progress: 0,
          videoUrl: null,
          imageUrl: null,
          imageStored: false,
          errorMessage: null,
          streamLog: '', 
          warning: null, 
          timestamp: new Date().toLocaleString(),
          modelUsed: taskModelUsed,
          image: taskGenerationType === 'image' ? taskImage : null,
          generationType: taskGenerationType, 
       };
      setQueue(prev => [newTask, ...prev]);
  };

  const handleComposerAttachment = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : null;
      if (!dataUrl) return;
      setComposerImage(dataUrl);
      setComposerImageName(file.name || '');
      shouldAutoScrollRef.current = true;
    };
    reader.readAsDataURL(file);
  };

  const clearComposerAttachment = () => {
    setComposerImage(null);
    setComposerImageName('');
    if (composerFileInputRef.current) {
      composerFileInputRef.current.value = '';
    }
  };

  const sendComposerMessage = () => {
    if (!ensureGatewayAuthed()) return;
    const prompt = String(composerText || '').trim();
    const hasImage = Boolean(composerImage);
    addToQueue(prompt, '', {
      mediaType: workMode,
      generationType: hasImage ? 'image' : 'text',
      image: hasImage ? composerImage : null,
      modelUsed: workMode === 'image' ? selectedImageModelName : selectedVideoModelName,
    });

    setComposerText('');
    clearComposerAttachment();
    shouldAutoScrollRef.current = true;
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
  };

  const handleAddSingleTask = () => {
    if (!ensureGatewayAuthed()) return;
    const prompt = String(activeProject?.prompt || '').trim();
    addToQueue(prompt, '', {
      mediaType: workMode,
      generationType: generationType,
      image: activeProject?.image,
      modelUsed: workMode === 'image' ? selectedImageModelName : selectedVideoModelName,
    });
  };

  const addLog = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { time, msg, type }]);
  };

  const updateTask = (id, updates) => {
      setQueue(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const toSafeFilename = (input) => {
      const name = String(input || '')
          .replace(/[\\/:*?"<>|]/g, '_')
          .replace(/\s+/g, ' ')
          .trim();
      return name || 'sora_video';
  };

  const triggerDownload = (url, taskId, suggestedBaseName, fallbackExtension) => {
    if (!url) return;

    const safeTaskId = String(taskId ?? '').replace(/[^0-9a-zA-Z_-]/g, '_');
    const guessExtension = (value) => {
      const str = String(value || '');
      if (str.startsWith('data:')) {
        const mimeMatch = str.match(/^data:([^;,]+)[;,]/);
        const mime = mimeMatch ? mimeMatch[1] : '';
        const map = {
          'image/png': '.png',
          'image/jpeg': '.jpg',
          'image/webp': '.webp',
          'image/gif': '.gif',
          'video/mp4': '.mp4',
        };
        if (map[mime]) return map[mime];
      }

      try {
        const u = new URL(str);
        const pathname = u.pathname || '';
        const extMatch = pathname.match(/\.([a-zA-Z0-9]{1,6})$/);
        if (extMatch) return `.${extMatch[1].toLowerCase()}`;
      } catch (e) { }

      return '';
    };

    let extension = guessExtension(url);
    if (!extension && typeof fallbackExtension === 'string' && fallbackExtension.trim()) {
      extension = fallbackExtension.trim();
    }
    if (extension && !extension.startsWith('.')) extension = `.${extension}`;
    if (!extension) extension = '.bin';
    const baseName = suggestedBaseName ? toSafeFilename(suggestedBaseName) : `sora_task_${safeTaskId || 'unknown'}`;
    const filename = baseName.toLowerCase().endsWith(extension.toLowerCase()) ? baseName : `${baseName}${extension}`;
    const downloader = window.electronAPI && (typeof window.electronAPI.downloadFile === 'function'
        ? window.electronAPI.downloadFile
        : (typeof window.electronAPI.downloadVideo === 'function' ? window.electronAPI.downloadVideo : null));
    if (typeof downloader === 'function') {
        downloader(url, filename);
        addLog(`[任务 ${taskId}] 已触发原生下载。`, 'success');
        return;
    }

    try {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.rel = 'noreferrer';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        a.remove();
        addLog(`[任务 ${taskId}] 已触发下载 (Web)。`, 'success');
    } catch (e) {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const processTask = async (taskId, taskPrompt, taskImage, taskType, taskModel, taskMediaType, taskProvider) => {
      updateTask(taskId, { status: 'GENERATING', stage: '初始化中', progress: 0 });
      if (taskMediaType === 'image') {
          await (async () => {
              let hasReceivedData = false;
              let hasResolvedImage = false;

              const extractImageFromText = (value) => {
                  const str = String(value || '');
                  if (!str) return null;

                  const dataUrlMatch = str.match(/data:image\/[a-zA-Z0-9+.-]+;base64,[a-zA-Z0-9+/=]+/);
                  if (dataUrlMatch) return dataUrlMatch[0];

                  const srcMatch = str.match(/src=['"]([^'"]+?)['"]/i);
                  if (srcMatch && srcMatch[1]) return srcMatch[1];

                  const markdownImageMatch = str.match(/!\[[^\]]*]\(([^)\s]+)\)/);
                  if (markdownImageMatch && markdownImageMatch[1]) return markdownImageMatch[1];

                  const urlMatch = str.match(/(https?:\/\/[^\s"')\]]+)/);
                  if (urlMatch) return urlMatch[1] || urlMatch[0];

                  return null;
              };

              const finishWithDataUrl = async (dataUrl) => {
                  await idbSetTaskOutput(taskId, dataUrl);
                  updateTask(taskId, { status: 'COMPLETED', stage: 'Done', progress: 100, imageUrl: dataUrl, imageStored: true, streamLog: '[image:data]' });
              };

              const finishWithUrl = async (url) => {
                  await idbDeleteTaskOutput(taskId);
                  updateTask(taskId, { status: 'COMPLETED', stage: 'Done', progress: 100, imageUrl: url, imageStored: false, streamLog: url });
              };

              const completeFromCandidate = async (candidate) => {
                  const str = String(candidate || '').trim();
                  if (!str) return false;
                  if (str.startsWith('data:image/')) {
                      await finishWithDataUrl(str);
                      return true;
                  }
                  if (str.startsWith('http://') || str.startsWith('https://')) {
                      await finishWithUrl(str);
                      return true;
                  }
                  return false;
              };

              try {
                  if (!config?.baseUrl) throw new Error('Missing /v1/chat/completions endpoint');
                  if (taskType !== 'text' && !taskImage) throw new Error('Missing input image');

                  updateTask(taskId, { stage: 'Requesting', progress: 10 });

                  const content = taskType === 'text'
                      ? String(taskPrompt || '')
                      : [{ type: "text", text: String(taskPrompt || '') }, { type: "image_url", image_url: { url: taskImage } }];
                  const payload = { model: String(taskModel || 'gpt-image'), messages: [{ role: "user", content: content }], stream: true };
                  const response = await fetch(config.baseUrl, {
                      method: 'POST',
                      headers: buildRequestHeaders(),
                      body: JSON.stringify(payload)
                  });

                  if (!response.ok) {
                      let errorMsg = `HTTP ${response.status}`;
                      try { const errorText = await response.text(); if (errorText) errorMsg = errorText; } catch (e) { }
                      if ((response.status === 401 || response.status === 403) && response.headers.get('x-sora2-manager-auth')) {
                        await refreshGatewayAuthStatus({ openModalOnNeed: true });
                      }
                      throw new Error(errorMsg);
                  }

                  const contentType = String(response.headers.get('content-type') || '');
                  if (contentType.includes('text/event-stream') && response.body) {
                      const reader = response.body.getReader();
                      const decoder = new TextDecoder();
                      let buffer = '';
                      let accumulatedContent = '';

                      while (true) {
                          const { done, value } = await reader.read();
                          if (done) break;

                          buffer += decoder.decode(value, { stream: true });
                          const lines = buffer.split('\n');
                          buffer = lines.pop();

                          for (const line of lines) {
                              const trimmed = line.trim();
                              if (!trimmed) continue;
                              if (trimmed === 'data: [DONE]' || trimmed === 'data:[DONE]') continue;
                              if (!trimmed.startsWith('data:')) continue;

                              const jsonStr = trimmed.replace(/^data:\s?/, '');
                              let combinedChunk = '';
                               try {
                                   const data = JSON.parse(jsonStr);
                                   if (data.error) throw new Error(data.error.message || 'API Error');
                                   const delta = data.choices?.[0]?.delta;
                                   combinedChunk = String((delta?.content || '') + (delta?.reasoning_content || ''));
                               } catch (e) {
                                   if (!(e instanceof SyntaxError)) throw e;
                                   combinedChunk = jsonStr;
                               }

                              if (!combinedChunk) continue;
                              if (hasResolvedImage) continue;

                               hasReceivedData = true;
                               accumulatedContent += combinedChunk;
                               if (accumulatedContent.length > 50_000) accumulatedContent = accumulatedContent.slice(-50_000);

                               const maybeFailure = detectUpstreamStreamFailure(accumulatedContent);
                               if (maybeFailure) throw new Error(maybeFailure);

                               updateTask(taskId, { stage: 'Generating', progress: 50, streamLog: accumulatedContent.length > 1000 ? '...' + accumulatedContent.slice(-1000) : accumulatedContent });

                              const candidate = extractImageFromText(combinedChunk) || extractImageFromText(accumulatedContent);
                              if (candidate && await completeFromCandidate(candidate)) {
                                  hasResolvedImage = true;
                                  try { await reader.cancel(); } catch (e) { }
                                  return;
                              }
                          }
                      }

                      const finalCandidate = extractImageFromText(buffer) || extractImageFromText(accumulatedContent);
                      if (finalCandidate && await completeFromCandidate(finalCandidate)) return;

                      throw new Error('No image in response');
                  }

                  const result = await response.json();
                  if (result?.error) throw new Error(result.error.message || 'API Error');

                  const first = Array.isArray(result?.data) ? result.data[0] : null;
                  const url = first && typeof first.url === 'string' ? first.url : null;
                  const b64 = first && typeof first.b64_json === 'string' ? first.b64_json : null;

                  if (b64) {
                      const dataUrl = `data:image/png;base64,${b64}`;
                      await finishWithDataUrl(dataUrl);
                      return;
                  }

                  if (url) {
                      await finishWithUrl(url);
                      return;
                  }

                  const messageContent = result?.choices?.[0]?.message?.content;
                  let messageText = '';
                  if (Array.isArray(messageContent)) {
                      messageText = messageContent.map((part) => {
                          if (!part) return '';
                          if (typeof part === 'string') return part;
                          if (typeof part.text === 'string') return part.text;
                          const url = part.image_url?.url;
                          return typeof url === 'string' ? url : '';
                      }).join('\\n');
                  } else if (typeof messageContent === 'string') {
                      messageText = messageContent;
                  } else if (messageContent != null) {
                      messageText = String(messageContent);
                  }

                  const candidate = extractImageFromText(messageText) || extractImageFromText(JSON.stringify(result));
                  if (candidate && await completeFromCandidate(candidate)) return;

                  throw new Error('No image in response');
              } catch (err) {
                  addLog(`[Task ${taskId}] Image error: ${err.message}`, 'error');
                  updateTask(taskId, { status: 'FAILED', stage: hasReceivedData ? 'ERROR' : 'NETWORK', progress: 0, errorMessage: err.message });
              }
           })();
           return;
       }

       if (taskMediaType === 'video' && taskProvider === 'comfyui') {
           try {
               const base = String(config.comfyuiBaseUrl || '').trim();
               if (!base) throw new Error('Missing ComfyUI2API base URL');

               const { createVideo, job } = comfyuiEndpoints(base);

               const prompt = String(taskPrompt || '').trim();
               if (!prompt) throw new Error('Prompt is empty');

               updateTask(taskId, { stage: 'Creating', progress: 1, streamLog: '' });

               const seconds = parseInt(String(duration || ''), 10);
               const payload = {
                   prompt,
                   ...(taskModel ? { model: String(taskModel || '').trim() } : {}),
                   ...(Number.isFinite(seconds) ? { duration: seconds } : {}),
                   size: orientation === 'portrait' ? '720x1280' : '1280x720',
               };
               if (taskType !== 'text') payload.image = taskImage;

               const createRes = await fetch(createVideo, {
                   method: 'POST',
                   headers: buildRequestHeaders(),
                   body: JSON.stringify(payload)
               });
               if (!createRes.ok) {
                   let errorMsg = `HTTP ${createRes.status}`;
                   try {
                       const errorText = await createRes.text();
                       errorMsg = parseOpenAiLikeErrorMessage(errorText) || errorText || errorMsg;
                   } catch (e) { }
                   if ((createRes.status === 401 || createRes.status === 403) && createRes.headers.get('x-sora2-manager-auth')) {
                     await refreshGatewayAuthStatus({ openModalOnNeed: true });
                   }
                   throw new Error(errorMsg);
               }

               const created = await createRes.json();
               const jobId = created?.task_id || created?.job_id || created?.id;
               if (!jobId) throw new Error('Missing task_id from ComfyUI2API');

               updateTask(taskId, { stage: 'Queued', progress: 2, streamLog: `job_id=${String(jobId)}` });

               const startedAt = Date.now();
               const pollIntervalMs = 1200;
               while (true) {
                   await new Promise((r) => setTimeout(r, pollIntervalMs));
                   const pollRes = await fetch(job(jobId), { headers: buildRequestHeaders() });
                   if (!pollRes.ok) {
                       let errorMsg = `HTTP ${pollRes.status}`;
                       try {
                           const errorText = await pollRes.text();
                           errorMsg = parseOpenAiLikeErrorMessage(errorText) || errorText || errorMsg;
                       } catch (e) { }
                       throw new Error(errorMsg);
                   }

                   const jobWrap = await pollRes.json();
                   const jobObj = jobWrap?.job || jobWrap;
                   const status = String(jobObj?.status || '').toLowerCase();
                   const completed = status === 'completed';
                   const failed = status === 'failed';

                   const pct = comfyuiProgressPercent(jobObj?.progress, { completed });
                   const nodeLabel = jobObj?.current_node ? String(jobObj.current_node) : '';
                   const stage = completed ? 'Done' : (nodeLabel ? `Node ${nodeLabel}` : (status || 'running'));
                   const stream = JSON.stringify(
                       { status: status || null, node: nodeLabel || null, progress: jobObj?.progress || null, url: jobObj?.url || null },
                       null,
                       2
                   );

                   updateTask(taskId, { stage, progress: pct, streamLog: stream.length > 2000 ? '...' + stream.slice(-2000) : stream });

                   if (completed) {
                       const url = pickComfyuiVideoUrl(jobObj);
                       if (!url) throw new Error('No video output URL');
                        updateTask(taskId, { status: 'COMPLETED', stage: '已完成', progress: 100, videoUrl: url });
                       if (window.electronAPI && (typeof window.electronAPI.downloadFile === 'function' || typeof window.electronAPI.downloadVideo === 'function')) {
                           triggerDownload(url, taskId, undefined, '.mp4');
                       }
                       return;
                   }

                   if (failed) {
                       const errMsg = parseOpenAiLikeErrorMessage(jobObj?.error) || (jobObj?.error ? String(jobObj.error) : '') || 'ComfyUI job failed';
                       throw new Error(errMsg);
                   }

                   if (Date.now() - startedAt > 4 * 60 * 60 * 1000) {
                       throw new Error('ComfyUI job timeout (4h)');
                   }
               }
           } catch (err) {
               addLog(`[任务 ${taskId}] ComfyUI 异常: ${err.message}`, 'error');
               updateTask(taskId, { status: 'FAILED', stage: 'ERROR', progress: 0, errorMessage: err.message });
           }
           return;
       }

       let hasReceivedData = false;
       let hasResolvedVideo = false;

      try {
          const content = taskType === 'text'
              ? String(taskPrompt)
              : [{ type: "text", text: String(taskPrompt) }, { type: "image_url", image_url: { url: taskImage } }];
          const payload = { model: taskModel, messages: [{ role: "user", content: content }], stream: true };
          const response = await fetch(config.baseUrl, {
              method: 'POST',
              headers: buildRequestHeaders(),
              body: JSON.stringify(payload)
          });
          if (!response.ok) {
              let errorMsg = `HTTP ${response.status}`;
              try { const errorText = await response.text(); if (errorText) errorMsg = errorText; } catch (e) { }
              if ((response.status === 401 || response.status === 403) && response.headers.get('x-sora2-manager-auth')) {
                await refreshGatewayAuthStatus({ openModalOnNeed: true });
              }
              throw new Error(errorMsg);
          }
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = ""; 
          let accumulatedContent = "";

          while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop(); 

              for (const line of lines) {
                  const trimmed = line.trim();
                  if (!trimmed || trimmed === 'data: [DONE]') continue;
                  if (trimmed.startsWith('data: ')) {
                      try {
                          const jsonStr = trimmed.replace('data: ', '');
                          const data = JSON.parse(jsonStr);
                          if (data.error) throw new Error(data.error.message || "API Error");
                          const delta = data.choices?.[0]?.delta;
                          const combinedChunk = (delta?.content || "") + (delta?.reasoning_content || "");
                          
                               if (combinedChunk) {
                                   if (hasResolvedVideo) continue;
                                   accumulatedContent += combinedChunk;
                                   const maybeFailure = detectUpstreamStreamFailure(accumulatedContent);
                                   if (maybeFailure) throw new Error(maybeFailure);
                                   const updates = { streamLog: accumulatedContent.length > 1000 ? '...' + accumulatedContent.slice(-1000) : accumulatedContent };

                                   if (!hasReceivedData) {
                                  hasReceivedData = true;
                                  addLog(`[任务 ${taskId}] 开始接收数据流...`, 'info');
                                  updates.stage = '准备中';
                              }
                              
                              // --- 细分状态检测逻辑 ---
                              // 1. 违规检测
                              if (accumulatedContent.includes("Content Policy Violation") || accumulatedContent.includes("content_violation")) {
                                  throw new Error("检测到内容违规 (Policy Violation)");
                              }
                              // 2. 超时检测
                              if (accumulatedContent.includes("Generation timeout") || accumulatedContent.includes("timed out")) {
                                  throw new Error("生成超时 (Generation Timeout)");
                              }
                              // 3. 降级检测 (警告)
                              if (accumulatedContent.includes("Falling back to normal video")) {
                                  updates.warning = "去水印失败";
                              }
                              // 4. 去水印模式 (逻辑修正：移除 selection-tag)
                              if (accumulatedContent.includes("Watermark-free mode") || accumulatedContent.includes("Publishing video")) {
                                  updates.stage = '去水印中';
                                  updates.status = 'PROCESSING';
                              }
                              // 5. 缓存/同步中
                              if (accumulatedContent.includes("caching") || accumulatedContent.includes("Preparing final response")) {
                                  updates.stage = '同步中';
                                  updates.status = 'CACHING';
                              }
                              // 6. 图片心跳检测
                              if (accumulatedContent.includes("Image generation in progress")) {
                                  updates.stage = '图片生成中';
                              }
                              
                              // 7. 进度解析 (仅在普通渲染阶段更新)
                              const progressMatch = accumulatedContent.match(/Video Generation Progress\D*(\d+)%/gi);
                              if (progressMatch && !accumulatedContent.includes("Watermark-free mode")) {
                                  const lastMatch = progressMatch[progressMatch.length - 1];
                                  const pVal = parseInt(lastMatch.match(/\d+/)[0], 10);
                                  if (!isNaN(pVal)) {
                                      updates.progress = pVal;
                                      updates.stage = '生成中';
                                      updates.status = 'GENERATING';
                                  }
                              }

                              updateTask(taskId, updates);

                              const srcMatch = combinedChunk.match(/src=['"]([^'"]+?)['"]/);
                              const urlMatch = combinedChunk.match(/(https?:\/\/[^\s)"]+)/);
                              let foundUrl = srcMatch ? srcMatch[1] : (urlMatch && !combinedChunk.includes("<") ? urlMatch[0] : null);

                              if (foundUrl && !hasResolvedVideo) {
                                  hasResolvedVideo = true;
                                  updateTask(taskId, { status: 'COMPLETED', stage: '已完成', progress: 100, videoUrl: foundUrl });
                                    if (window.electronAPI && (typeof window.electronAPI.downloadFile === 'function' || typeof window.electronAPI.downloadVideo === 'function')) {
                                        triggerDownload(foundUrl, taskId, undefined, '.mp4');
                                    }
                                   try { await reader.cancel(); } catch (e) { }
                                   return;
                               }
                           }
                       } catch (e) {
                           if (!(e instanceof SyntaxError)) throw e;
                          if (e.message.includes("内容违规") || e.message.includes("超时")) throw e;
                      }
                  }
              }
          }
      } catch (err) {
          addLog(`[任务 ${taskId}] 异常: ${err.message}`, 'error');
          let finalStage = '错误';
          if (err.message.includes("违规")) finalStage = '内容违规';
          if (err.message.includes("超时")) finalStage = '超时';
          updateTask(taskId, { status: 'FAILED', stage: finalStage, progress: 0, errorMessage: err.message });
      }
  };

  const visibleQueue = (recordsScope === 'all'
      ? queue
      : queue.filter(t => t.projectId === activeProjectId)
  ).filter(t => (t.mediaType || 'video') === workMode);

  const orderedVisibleQueue = workMode === 'image' ? [...visibleQueue].reverse() : visibleQueue;
  const getTaskKindLabel = (task) => {
      const mediaType = (task?.mediaType || 'video') === 'image' ? 'image' : 'video';
      const generationType = task?.generationType === 'text' ? 'text' : 'image';

      if (mediaType === 'image') return generationType === 'text' ? '文生图' : '图生图';
      return generationType === 'text' ? '文生视频' : '图生视频';
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden relative">
      <datalist id="comfyui-models-datalist">
        {(Array.isArray(comfyuiWorkflowSuggestions) ? comfyuiWorkflowSuggestions : []).map((m) => (
          <option key={String(m?.id || '')} value={String(m?.id || '')} label={m?.kind ? String(m.kind) : undefined} />
        ))}
      </datalist>
      {workMode === 'image' && (
        <>
          <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 z-10 shrink-0 shadow-sm">
              <div className="flex items-center gap-6">
                  <h1 className="text-gray-900 font-bold text-lg tracking-wide flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div> Sora 视频生成
                  </h1>
                  <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                      <button onClick={() => setWorkMode('video')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${workMode === 'video' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Video</button>
                      <button onClick={() => setWorkMode('image')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${workMode === 'image' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Image</button>
                  </div>
              </div>
              <div className="flex items-center gap-3">
                  <button onClick={() => setShowDebug(!showDebug)} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-md transition-colors ${showDebug ? 'bg-gray-100 text-green-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}><IconTerminal size={14} /> 日志</button>
                  <button onClick={() => setShowSettings(true)} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="设置"><IconSettings size={20} /></button>
              </div>
          </header>

          <div className="flex flex-1 overflow-hidden">
            <aside className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col shrink-0">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-gray-700 font-bold tracking-wide flex items-center gap-2 text-sm uppercase">项目列表</h2>
                    <button onClick={handleCreateProject} className="text-gray-500 hover:text-blue-600 transition-colors bg-white border border-gray-200 p-1 rounded shadow-sm hover:shadow"><IconPlus size={16} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {projects.map(proj => (
                        <div key={proj.id} onClick={() => setActiveProjectId(proj.id)} className={`group flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors border ${activeProjectId === proj.id ? 'bg-white border-gray-200 shadow-sm text-blue-600' : 'border-transparent text-gray-600 hover:bg-gray-100'}`}>
                            <IconFolder size={16} className={activeProjectId === proj.id ? 'text-blue-400' : 'text-gray-600'} />
                            {editingProjectId === proj.id ? (
                                <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)} onBlur={saveRename} onKeyDown={(e) => e.key === 'Enter' && !(e.isComposing || e.nativeEvent.isComposing) && saveRename()} className="bg-white border border-blue-500 rounded px-1 py-0.5 text-xs text-gray-900 w-full outline-none" />
                            ) : (
                                <span className="text-sm font-medium truncate flex-1">{String(proj.name || '')}</span>
                            )}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => startRenaming(e, proj)} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-white rounded"><IconEdit size={12} /></button>
                                <button onClick={(e) => handleDeleteProject(e, proj.id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-white rounded"><IconTrash size={12} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-white">
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto"
            onScroll={(e) => {
              const el = e.currentTarget;
              const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
              shouldAutoScrollRef.current = distanceToBottom < 120;
            }}
          >
            <div className="mx-auto w-full max-w-3xl px-4 py-6 space-y-6">
              {orderedVisibleQueue.length === 0 ? (
                <div className="py-24 text-center text-sm text-gray-400">
                  暂无对话记录，发送一条消息开始生成。
                </div>
              ) : (
                orderedVisibleQueue.map((task) => {
                  const kindLabel = getTaskKindLabel(task);
                  const headerLeft = (recordsScope === 'all'
                    ? [task.projectName, task.timestamp].filter(Boolean).join(' · ')
                    : task.timestamp
                  );
                  const taskMediaType = task?.mediaType === 'image' ? 'image' : 'video';
                  const isGenerating = task.status === 'GENERATING' || task.status === 'STARTING' || task.status === 'PROCESSING' || task.status === 'CACHING';
                  const userBubbleColor = taskMediaType === 'image' ? 'bg-emerald-600' : 'bg-blue-600';
                  const loaderColor = taskMediaType === 'image' ? 'text-emerald-600' : 'text-blue-600';

                  return (
                    <div key={task.id} className="space-y-2">
                      <div className="flex justify-end">
                        <div className={`max-w-[92%] rounded-2xl px-4 py-3 text-white shadow-sm ${userBubbleColor}`}>
                          <div className="flex items-center justify-between gap-3 mb-1 text-[10px] text-white/80">
                            <span className="truncate">{String(headerLeft || '')}</span>
                            <span className="shrink-0 rounded-full bg-white/15 px-2 py-0.5 font-bold">{String(kindLabel)}</span>
                          </div>
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">{String(task.prompt || '')}</div>
                          {task.generationType !== 'text' && task.image && (
                            <div className="mt-3">
                              <img
                                src={String(task.image)}
                                alt="input"
                                className="max-h-48 w-full rounded-lg border border-white/20 object-contain bg-black/20"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-start">
                        <div className="max-w-[92%] rounded-2xl px-4 py-3 bg-white border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="text-[10px] text-gray-500 font-mono truncate">{String(task.modelUsed || '')}</div>
                            <StatusBadge status={task.status} stage={task.stage} progress={task.progress} warning={task.warning} />
                          </div>

                          {task.status === 'COMPLETED' && taskMediaType === 'image' && task.imageUrl ? (
                            <div className="space-y-2">
                              <img
                                src={String(task.imageUrl)}
                                alt="result"
                                className="max-h-[560px] w-full rounded-lg border border-gray-200 object-contain bg-black cursor-pointer"
                                onClick={() => setActiveImageTaskId(task.id)}
                              />
                              <div className="flex flex-wrap gap-2">
                                <button onClick={() => setActiveImageTaskId(task.id)} className="px-3 py-1.5 text-xs font-bold bg-gray-900 text-white rounded-lg hover:bg-gray-800">Preview</button>
                                <button onClick={() => triggerDownload(task.imageUrl, task.id, `${task.projectName || 'image_task'}_${task.id}`, '.png')} className="px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">下载</button>
                                <button onClick={() => handleCopy(String(task.imageUrl))} className="px-3 py-1.5 text-xs font-bold bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">复制</button>
                              </div>
                            </div>
                          ) : task.status === 'FAILED' ? (
                            <div className="text-sm text-red-600 whitespace-pre-wrap cursor-pointer" onClick={() => handleCopy(String(task.errorMessage || ''))}>
                              {String(task.errorMessage || 'FAILED')}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              {isGenerating && <IconLoader className={loaderColor} />}
                              <span>{String(task.stage || task.status || '')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          <div className="border-t border-gray-200 bg-white shrink-0">
            <div className="mx-auto w-full max-w-3xl px-4 py-3">
              {composerImage && (
                <div className="mb-2 flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-2">
                  <img src={String(composerImage)} alt="attach" className="h-14 w-14 rounded-lg border border-gray-200 object-cover bg-white" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-gray-700 truncate">{String(composerImageName || '已添加图片')}</div>
                    <div className="text-[10px] text-gray-500 truncate">发送后将按「图生{workMode === 'image' ? '图' : '视频'}」处理</div>
                  </div>
                  <button onClick={clearComposerAttachment} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-full" title="移除图片">
                    <IconX size={16} />
                  </button>
                </div>
              )}

              <div className="flex items-end gap-2 rounded-2xl border border-gray-300 bg-white px-3 py-2 shadow-sm">
                <input ref={composerFileInputRef} type="file" accept="image/*" onChange={handleComposerAttachment} className="hidden" />
                <button
                  type="button"
                  onClick={() => composerFileInputRef.current?.click()}
                  className="shrink-0 w-10 h-10 rounded-full hover:bg-gray-100 text-gray-500 flex items-center justify-center transition-colors"
                  title="添加图片"
                >
                  <IconImage size={18} />
                </button>

                <textarea
                  value={String(composerText || '')}
                  onChange={(e) => setComposerText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return;
                    if (e.shiftKey) return;
                    if (e.isComposing || e.nativeEvent?.isComposing) return;
                    if (!String(composerText || '').trim()) return;
                    e.preventDefault();
                    sendComposerMessage();
                  }}
                  rows={1}
                  placeholder="描述新图片…"
                  className="flex-1 resize-none bg-transparent text-sm leading-relaxed text-gray-900 placeholder-gray-400 focus:outline-none max-h-32 py-2"
                />

                <button
                  type="button"
                  className="shrink-0 w-10 h-10 rounded-full hover:bg-gray-100 text-gray-500 flex items-center justify-center transition-colors"
                  title="语音（暂未实现）"
                >
                  <IconMic size={18} />
                </button>

                <button
                  type="button"
                  onClick={sendComposerMessage}
                  disabled={!String(composerText || '').trim() || !isGatewayAuthed}
                  className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    (!String(composerText || '').trim() || !isGatewayAuthed)
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                  title={!isGatewayAuthed ? '请先输入访问密码' : '发送'}
                >
                  <IconArrowUp size={18} />
                </button>
              </div>

              <div className="pt-2 text-[10px] text-gray-400 text-center">
                Enter 发送 · Shift+Enter 换行
              </div>
            </div>
          </div>
            </main>
          </div>
        </>
      )}

      {workMode === 'video' && (
        <>
      <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-6">
              <h1 className="text-gray-900 font-bold text-lg tracking-wide flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div> {videoProvider === 'comfyui' ? 'ComfyUI 视频生成' : 'Sora 视频生成'}
              </h1>
              <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                  <button onClick={() => setWorkMode('video')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${workMode === 'video' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Video</button>
                  <button onClick={() => setWorkMode('image')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${workMode === 'image' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Image</button>
              </div>
          </div>
          <div className="flex items-center gap-3">
              <button onClick={() => setShowDebug(!showDebug)} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-md transition-colors ${showDebug ? 'bg-gray-100 text-green-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}><IconTerminal size={14} /> 日志</button>
              <button onClick={() => setShowSettings(true)} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="设置"><IconSettings size={20} /></button>
          </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col shrink-0">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-gray-700 font-bold tracking-wide flex items-center gap-2 text-sm uppercase">项目列表</h2>
                <button onClick={handleCreateProject} className="text-gray-500 hover:text-blue-600 transition-colors bg-white border border-gray-200 p-1 rounded shadow-sm hover:shadow"><IconPlus size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {projects.map(proj => (
                    <div key={proj.id} onClick={() => setActiveProjectId(proj.id)} className={`group flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors border ${activeProjectId === proj.id ? 'bg-white border-gray-200 shadow-sm text-blue-600' : 'border-transparent text-gray-600 hover:bg-gray-100'}`}>
                        <IconFolder size={16} className={activeProjectId === proj.id ? 'text-blue-400' : 'text-gray-600'} />
                        {editingProjectId === proj.id ? (
                            <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)} onBlur={saveRename} onKeyDown={(e) => e.key === 'Enter' && !(e.isComposing || e.nativeEvent.isComposing) && saveRename()} className="bg-white border border-blue-500 rounded px-1 py-0.5 text-xs text-gray-900 w-full outline-none" />
                        ) : (
                            <span className="text-sm font-medium truncate flex-1">{String(proj.name || '')}</span>
                        )}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => startRenaming(e, proj)} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-white rounded"><IconEdit size={12} /></button>
                            <button onClick={(e) => handleDeleteProject(e, proj.id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-white rounded"><IconTrash size={12} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-white">
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
                <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">{String(activeProject?.name || '')}<span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded">项目配置</span></h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 flex flex-col gap-6">
                            <div className="flex items-center gap-2 mb-2">
                                <button onClick={() => setGenerationType('image')} className={`px-3 py-1.5 text-sm font-medium rounded transition-colors flex items-center gap-2 border ${generationType === 'image' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}><IconImage size={16} /> {workMode === 'video' ? '图生视频' : '图生图'}</button>
                                <button onClick={() => setGenerationType('text')} className={`px-3 py-1.5 text-sm font-medium rounded transition-colors flex items-center gap-2 border ${generationType === 'text' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}><IconType size={16} /> {workMode === 'video' ? '文生视频' : '文生图'}</button>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex justify-between">总提示词 (Master Prompt)<span className="text-xs text-blue-600 normal-case bg-blue-50 px-2 py-0.5 rounded">使用 "这是台词文案" 作为占位符</span></label>
                                <textarea value={String(activeProject?.prompt || '')} onChange={(e) => updateActiveProject('prompt', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none min-h-[140px] font-mono text-sm leading-relaxed" placeholder="例如：一个精美的咖啡杯，这是台词文案，4k分辨率..." />
                            </div>
                            {generationType === 'image' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">项目图片</label>
                                    <div className="relative group">
                                        <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                        <div className={`h-40 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors ${activeProject?.image ? 'border-blue-500/50 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                                            {activeProject?.image ? (
                                                <div className="flex items-center gap-4">
                                                    <img src={String(activeProject.image)} alt="preview" className="h-32 rounded object-cover border border-gray-200 shadow-sm" />
                                                    <div className="text-left">
                                                        <div className="text-sm text-green-600 font-medium flex items-center gap-2"><IconCheck size={14} /> 已上传</div>
                                                        <div className="text-xs text-gray-500 mt-1 max-w-[200px] truncate">{String(activeProject.imageName || '')}</div>
                                                        <div className="text-xs text-blue-500 mt-1 cursor-pointer hover:underline">点击替换</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center text-gray-400"><IconPlus size={24} className="mx-auto mb-2 text-gray-300"/><span className="text-sm font-medium">点击上传项目图片</span></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-end">
                                <button
                                    onClick={handleAddSingleTask}
                                    disabled={!isGatewayAuthed}
                                    className={`px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all ${
                                      !isGatewayAuthed
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : (workMode === 'image' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-blue-600 text-white hover:bg-blue-700')
                                    }`}
                                    title={!isGatewayAuthed ? '请先输入访问密码' : undefined}
                                >
                                    {workMode === 'image' ? '发送' : '加入队列'}
                                </button>
                            </div>
                        </div>
                        <div className="lg:col-span-4 flex flex-col gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                            {workMode === 'video' ? (
                                <>
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Provider</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => setVideoProvider('sora')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${videoProvider === 'sora' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>Sora2API</button>
                                    <button onClick={() => setVideoProvider('comfyui')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${videoProvider === 'comfyui' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>ComfyUI</button>
                                </div>
                            </div>

                            {videoProvider === 'sora' ? (
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Model</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => setModelFamily('sora2')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${modelFamily === 'sora2' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>sora2</button>
                                    <button onClick={() => setModelFamily('sora2pro')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${modelFamily === 'sora2pro' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>sora2pro</button>
                                    <button onClick={() => setModelFamily('sora2pro-hd')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${modelFamily === 'sora2pro-hd' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>sora2pro-高清</button>
                                    <button onClick={() => setModelFamily('prompt-enhance-short')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${modelFamily === 'prompt-enhance-short' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>提示增强-短</button>
                                    <button onClick={() => setModelFamily('prompt-enhance-medium')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${modelFamily === 'prompt-enhance-medium' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>提示增强-中</button>
                                    <button onClick={() => setModelFamily('prompt-enhance-long')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${modelFamily === 'prompt-enhance-long' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>提示增强-长</button>
                                </div>
                            </div>
                            ) : (
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ComfyUI Workflow/Model (optional)</label>
                                    <div className="flex items-center gap-2">
                                      <input list="comfyui-models-datalist" type="text" value={String(comfyuiModel || '')} onChange={(e) => setComfyuiModel(e.target.value)} placeholder="留空使用 comfyui2api 默认工作流；可填：img2video.json" className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 shadow-sm" />
                                      <button onClick={loadComfyuiModels} disabled={comfyuiModelsLoading} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all flex items-center gap-2 ${comfyuiModelsLoading ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}>
                                        {comfyuiModelsLoading ? <IconLoader size={14} /> : <IconLink size={14} />}
                                        {comfyuiModelsLoading ? '加载中' : '加载工作流'}
                                      </button>
                                    </div>
                                    {comfyuiModelsError ? (
                                      <div className="text-xs text-red-600">{String(comfyuiModelsError || '')}</div>
                                    ) : (
                                      <div className="text-[10px] text-gray-400">
                                        可用模型列表：ComfyUI2API 的 <span className="font-mono">GET /v1/models</span>（网关：<span className="font-mono">/comfyui/v1/models</span>）
                                        {Array.isArray(comfyuiWorkflowSuggestions) && comfyuiWorkflowSuggestions.length > 0 && (
                                          <span className="ml-2">已加载 {comfyuiWorkflowSuggestions.length} 个</span>
                                        )}
                                      </div>
                                    )}
                                </div>
                            )}
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">画面方向</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => setOrientation('landscape')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${orientation === 'landscape' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>横屏</button>
                                    <button onClick={() => setOrientation('portrait')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${orientation === 'portrait' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>竖屏</button>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">时长</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => setDuration('10s')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${duration === '10s' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>10秒</button>
                                    <button onClick={() => setDuration('15s')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${duration === '15s' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>15秒</button>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">当前模型</label>
                                <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 font-mono flex items-center gap-2 shadow-sm"><IconLink size={14} className="text-gray-400"/>{String(selectedModelName)}</div>
                            </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-3">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Image Model</label>
                                        <div className="grid grid-cols-1 gap-2">
                                            <button onClick={() => setImageModel('gpt-image')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${imageModel === 'gpt-image' ? 'bg-white border-emerald-500 text-emerald-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>gpt-image</button>
                                            <button onClick={() => setImageModel('gpt-image-landscape')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${imageModel === 'gpt-image-landscape' ? 'bg-white border-emerald-500 text-emerald-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>gpt-image-横屏</button>
                                            <button onClick={() => setImageModel('gpt-image-portrait')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${imageModel === 'gpt-image-portrait' ? 'bg-white border-emerald-500 text-emerald-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>gpt-image-竖屏</button>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Model</label>
                                        <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 font-mono flex items-center gap-2 shadow-sm"><IconLink size={14} className="text-gray-400"/>{String(selectedModelName)}</div>
                                    </div>
                                </>
                            )}
                            <div className="flex-1"></div>
                            <div className="flex bg-gray-100 p-1 rounded-lg mb-2">
                                <button onClick={() => setBatchMode('script')} className={`flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-all ${batchMode === 'script' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><IconScript size={14} /> 台词模式</button>
                                <button onClick={() => setBatchMode('repeat')} className={`flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-all ${batchMode === 'repeat' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><IconRepeat size={14} /> 重复模式</button>
                            </div>
                            <button onClick={handleOpenBatchModal} className="w-full py-3.5 bg-blue-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-sm"><IconCopy size={18} />批量生成</button>
                        </div>
                    </div>
                </section>

                <section className="flex-1 pb-20">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-lg font-bold text-gray-900">{workMode === 'image' ? '对话' : '生产队列'}</h2>
                        <div className="flex items-center gap-3">
                            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                                <button onClick={() => setRecordsScope('project')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${recordsScope === 'project' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>当前项目</button>
                                <button onClick={() => setRecordsScope('all')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${recordsScope === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>全部记录</button>
                            </div>
                            <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-1 rounded-full">{visibleQueue.length} 个任务</span>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm min-h-[200px]">
                        {workMode === 'image' && (
                            <div className="p-4 bg-gray-50">
                                {orderedVisibleQueue.length === 0 ? (
                                    <div className="p-10 text-center text-sm text-gray-400">
                                        暂无对话记录，发送一条消息开始生成图片。
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {orderedVisibleQueue.map((task) => {
                                            const kindLabel = getTaskKindLabel(task);
                                            const headerLeft = (recordsScope === 'all'
                                                ? [task.projectName, task.timestamp].filter(Boolean).join(' · ')
                                                : task.timestamp
                                            );
                                            const isGenerating = task.status === 'GENERATING' || task.status === 'STARTING' || task.status === 'PROCESSING' || task.status === 'CACHING';

                                            return (
                                                <div key={task.id} className="space-y-2">
                                                    <div className="flex justify-end">
                                                        <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-blue-600 text-white shadow-sm">
                                                            <div className="flex items-center justify-between gap-3 mb-1 text-[10px] text-white/80">
                                                                <span className="truncate">{String(headerLeft || '')}</span>
                                                                <span className="shrink-0 bg-white/15 px-2 py-0.5 rounded font-mono">{kindLabel}</span>
                                                            </div>
                                                            <div className="whitespace-pre-wrap text-sm leading-relaxed">{String(task.prompt || '')}</div>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-start">
                                                        <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-white border border-gray-200 shadow-sm">
                                                            <div className="flex items-center justify-between gap-3 mb-2">
                                                                <div className="text-[10px] text-gray-500 font-mono truncate">{String(task.modelUsed || '')}</div>
                                                                <div className="text-[10px] text-gray-500 font-bold uppercase">{String(task.status || '')}</div>
                                                            </div>

                                                            {task.status === 'COMPLETED' && task.imageUrl ? (
                                                                <div className="space-y-2">
                                                                    <img
                                                                        src={String(task.imageUrl)}
                                                                        alt="result"
                                                                        className="max-h-[520px] w-full rounded-lg border border-gray-200 object-contain bg-black cursor-pointer"
                                                                        onClick={() => setActiveImageTaskId(task.id)}
                                                                    />
                                                                    <div className="flex flex-wrap gap-2">
                                                                        <button onClick={() => setActiveImageTaskId(task.id)} className="px-3 py-1.5 text-xs font-bold bg-gray-900 text-white rounded-lg hover:bg-gray-800">Preview</button>
                                                                        <button onClick={() => triggerDownload(task.imageUrl, task.id, `${task.projectName || 'image_task'}_${task.id}`, '.png')} className="px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">下载</button>
                                                                        <button onClick={() => handleCopy(String(task.imageUrl))} className="px-3 py-1.5 text-xs font-bold bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">复制</button>
                                                                    </div>
                                                                </div>
                                                            ) : task.status === 'FAILED' ? (
                                                                <div className="text-sm text-red-600 whitespace-pre-wrap cursor-pointer" onClick={() => handleCopy(String(task.errorMessage || ''))}>
                                                                    {String(task.errorMessage || 'FAILED')}
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    {isGenerating && <IconLoader className="text-emerald-600" />}
                                                                    <span>{String(task.stage || task.status || '')}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                        {workMode !== 'image' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50">
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase w-32 tracking-wider">缩略图</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">详情 (项目与文案)</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase w-48 tracking-wider">状态</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {visibleQueue.map((task) => (
                                        <tr key={task.id} className="group hover:bg-gray-50 transition-colors">
                                            <td className="p-4">
                                                <div
                                                    onClick={() => { if (task.status !== 'COMPLETED') return; if (task.mediaType === 'image' && task.imageUrl) setActiveImageTaskId(task.id); if ((task.mediaType || 'video') === 'video' && task.videoUrl) setActiveVideoTaskId(task.id); }}
                                                    className={`w-24 h-14 bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden relative shadow-sm ${task.status === 'COMPLETED' && ((task.mediaType === 'image' && task.imageUrl) || ((task.mediaType || 'video') === 'video' && task.videoUrl)) ? 'cursor-pointer hover:border-blue-400' : ''}`}
                                                >
                                                    {task.status === 'COMPLETED' && (task.mediaType || 'video') === 'video' && task.videoUrl ? (
                                                        <>
                                                            <video src={String(task.videoUrl)} className="w-full h-full object-cover" muted onMouseOver={e => e.target.play()} onMouseOut={e => e.target.pause()} />
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <span className="text-white text-[10px] font-bold">播放</span>
                                                            </div>
                                                        </>
                                                    ) : (task.status === 'COMPLETED' && task.mediaType === 'image' && task.imageUrl ? (
                                                        <>
                                                            <img src={String(task.imageUrl)} className="w-full h-full object-cover" alt="preview" />
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <span className="text-white text-[10px] font-bold">Preview</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-1">
                                                            {(task.status === 'GENERATING' || task.status === 'STARTING' || task.status === 'PROCESSING' || task.status === 'CACHING') && <IconLoader className="text-blue-500" />}
                                                            <span className="text-[10px] text-gray-500 font-bold">{String(task.stage || '')}</span>
                                                        </div>
                                                    ))}
                                                    {false && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setActiveImageTaskId(task.id); }}
                                                                className="px-3 py-1.5 text-xs font-bold bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                                                            >
                                                                Preview
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); triggerDownload(task.imageUrl, task.id, `${task.projectName || 'image_task'}_${task.id}`, '.png'); }}
                                                                className="px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                                            >
                                                                下载
                                                            </button>
                                                        </div>
                                                    )}
                                                    {(task.status === 'GENERATING' || task.status === 'STARTING') && (
                                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                                                            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${task.progress}%` }}></div>
                                                        </div>
                                                    )}
                                                    {false && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setActiveImageTaskId(task.id); }}
                                                                className="px-3 py-1.5 text-xs font-bold bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                                                            >
                                                                Preview
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); triggerDownload(task.imageUrl, task.id, `${task.projectName || 'image_task'}_${task.id}`, '.png'); }}
                                                                className="px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                                            >
                                                                下载
                                                            </button>
                                                        </div>
                                                    )}
                                                    {false && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setActiveImageTaskId(task.id); }}
                                                                className="px-3 py-1.5 text-xs font-bold bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                                                            >
                                                                Preview
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); triggerDownload(task.imageUrl, task.id, `${task.projectName || 'image_task'}_${task.id}`, '.png'); }}
                                                                className="px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                                            >
                                                                下载
                                                            </button>
                                                        </div>
                                                     )}
                                                     {false && (
                                                          <div className="flex gap-2">
                                                              <button
                                                                  onClick={(e) => { e.stopPropagation(); setActiveImageTaskId(task.id); }}
                                                                 className="px-3 py-1.5 text-xs font-bold bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                                                             >
                                                                 Preview
                                                             </button>
                                                             <button
                                                                 onClick={(e) => { e.stopPropagation(); triggerDownload(task.imageUrl, task.id, `${task.projectName || 'image_task'}_${task.id}`, '.png'); }}
                                                                 className="px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                                             >
                                                                 下载
                                                             </button>
                                                         </div>
                                                     )}
                                                 </div>
                                             </td>
                                            <td className="p-4 cursor-pointer hover:bg-gray-100 transition-colors relative" onMouseEnter={(e) => setActiveTooltip({ taskId: task.id, type: 'prompt', rect: e.currentTarget.getBoundingClientRect(), title: '完整提示词' })} onMouseLeave={() => setActiveTooltip(null)} onClick={() => handleCopy(task.prompt)}>
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-xs font-bold text-blue-600 uppercase bg-blue-50 w-fit px-1.5 py-0.5 rounded">{String(task.projectName || '')}</div>
                                                    <div className="text-sm text-gray-800 font-medium line-clamp-3 leading-relaxed" title="点击复制完整内容">{String(task.prompt || '')}</div>
                                                    <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                        <span className={`px-1 py-0.5 rounded ${task.generationType === 'text' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>{task.generationType === 'text' ? ((task.mediaType === 'image') ? '文生图' : '文生视频') : ((task.mediaType === 'image') ? '图生图' : '图生视频')}</span>
                                                        {task.scriptSnippet && !String(task.scriptSnippet).startsWith("重复任务") && <span className="truncate max-w-[200px]">台词: "{String(task.scriptSnippet)}"</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4"
                                                onMouseEnter={(e) => {
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    if (task.status === 'FAILED' && task.errorMessage) setActiveTooltip({ taskId: task.id, type: 'error', rect, title: '错误详情' });
                                                    else if (task.status === 'GENERATING' || task.status === 'STARTING' || task.status === 'COMPLETED' || task.status === 'PROCESSING' || task.status === 'CACHING') setActiveTooltip({ taskId: task.id, type: 'log', rect, title: '实时响应' });
                                                }}
                                                onMouseLeave={() => setActiveTooltip(null)}
                                                onClick={() => { if (task.status === 'FAILED' && task.errorMessage) handleCopy(task.errorMessage); }}
                                                style={{ cursor: 'help' }}
                                            >
                                                <div className="flex flex-col gap-2">
                                                    <StatusBadge status={task.status} stage={task.stage} progress={task.progress} warning={task.warning} />
                                                    {task.status === 'COMPLETED' && (task.mediaType || 'video') === 'video' && task.videoUrl && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setActiveVideoTaskId(task.id); }}
                                                                className="px-3 py-1.5 text-xs font-bold bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                                                            >
                                                                播放
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); triggerDownload(task.videoUrl, task.id, `${task.projectName || 'sora_task'}_${task.id}`, '.mp4'); }}
                                                                className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                            >
                                                                下载
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
      </div>
        </>
      )}

      {showBatchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white border border-gray-200 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
                  <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
                      <div><h3 className="font-bold text-gray-900 text-lg">{batchMode === 'script' ? '批量文案录入' : '重复生成设置'}</h3><p className="text-xs text-gray-500 mt-1">{batchMode === 'script' ? '每一行将生成一个独立的视频任务。' : '将重复生成当前提示词。'}</p></div>
                      <button onClick={() => setShowBatchModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors p-1 hover:bg-gray-100 rounded-full"><IconX size={20} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 bg-gray-50 flex flex-col items-center justify-center">
                      {batchMode === 'script' ? (
                          <div className="w-full space-y-3">
                              {batchScripts.map((script, idx) => (
                                  <div key={idx} className="flex gap-3 items-center animate-in slide-in-from-left-2 duration-300"><span className="text-xs font-mono text-gray-400 w-6 text-right">{idx + 1}.</span><input ref={idx === batchScripts.length - 1 ? batchInputRef : null} type="text" value={String(script)} placeholder={idx === batchScripts.length - 1 ? "输入新台词文案..." : ""} onChange={(e) => handleScriptChange(idx, e.target.value)} className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-all shadow-sm" /></div>
                              ))}
                          </div>
                      ) : (
                          <div className="w-full max-w-sm space-y-6">
                              <div className="flex items-center justify-center gap-4"><button onClick={() => setRepeatCount(c => Math.max(1, c - 1))} className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm"><IconMinus size={20} /></button><div className="text-center"><input type="number" min="1" value={repeatCount} onChange={(e) => setRepeatCount(Math.max(1, parseInt(e.target.value) || 1))} className="text-5xl font-bold text-gray-800 bg-transparent w-32 text-center focus:outline-none" /><div className="text-xs text-gray-400 mt-1">次重复</div></div><button onClick={() => setRepeatCount(c => c + 1)} className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm"><IconPlus size={20} /></button></div>
                          </div>
                      )}
                  </div>
                  <div className="p-5 border-t border-gray-200 bg-white flex justify-end gap-3"><button onClick={() => setShowBatchModal(false)} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg">取消</button><button onClick={handleBatchAddToQueue} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-sm">添加任务</button></div>
              </div>
          </div>
      )}

      {showDebug && (
          <div className="h-48 border-t border-gray-200 bg-white p-0 flex flex-col absolute bottom-0 left-0 right-0 z-20 shadow-2xl">
              <div className="flex border-b border-gray-200"><div className="px-4 py-2 text-xs font-bold text-gray-600 border-r border-gray-200 bg-gray-50">系统日志</div><div className="flex-1 bg-gray-50 flex justify-end"><button onClick={() => setShowDebug(false)} className="px-4 hover:bg-gray-200 text-gray-500"><IconX size={14} /></button></div></div>
              <div className="flex-1 flex overflow-hidden">
                  <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1 bg-white">
                       {logs.map((log, i) => (<div key={i} className={`flex gap-2 ${log.type === 'error' ? 'text-red-600' : log.type === 'success' ? 'text-green-600' : 'text-gray-500'}`}><span className="opacity-50 select-none">[{String(log.time || '')}]</span><span>{String(log.msg || '')}</span></div>))}
                      <div ref={logsEndRef} />
                  </div>
                  <div className="w-1/3 p-4 overflow-y-auto bg-gray-50 border-l border-gray-200"><pre className="font-mono text-[10px] text-gray-600 whitespace-pre-wrap break-all">{String(curlPreview || '')}</pre></div>
              </div>
          </div>
      )}

      {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4" onClick={() => setShowSettings(false)}>
              <div className="bg-white border border-gray-200 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                      <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 text-lg">设置</h3>
                          <div className="text-[11px] text-gray-500 mt-0.5 truncate">统一使用 `v1/chat/completions` 接口</div>
                      </div>
                      <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-colors" title="关闭">
                          <IconX size={20}/>
                      </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-8">
                      <section className="space-y-4">
                          <div className="flex items-center justify-between gap-3">
                              <h4 className="text-sm font-bold text-gray-900">生成</h4>
                              <div className="text-[10px] text-gray-400 font-mono truncate">{String(workMode === 'image' ? selectedImageModelName : selectedVideoModelName)}</div>
                          </div>

                          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 w-fit">
                              <button onClick={() => setWorkMode('video')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${workMode === 'video' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Video</button>
                              <button onClick={() => setWorkMode('image')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${workMode === 'image' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Image</button>
                          </div>

                          {workMode === 'video' ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Video Provider</label>
                                      <div className="grid grid-cols-2 gap-2">
                                          <button onClick={() => setVideoProvider('sora')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${videoProvider === 'sora' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>Sora2API</button>
                                          <button onClick={() => setVideoProvider('comfyui')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${videoProvider === 'comfyui' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>ComfyUI</button>
                                      </div>
                                  </div>

                                  {videoProvider === 'sora' ? (
                                      <div className="space-y-2">
                                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Video Model</label>
                                          <div className="grid grid-cols-2 gap-2">
                                              <button onClick={() => setModelFamily('sora2')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${modelFamily === 'sora2' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>sora2</button>
                                              <button onClick={() => setModelFamily('sora2pro')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${modelFamily === 'sora2pro' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>sora2pro</button>
                                              <button onClick={() => setModelFamily('sora2pro-hd')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${modelFamily === 'sora2pro-hd' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>sora2pro-高清</button>
                                              <button onClick={() => setModelFamily('prompt-enhance-short')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${modelFamily === 'prompt-enhance-short' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>提示增强-短</button>
                                              <button onClick={() => setModelFamily('prompt-enhance-medium')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${modelFamily === 'prompt-enhance-medium' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>提示增强-中</button>
                                              <button onClick={() => setModelFamily('prompt-enhance-long')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${modelFamily === 'prompt-enhance-long' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>提示增强-长</button>
                                          </div>
                                      </div>
                                  ) : (
                                      <div className="space-y-2">
                                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ComfyUI Workflow/Model (optional)</label>
                                          <div className="flex items-center gap-2">
                                            <input list="comfyui-models-datalist" type="text" value={String(comfyuiModel || '')} onChange={(e) => setComfyuiModel(e.target.value)} placeholder="留空使用 comfyui2api 默认工作流；可填：img2video.json" className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 shadow-sm" />
                                            <button onClick={loadComfyuiModels} disabled={comfyuiModelsLoading} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all flex items-center gap-2 ${comfyuiModelsLoading ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}>
                                              {comfyuiModelsLoading ? <IconLoader size={14} /> : <IconLink size={14} />}
                                              {comfyuiModelsLoading ? '加载中' : '加载工作流'}
                                            </button>
                                          </div>
                                          {comfyuiModelsError ? (
                                            <div className="text-xs text-red-600">{String(comfyuiModelsError || '')}</div>
                                          ) : (
                                            <div className="text-[10px] text-gray-400">
                                              可用模型列表：ComfyUI2API 的 <span className="font-mono">GET /v1/models</span>（网关：<span className="font-mono">/comfyui/v1/models</span>）
                                              {Array.isArray(comfyuiWorkflowSuggestions) && comfyuiWorkflowSuggestions.length > 0 && (
                                                <span className="ml-2">已加载 {comfyuiWorkflowSuggestions.length} 个</span>
                                              )}
                                            </div>
                                          )}
                                      </div>
                                  )}
                                  <div className="space-y-4">
                                      <div className="space-y-2">
                                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">画面方向</label>
                                          <div className="grid grid-cols-2 gap-2">
                                              <button onClick={() => setOrientation('landscape')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${orientation === 'landscape' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>横屏</button>
                                              <button onClick={() => setOrientation('portrait')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${orientation === 'portrait' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>竖屏</button>
                                          </div>
                                      </div>
                                      <div className="space-y-2">
                                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">时长</label>
                                          <div className="grid grid-cols-2 gap-2">
                                              <button onClick={() => setDuration('10s')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${duration === '10s' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>10秒</button>
                                              <button onClick={() => setDuration('15s')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${duration === '15s' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>15秒</button>
                                          </div>
                                      </div>
                                      <div className="space-y-2">
                                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">当前模型</label>
                                          <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 font-mono flex items-center gap-2 shadow-sm"><IconLink size={14} className="text-gray-400"/>{String(selectedVideoModelName)}</div>
                                      </div>
                                  </div>
                              </div>
                          ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Image Model</label>
                                      <div className="grid grid-cols-1 gap-2">
                                          <button onClick={() => setImageModel('gpt-image')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${imageModel === 'gpt-image' ? 'bg-white border-emerald-500 text-emerald-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>gpt-image</button>
                                          <button onClick={() => setImageModel('gpt-image-landscape')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${imageModel === 'gpt-image-landscape' ? 'bg-white border-emerald-500 text-emerald-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>gpt-image-横屏</button>
                                          <button onClick={() => setImageModel('gpt-image-portrait')} className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${imageModel === 'gpt-image-portrait' ? 'bg-white border-emerald-500 text-emerald-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>gpt-image-竖屏</button>
                                      </div>
                                  </div>
                                  <div className="space-y-2">
                                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">当前模型</label>
                                      <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 font-mono flex items-center gap-2 shadow-sm"><IconLink size={14} className="text-gray-400"/>{String(selectedImageModelName)}</div>
                                  </div>
                              </div>
                          )}
                      </section>

                      <section className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-900">对话显示</h4>
                          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 w-fit">
                              <button onClick={() => setRecordsScope('project')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${recordsScope === 'project' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>当前项目</button>
                              <button onClick={() => setRecordsScope('all')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${recordsScope === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>全部记录</button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">当前项目</label>
                                  <select value={String(activeProjectId)} onChange={(e) => setActiveProjectId(parseInt(e.target.value, 10) || activeProjectId)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500">
                                      {projects.map((p) => (
                                          <option key={p.id} value={String(p.id)}>{String(p.name || `项目 ${p.id}`)}</option>
                                      ))}
                                  </select>
                                  <div className="flex gap-2">
                                      <button onClick={handleCreateProject} className="flex-1 px-3 py-2 text-xs font-bold bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">新建</button>
                                      <button onClick={(e) => handleDeleteProject(e, activeProjectId)} className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg border ${projects.length <= 1 ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`} disabled={projects.length <= 1}>删除</button>
                                  </div>
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">项目名称</label>
                                  <input type="text" value={String(activeProject?.name || '')} onChange={(e) => updateActiveProject('name', e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500" />
                              </div>
                          </div>

                          <div className="space-y-2">
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex justify-between">总提示词 (Master Prompt)<span className="text-xs text-blue-600 normal-case bg-blue-50 px-2 py-0.5 rounded">可用 "这是台词文案" 占位</span></label>
                              <textarea value={String(activeProject?.prompt || '')} onChange={(e) => updateActiveProject('prompt', e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-all resize-none min-h-[120px] font-mono leading-relaxed" placeholder="例如：一个精美的咖啡杯，这是台词文案，4k分辨率..." />
                          </div>

                          <div className="space-y-2">
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">默认图片（可选，批量/复用用）</label>
                              <div className="relative">
                                  <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                  <div className={`h-28 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors ${activeProject?.image ? 'border-blue-500/40 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                                      {activeProject?.image ? (
                                          <div className="flex items-center gap-3 px-3">
                                              <img src={String(activeProject.image)} alt="preview" className="h-20 w-20 rounded object-cover border border-gray-200 shadow-sm" />
                                              <div className="min-w-0">
                                                  <div className="text-xs text-green-600 font-bold flex items-center gap-2"><IconCheck size={14} /> 已上传</div>
                                                  <div className="text-[10px] text-gray-500 mt-1 truncate max-w-[240px]">{String(activeProject.imageName || '')}</div>
                                                  <div className="text-[10px] text-blue-500 mt-1">点击替换</div>
                                              </div>
                                          </div>
                                      ) : (
                                          <div className="text-center text-gray-400"><IconPlus size={20} className="mx-auto mb-1 text-gray-300"/><span className="text-xs font-medium">点击上传图片</span></div>
                                      )}
                                  </div>
                              </div>
                          </div>
                      </section>

                      <section className="space-y-4">
                          <div className="flex items-center justify-between gap-3">
                              <h4 className="text-sm font-bold text-gray-900">批量生成</h4>
                              <button onClick={handleOpenBatchModal} className="px-3 py-2 text-xs font-bold bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">打开批量面板</button>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                              <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                                  <button onClick={() => setBatchMode('script')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${batchMode === 'script' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>台词模式</button>
                                  <button onClick={() => setBatchMode('repeat')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${batchMode === 'repeat' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>重复模式</button>
                              </div>

                              <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                                  <button onClick={() => setGenerationType('text')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${generationType === 'text' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{workMode === 'image' ? '文生图' : '文生视频'}</button>
                                  <button onClick={() => setGenerationType('image')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${generationType === 'image' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{workMode === 'image' ? '图生图' : '图生视频'}</button>
                              </div>
                          </div>

                          {batchMode === 'repeat' && (
                              <div className="space-y-2">
                                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">重复次数</label>
                                  <input type="number" min="1" value={repeatCount} onChange={(e) => setRepeatCount(Math.max(1, parseInt(e.target.value) || 1))} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500" />
                              </div>
                          )}

                          {generationType === 'image' && !activeProject?.image && (
                              <div className="text-xs text-red-600">
                                  图生模式需要上传「默认图片」。聊天框里也可以直接附带图片发送。
                              </div>
                          )}
                      </section>

                      <section className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-900">系统</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                  <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2"><IconLink size={12}/> API 地址 (Endpoint)</label>
                                  <input type="text" value={String(config.baseUrl || '')} onChange={(e) => setConfig({...config, baseUrl: e.target.value})} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-all" />
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                  <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2"><IconLink size={12}/> ComfyUI2API Base URL</label>
                                  <input type="text" value={String(config.comfyuiBaseUrl || '')} onChange={(e) => setConfig({...config, comfyuiBaseUrl: e.target.value})} placeholder="例如: http://127.0.0.1:8000" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-all" />
                                  <div className="text-[10px] text-gray-400">Video Provider=ComfyUI 时使用（会自动拼接 /v1）</div>
                              </div>
                              <div className="space-y-2">
                                  <label className="text-xs font-semibold text-gray-500 uppercase">API 密钥 (Key，可选)</label>
                                  <input type="password" value={String(config.apiKey || '')} onChange={(e) => setConfig({...config, apiKey: e.target.value})} placeholder="留空表示无需前端鉴权 / 由服务端注入" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-all" />
                              </div>
                              {gatewayAuthEnabled && (
                                  <div className="space-y-2 md:col-span-2">
                                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">访问鉴权（密码）</label>
                                      <div className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                                          <div className="min-w-0">
                                              <div className="text-xs text-gray-700 font-medium truncate">
                                                  状态：{isGatewayAuthed ? '已登录' : '未登录'}
                                              </div>
                                              <div className="text-[10px] text-gray-400 mt-1">
                                                  鉴权由服务端控制（AUTH_ENABLED/AUTH_PASSWORD），浏览器通过 Cookie 保持会话。
                                              </div>
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0">
                                              {!isGatewayAuthed ? (
                                                  <button onClick={openGatewayAuthModal} className="px-3 py-1.5 text-xs font-bold bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                                                      登录
                                                  </button>
                                              ) : (
                                                  <>
                                                      <button onClick={openGatewayAuthModal} className="px-3 py-1.5 text-xs font-bold bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                                                          重新登录
                                                      </button>
                                                      <button onClick={logoutGatewayAuth} className="px-3 py-1.5 text-xs font-bold bg-white border border-gray-300 text-red-600 rounded-lg hover:bg-red-50">
                                                          退出
                                                      </button>
                                                  </>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                              )}
                              <div className="space-y-2">
                                  <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2"><IconLayers size={12}/> 并发控制</label>
                                  <input type="number" min="1" value={config.maxConcurrent} onChange={(e) => setConfig({...config, maxConcurrent: Math.max(1, parseInt(e.target.value) || 1)})} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500" />
                              </div>
                              <div className="space-y-2">
                                  <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2"><IconClock size={12}/> 提交间隔 (秒)</label>
                                  <div className="flex items-center gap-3">
                                      <input type="number" min="0.1" step="0.1" value={config.taskInterval} onChange={(e) => setConfig({...config, taskInterval: Math.max(0.1, parseFloat(e.target.value) || 0.1)})} className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500" />
                                      <span className="text-xs text-gray-400 font-medium">S</span>
                                  </div>
                              </div>
                          </div>
                      </section>
                  </div>

                  <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-white">
                      <button onClick={() => setShowSettings(false)} className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-sm transition-all">保存并关闭</button>
                  </div>
              </div>
          </div>
      )}

      {gatewayAuthEnabled && showGatewayAuthModal && (
          <div
              className="fixed inset-0 z-[65] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-150"
              onClick={() => setShowGatewayAuthModal(false)}
          >
              <div
                  className="bg-white border border-gray-200 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
              >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 gap-3">
                      <div className="min-w-0">
                          <div className="text-sm font-bold text-gray-900">访问鉴权</div>
                          <div className="text-[11px] text-gray-500 mt-1 truncate">
                              该站点已开启访问鉴权，请输入访问密码后继续。
                          </div>
                      </div>
                      <button
                          onClick={() => setShowGatewayAuthModal(false)}
                          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="关闭"
                      >
                          <IconX size={18} />
                      </button>
                  </div>

                  <div className="px-5 py-4 space-y-3">
                      {gatewayAuthError && (
                          <div className="text-xs text-red-600">
                              {String(gatewayAuthError || '')}
                          </div>
                      )}
                      <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">访问密码</label>
                          <input
                              type="password"
                              autoFocus
                              value={String(gatewayPasswordDraft || '')}
                              onChange={(e) => setGatewayPasswordDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key !== 'Enter') return;
                                if (e.isComposing || e.nativeEvent?.isComposing) return;
                                if (!String(gatewayPasswordDraft || '').trim()) return;
                                e.preventDefault();
                                submitGatewayLogin();
                              }}
                              placeholder="请输入访问密码"
                              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-all"
                          />
                      </div>
                  </div>

                  <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50">
                      <button
                          onClick={() => setShowGatewayAuthModal(false)}
                          className="px-4 py-2 text-xs font-bold bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                          取消
                      </button>
                      <button
                          onClick={submitGatewayLogin}
                          disabled={!String(gatewayPasswordDraft || '').trim() || gatewayAuthSubmitting}
                          className={`px-4 py-2 text-xs font-bold rounded-lg ${
                            (!String(gatewayPasswordDraft || '').trim() || gatewayAuthSubmitting)
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                      >
                          {gatewayAuthSubmitting ? '登录中…' : '登录'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {pendingDeleteProject && (
          <div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-150"
              onClick={() => setPendingDeleteProject(null)}
          >
              <div
                  className="bg-white border border-gray-200 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
              >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 gap-3">
                      <div className="min-w-0">
                          <div className="text-sm font-bold text-gray-900">确认删除项目？</div>
                          <div className="text-[11px] text-gray-500 mt-1 truncate">
                              {String(pendingDeleteProject?.name || '')}
                          </div>
                      </div>
                      <button
                          onClick={() => setPendingDeleteProject(null)}
                          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="关闭"
                      >
                          <IconX size={18} />
                      </button>
                  </div>

                  <div className="px-5 py-4 text-sm text-gray-700">
                      删除后将无法恢复，并清除该项目的默认图片。
                  </div>

                  <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50">
                      <button
                          onClick={() => setPendingDeleteProject(null)}
                          className="px-4 py-2 text-xs font-bold bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                          取消
                      </button>
                      <button
                          onClick={() => {
                              const id = pendingDeleteProject?.id;
                              setPendingDeleteProject(null);
                              if (Number.isFinite(id)) performDeleteProject(id);
                          }}
                          className="px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                          确认删除
                      </button>
                  </div>
              </div>
          </div>
      )}

      {activeVideoTaskId && (() => {
          const task = queue.find(t => t.id === activeVideoTaskId);
          if (!task?.videoUrl) return null;
          const videoUrl = String(task.videoUrl);
          const suggestedName = `${task.projectName || 'sora_task'}_${task.id}`;

          return (
              <div
                  className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150"
                  onClick={() => setActiveVideoTaskId(null)}
              >
                  <div className="bg-white border border-gray-200 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 gap-4">
                          <div className="min-w-0">
                              <div className="text-sm font-bold text-gray-900 truncate">{String(task.projectName || `任务 ${task.id}`)}</div>
                              <div className="text-[10px] text-gray-500 font-mono truncate">{videoUrl}</div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                              <button
                                  onClick={(e) => { e.stopPropagation(); handleCopy(videoUrl); }}
                                  className="px-3 py-1.5 text-xs font-bold bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                              >
                                  复制链接
                              </button>
                              <button
                                  onClick={(e) => { e.stopPropagation(); triggerDownload(videoUrl, task.id, suggestedName, '.mp4'); }}
                                  className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                              >
                                  下载
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setActiveVideoTaskId(null); }} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg" title="关闭">
                                  <IconX size={18} />
                              </button>
                          </div>
                      </div>
                      <div className="bg-black">
                          <video src={videoUrl} controls autoPlay className="w-full max-h-[70vh] object-contain" />
                      </div>
                  </div>
              </div>
          );
      })()}

      {/* 智能悬浮窗 */}
      {activeImageTaskId && (() => {
          const task = queue.find(t => t.id === activeImageTaskId);
          if (!task?.imageUrl) return null;
          const imageUrl = String(task.imageUrl);
          const suggestedName = `${task.projectName || 'image_task'}_${task.id}`;
          const urlPreview = imageUrl.startsWith('data:') ? `${imageUrl.slice(0, 80)}...` : imageUrl;

          return (
              <div
                  className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150"
                  onClick={() => setActiveImageTaskId(null)}
              >
                  <div className="bg-white border border-gray-200 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 gap-4">
                          <div className="min-w-0">
                              <div className="text-sm font-bold text-gray-900 truncate">{String(task.projectName || `Task ${task.id}`)}</div>
                              <div className="text-[10px] text-gray-500 font-mono truncate">{urlPreview}</div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                              <button
                                  onClick={(e) => { e.stopPropagation(); handleCopy(imageUrl); }}
                                  className="px-3 py-1.5 text-xs font-bold bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                              >
                                  Copy
                              </button>
                              <button
                                  onClick={(e) => { e.stopPropagation(); triggerDownload(imageUrl, task.id, suggestedName, '.png'); }}
                                  className="px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                              >
                                  Download
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setActiveImageTaskId(null); }} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg" title="Close">
                                  <IconX size={18} />
                              </button>
                          </div>
                      </div>
                      <div className="bg-black">
                          <img src={imageUrl} alt="preview" className="w-full max-h-[70vh] object-contain" />
                      </div>
                  </div>
              </div>
          );
      })()}

      {activeTooltip && (() => {
          const task = queue.find(t => t.id === activeTooltip.taskId);
          if (!task) return null;
          let rawContent = activeTooltip.type === 'prompt' ? task.prompt : (activeTooltip.type === 'error' ? task.errorMessage : (task.streamLog || '等待数据...'));
          let contentText = String(rawContent || '');
          let titleColor = activeTooltip.type === 'error' ? 'text-red-500' : (activeTooltip.type === 'log' ? 'text-green-600' : 'text-gray-500');
          let positionStyle = activeTooltip.rect.left > window.innerWidth / 2 ? { right: window.innerWidth - activeTooltip.rect.right, left: 'auto' } : { left: activeTooltip.rect.left, right: 'auto' };
          if (activeTooltip.rect.bottom > window.innerHeight - 300) positionStyle.bottom = window.innerHeight - activeTooltip.rect.top + 10;
          else positionStyle.top = activeTooltip.rect.bottom + 10;

          return (<div className="fixed z-50 bg-white border border-gray-200 text-gray-800 text-xs rounded-lg p-4 shadow-xl max-w-[400px] pointer-events-none animate-in fade-in duration-150" style={positionStyle}><div className={`font-bold mb-1 uppercase text-[10px] tracking-wider flex justify-between items-center ${titleColor}`}><span>{String(activeTooltip.title || '')}</span>{(activeTooltip.type === 'error' || activeTooltip.type === 'prompt') && <span className="text-[9px] opacity-70 font-normal">(点击复制)</span>}</div><div className={`font-mono whitespace-pre-wrap leading-relaxed border-l-2 pl-2 border-gray-200`}>{contentText}</div></div>);
      })()}

      {toastVisible && <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-[60] animate-in fade-in zoom-in duration-200">已复制内容</div>}
    </div>
  );
}

const StatusBadge = ({ status, stage, progress, warning }) => {
    let styles = "bg-gray-100 text-gray-500 border-gray-200";
    let text = status;

    if (status === 'GENERATING' || status === 'STARTING') {
        return (
            <div className="flex flex-col gap-1 w-full max-w-[120px]">
                <div className="flex justify-between items-center text-[10px] text-blue-600 font-bold uppercase"><span>{String(stage || '')}</span><span>{String(progress || 0)}%</span></div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} /></div>
            </div>
        );
    }

    if (status === 'PROCESSING') {
        styles = "bg-indigo-50 text-indigo-600 border-indigo-200 animate-pulse";
        text = stage || "去水印中";
    } else if (status === 'CACHING') {
        styles = "bg-purple-50 text-purple-600 border-purple-200 animate-pulse";
        text = stage || "同步中";
    } else if (status === 'COMPLETED') {
        if (warning) {
            styles = "bg-yellow-50 text-yellow-600 border-yellow-200";
            text = warning;
        } else {
            styles = "bg-green-50 text-green-600 border-green-200";
            text = "已完成";
        }
    } else if (status === 'FAILED') {
        if (stage === '内容违规') {
            styles = "bg-orange-50 text-orange-600 border-orange-200";
            text = "内容违规";
        } else if (stage === '超时') {
            styles = "bg-slate-50 text-slate-600 border-slate-200";
            text = "超时";
        } else {
            styles = "bg-red-50 text-red-600 border-red-200";
            text = "失败";
        }
    } else {
        text = status === 'PENDING' ? '等待中' : status;
    }

    return <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${styles}`}>{String(text)}</span>;
};
