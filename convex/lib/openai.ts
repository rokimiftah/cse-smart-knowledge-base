// Call LLM API using fetch (curl-like) - for DeepSeek
export const callLLM = async (messages: Array<{ role: string; content: string }>) => {
  const apiKey = process.env.LLM_API_KEY;
  const apiUrl = process.env.LLM_API_URL || "https://inference.canopywave.io/v1";
  const model = process.env.LLM_MODEL_TEXT || "deepseek/deepseek-chat-v3.2";

  if (!apiKey) {
    throw new Error("LLM_API_KEY is not configured");
  }

  console.log("LLM API Request:", {
    url: `${apiUrl}/chat/completions`,
    model,
    messageCount: messages.length,
  });

  const response = await fetch(`${apiUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 4096,
      temperature: 0.3,
      // Remove response_format if DeepSeek doesn't support it
      // response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("LLM API Error:", {
      status: response.status,
      statusText: response.statusText,
      error,
      model,
      url: apiUrl,
    });
    throw new Error(`LLM API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  console.log("LLM API Success:", {
    model: data.model,
    usage: data.usage,
  });
  return data.choices[0].message.content;
};

export const getEmbedding = async (text: string, inputType: "query" | "passage" = "passage"): Promise<number[]> => {
  const apiKey = process.env.EMBEDDING_API_KEY || process.env.LLM_API_KEY;
  const apiUrl = process.env.EMBEDDING_API_URL || "https://integrate.api.nvidia.com/v1";
  const model = process.env.EMBEDDING_MODEL || "nvidia/nv-embedqa-e5-v5";

  if (!apiKey) {
    throw new Error("EMBEDDING_API_KEY or LLM_API_KEY is not configured");
  }

  // Truncate text to stay under Nvidia's 8192 token limit
  // Using ~3 chars per token to be safe (some chars = multiple tokens)
  const MAX_CHARS = 24000;
  const truncatedText = text.length > MAX_CHARS ? text.substring(0, MAX_CHARS) + "..." : text;

  console.log("Embedding API Request:", {
    url: `${apiUrl}/embeddings`,
    model,
    textLength: truncatedText.length,
    originalLength: text.length,
    truncated: text.length > MAX_CHARS,
    inputType,
    provider: apiUrl.includes("nvidia") ? "Nvidia" : "OpenAI",
    textPreview: truncatedText.substring(0, 100),
  });

  // Prepare request body
  const requestBody: any = {
    model,
    input: truncatedText,
    encoding_format: "float",
  };

  // Add input_type - required for Nvidia asymmetric models
  // Nvidia uses: "query" for search queries, "passage" for documents
  // OpenAI may use different parameter names
  requestBody.input_type = inputType;

  const response = await fetch(`${apiUrl}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Embedding API Error:", {
      status: response.status,
      statusText: response.statusText,
      error,
      model,
      url: apiUrl,
    });
    throw new Error(`Embedding API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const embedding = data.data[0].embedding;

  console.log("Embedding API Success:", {
    model: data.model || model,
    dimensions: embedding.length,
    inputType,
    provider: apiUrl.includes("nvidia") ? "Nvidia" : "OpenAI",
  });

  return embedding;
};
