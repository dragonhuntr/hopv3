import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

export const litellm = createOpenAICompatible({
  name: 'litellm',
  baseURL: process.env.LITELLM_ENDPOINT!,
  fetch: async (url, request) => {
    return await fetch(url, { ...request });
  },
});