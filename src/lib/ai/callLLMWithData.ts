import { universalJobExtractorPrompt } from "../prompts/job-extractor-gpt-prompt";



export async function callLLMWithData(cleanedData: any) {
  const RETRY_CONFIG = {
    maxRetries: 3,
    initialDelayMs: 2000,
    maxDelayMs: 30000,
    backoffFactor: 2,
  };

  let retryCount = 0;
  let delay = RETRY_CONFIG.initialDelayMs;

  while (true) {
    try {
      
      const systemPrompt = universalJobExtractorPrompt();

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: cleanedData.concatenatedText
            }
          ],
          temperature: 0.1,
          response_format: { type: "json_object" },
          max_tokens: 4000
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const responseData = await response.json();


      if (!responseData.choices[0].message.content || 
          responseData.choices[0].message.content.trim() === '') {
        console.warn("DeepSeek API returned empty content");
        return {
          jobPostings: [],
          count: 0,
          summary: "No job postings were extracted due to API limitation."
        };
      }
      

      try {
        const llmResponse = JSON.parse(responseData.choices[0].message.content);
        

        if (!llmResponse.jobPostings) {
          llmResponse.jobPostings = [];
        }
        
        if (typeof llmResponse.count !== 'number') {
          llmResponse.count = llmResponse.jobPostings.length;
        }
        
        if (!llmResponse.summary) {
          llmResponse.summary = `Found ${llmResponse.jobPostings.length} potential job postings during LinkedIn browsing session.`;
        }
        
        return llmResponse;
      } catch (parseError) {
        console.error("Error parsing LLM response:", parseError);
        console.error("Raw response:", responseData.choices[0].message.content);
        

        return {
          jobPostings: [],
          count: 0,
          summary: "Failed to parse job postings due to invalid JSON from LLM.",
          error: parseError,
          rawResponse: JSON.stringify(responseData.choices[0].message.content)
        };
      }
    } catch (error: any) {

      const isRetryable = 
        error.message?.includes("429") || 
        error.message?.includes("500") || 
        error.message?.includes("502") || 
        error.message?.includes("503") || 
        error.message?.includes("504") || 
        error.message?.includes("overloaded"); 
      
      if (!isRetryable || retryCount >= RETRY_CONFIG.maxRetries) {
        console.error("Error calling DeepSeek LLM API (final attempt):", error);
        return {
          jobPostings: [],
          count: 0,
          summary: "Error processing job postings.",
          error: error
        };
      }
      
      retryCount++;
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * RETRY_CONFIG.backoffFactor, RETRY_CONFIG.maxDelayMs);
    }
  }
}