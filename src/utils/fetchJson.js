async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...options.headers,
    },
  });

  // 處理 HTTP 錯誤狀態碼
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // 回應不是 JSON 時，使用預設錯誤訊息
    }

    throw new Error(errorMessage);
  }

  // 204 沒有內容可供解析
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export default fetchJson;
