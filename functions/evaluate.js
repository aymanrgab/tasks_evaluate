const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function evaluateVoiceAssistantResponse(userRequest, vaResponse, context, evaluationQuestion) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    Evaluation Question: ${evaluationQuestion}

    User Request (Scenario): ${userRequest}
    Voice Assistant Response: ${vaResponse}
    Context: ${context}

    Based on the above information, answer the evaluation question with either "Yes" or "No".
    Consider the following criteria:
    1. Relevance: Is the response directly addressing the user's request?
    2. Accuracy: Is the information provided correct and up-to-date?
    3. Completeness: Does the response fully answer the user's question?
    4. Appropriateness: Is the tone and content suitable for the context?

    Respond with ONLY "Yes" or "No".
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
}

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { userRequest, vaResponse, context: contextData, evalQuestion } = JSON.parse(event.body);
    const result = await evaluateVoiceAssistantResponse(userRequest, vaResponse, contextData, evalQuestion);

    return {
      statusCode: 200,
      body: JSON.stringify({ action: "result", result }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ action: "error", message: error.message }),
    };
  }
};