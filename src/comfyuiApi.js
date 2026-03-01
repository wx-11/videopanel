const normalizeBaseUrl = (value) => {
  const base = String(value ?? '').trim();
  return base.replace(/\/+$/g, '');
};

export const ensureComfyuiV1BaseUrl = (baseUrl) => {
  const base = normalizeBaseUrl(baseUrl);
  if (!base) return '';
  if (/\/v1$/i.test(base)) return base;
  return `${base}/v1`;
};

export const comfyuiEndpoints = (baseUrl) => {
  const v1 = ensureComfyuiV1BaseUrl(baseUrl);
  return {
    v1,
    models: `${v1}/models`,
    createVideo: `${v1}/video/generations`,
    job: (jobId) => `${v1}/jobs/${encodeURIComponent(String(jobId ?? ''))}`,
  };
};

export const comfyuiProgressPercent = (progress, { completed = false } = {}) => {
  if (completed) return 100;
  if (!progress || typeof progress !== 'object') return 0;
  const value = Number(progress.value ?? 0);
  const max = Number(progress.max ?? 0);
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  const pct = Math.floor((value / max) * 100);
  return Math.max(0, Math.min(99, pct));
};

export const pickComfyuiVideoUrl = (job) => {
  const url = job?.url;
  if (typeof url === 'string' && url.trim()) return url.trim();

  const outputs = Array.isArray(job?.outputs) ? job.outputs : [];
  for (const o of outputs) {
    const outUrl = o?.url;
    if (typeof outUrl !== 'string' || !outUrl.trim()) continue;
    const mt = String(o?.media_type || '').toLowerCase();
    const fn = String(o?.filename || '').toLowerCase();
    if (mt.startsWith('video/') || fn.endsWith('.mp4') || fn.endsWith('.webm') || fn.endsWith('.mov') || fn.endsWith('.gif')) {
      return outUrl.trim();
    }
  }
  return null;
};

export const parseOpenAiLikeErrorMessage = (payloadOrText) => {
  if (!payloadOrText) return null;

  if (typeof payloadOrText === 'string') {
    const text = payloadOrText.trim();
    if (!text) return null;
    try {
      const obj = JSON.parse(text);
      return parseOpenAiLikeErrorMessage(obj) || text;
    } catch (e) {
      return text;
    }
  }

  if (typeof payloadOrText === 'object') {
    const err = payloadOrText?.error;
    if (err && typeof err === 'object') {
      const msg = err?.message;
      if (typeof msg === 'string' && msg.trim()) return msg.trim();
    }
  }

  return null;
};

