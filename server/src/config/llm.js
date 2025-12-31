const OpenAI = require("openai");
const Anthropic = require("@anthropic-ai/sdk");

class LLMProvider {
  constructor() {
    this.provider = process.env.LLM_PROVIDER || "openai";

    if (this.provider === "openai") {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    } else if (this.provider === "openrouter") {
      this.client = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:3000",
          "X-Title": "BeyondChats Article Enhancement",
        },
      });
    } else if (this.provider === "anthropic") {
      this.client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
  }

  async generateCompletion(systemPrompt, userPrompt, options = {}) {
    const maxRetries = options.maxRetries || 3;
    const temperature = options.temperature || 0.7;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (this.provider === "openai" || this.provider === "openrouter") {
          return await this._callOpenAI(systemPrompt, userPrompt, temperature);
        } else if (this.provider === "anthropic") {
          return await this._callAnthropic(
            systemPrompt,
            userPrompt,
            temperature
          );
        }
      } catch (error) {
        console.error(`LLM API attempt ${attempt} failed:`, error.message);

        if (attempt === maxRetries) {
          throw new Error(
            `LLM API failed after ${maxRetries} attempts: ${error.message}`
          );
        }

        // Exponential backoff
        await this._sleep(Math.pow(2, attempt) * 1000);
      }
    }
  }

  async _callOpenAI(systemPrompt, userPrompt, temperature) {
    const modelConfig = {
      openai: "gpt-4-turbo-preview",
      openrouter: process.env.OPENROUTER_MODEL || "openai/gpt-4-turbo",
    };

    const response = await this.client.chat.completions.create({
      model: modelConfig[this.provider] || "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
      max_tokens: 4000,
    });

    return response.choices[0].message.content;
  }

  async _callAnthropic(systemPrompt, userPrompt, temperature) {
    const response = await this.client.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 4000,
      temperature,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    return response.content[0].text;
  }

  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = new LLMProvider();
