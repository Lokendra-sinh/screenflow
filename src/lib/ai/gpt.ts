

export type GPTOptions = {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    apiKey?: string;
  };
  

  export async function callGPT(
    systemPrompt: string,
    inputData: any,
    options: GPTOptions = {}
  ): Promise<any> {
    console.log("Calling OpenAI GPT API");
  
    // Normalize input data to string
    const normalizedInput = typeof inputData === 'string' 
      ? inputData 
      : JSON.stringify(inputData);
  
    // Default options
    const {
      model = "gpt-4-turbo",
      temperature = 0.2,
      maxTokens = 8000,
      apiKey = process.env.OPENAI_API_KEY
    } = options;
  
    if (!apiKey) {
      throw new Error("OpenAI API key is required but not provided");
    }
  
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
          max_tokens: maxTokens,
          response_format: { type: "json_object" }
        })
      });
  
      if (!response.ok) {
        console.error(`OpenAI API error: ${response.status} ${response.statusText}`);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }
  
      const responseData = await response.json();

      console.log("RESPONSE from GPT is:", responseData)
      
      if (!responseData.choices?.[0]?.message?.content || 
          responseData.choices[0].message.content.trim() === '') {
        console.warn("OpenAI API returned empty content");
        throw new Error("OpenAI API returned empty content");
      }
  
      // Parse the JSON response
      try {
        return JSON.parse(responseData.choices[0].message.content);
      } catch (parseError) {
        console.error("Error parsing JSON from OpenAI response:", parseError);
        console.error("Raw response:", responseData.choices[0].message.content);
        throw parseError;
      }
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      throw error;
    }
  }