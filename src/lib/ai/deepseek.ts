

export type DeepSeekOptions = {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    apiKey?: string;
  };
  

  export async function callDeepSeek(
    systemPrompt: string,
    inputData: any,
    options: DeepSeekOptions = {}
  ): Promise<any> {
    console.log("Calling DeepSeek API");
  
    // Normalize input data to string
    const normalizedInput = typeof inputData === 'string' 
      ? inputData 
      : JSON.stringify(inputData);
  
    // Default options
    const {
      model = "deepseek-chat",
      temperature = 0.2,
      maxTokens = 8000,
      apiKey = process.env.DEEPSEEK_API_KEY
    } = options;
  
    if (!apiKey) {
      throw new Error("DeepSeek API key is required but not provided");
    }
  
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: normalizedInput
            }
          ],
          temperature,
          response_format: { type: "json_object" },
          max_tokens: maxTokens
        })
      });
  
      if (!response.ok) {
        console.error(`DeepSeek API error: ${response.status} ${response.statusText}`);
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }
  
      const responseData = await response.json();

      console.log("Response from deepseek is", responseData)
      
      if (!responseData.choices?.[0]?.message?.content || 
          responseData.choices[0].message.content.trim() === '') {
        console.warn("DeepSeek API returned empty content");
        throw new Error("DeepSeek API returned empty content");
      }
  
      // Parse the JSON response
      try {
        return JSON.parse(responseData.choices[0].message.content);
      } catch (parseError) {
        console.error("Error parsing JSON from DeepSeek response:", parseError);
        console.error("Raw response:", responseData.choices[0].message.content);
        throw parseError;
      }
    } catch (error) {
      console.error("Error calling DeepSeek API:", error);
      throw error;
    }
  }