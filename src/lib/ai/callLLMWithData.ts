import { universalJobExtractorPrompt } from "../prompts/job-extractor-gpt-prompt";



export async function callLLMWithData(cleanedData: any) {
    console.log("Calling LLM with cleaned data");
    

    const systemPrompt = universalJobExtractorPrompt()
  
    // 2. Call the DeepSeek LLM API with the system prompt and cleaned data
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}` // Replace with your actual API key
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
          temperature: 0.1, // Low temperature for more deterministic output
          response_format: { type: "json_object" }, // Request JSON format
          max_tokens: 4000 // Set a reasonable limit to avoid truncation
        })
      });
      
      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();

      console.log("response data is", responseData)
      

      let llmResponse;
      try {

        if (!responseData.choices[0].message.content || 
            responseData.choices[0].message.content.trim() === '') {
          console.warn("DeepSeek API returned empty content");
          return {
            jobPostings: [],
            count: 0,
            summary: "No job postings were extracted due to API limitation."
          };
        }
        
        // Parse the JSON response
        llmResponse = JSON.parse(responseData.choices[0].message.content);

        console.log("llm response is", JSON.stringify(llmResponse))
        
        // Validate the structure
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
        
        // If parsing fails, return a structured error response
        return {
          jobPostings: [],
          count: 0,
          summary: "Failed to parse job postings due to invalid JSON from LLM.",
          error: parseError,
          rawResponse: JSON.stringify(responseData.choices[0].message.content)
        };
      }
    } catch (error) {
      console.error("Error calling DeepSeek LLM API:", error);
      return {
        jobPostings: [],
        count: 0,
        summary: "Error processing job postings.",
        error: error
      };
    }
  }