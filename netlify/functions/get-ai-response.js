exports.handler = async function(event) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { message } = JSON.parse(event.body);
        const geminiApiKey = process.env.GEMINI_API_KEY; // Securely get key from Netlify

        if (!geminiApiKey) {
            throw new Error("API key is not set.");
        }

        const context = "You are ARIA, the witty, creative AI for 2007 Productions..."; // Add your full context here

        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + geminiApiKey, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${context} User Question: "${message}"` }] }]
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API responded with status: ${response.status}`);
        }

        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: data.candidates[0].content.parts[0].text })
        };

    } catch (error) {
        console.error("Error in serverless function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Could not get a response from the AI." })
        };
    }
};