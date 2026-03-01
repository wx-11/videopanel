export const detectUpstreamStreamFailure = (value) => {
  const text = String(value ?? '');
  if (!text) return null;

  const tail = text.length > 4000 ? text.slice(-4000) : text;

  if (/HTTP\\s*Error\\s*:\\s*\\d{3}\\b/i.test(tail)) return tail;
  if (/\\binvalid_request_error\\b/i.test(tail)) return tail;
  if (/\"type\"\\s*:\\s*\"invalid_request_error\"/i.test(tail)) return tail;
  if (/\"code\"\\s*:\\s*\"invalid_request\"/i.test(tail)) return tail;
  if (/didn['’]t look right with your request/i.test(tail)) return tail;
  if (/please try again later/i.test(tail) && /help\\.openai\\.com/i.test(tail)) return tail;
  if (/help\\.openai\\.com/i.test(tail) && /invalid_request/i.test(tail)) return tail;

  return null;
};

