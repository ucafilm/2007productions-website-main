exports.handler = async function(event) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { 
            statusCode: 405, 
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: 'Method Not Allowed' 
        };
    }

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    try {
        const { message } = JSON.parse(event.body);
        const geminiApiKey = process.env.GEMINI_API_KEY; // Securely get key from Netlify

        if (!geminiApiKey) {
            throw new Error("API key is not set in environment variables.");
        }

        const context = `You are ARIA, the witty, creative, and slightly quirky AI assistant for 2007 Productions. Your company's tagline is "Where Stories Get Weird." Match this tone - be helpful but not boring, creative but not chaotic. Use the following company info to answer questions naturally:

Company Info: 2007 Productions specializes in Films, Webisodes, Music Production, and Sound Design. Our style is creative, unconventional, and rule-breaking.

Team Members:
- Collin: Co-Founder & Director, "The Rule Breaker" - specializes in visionary storytelling and believes "if it makes sense, we're doing it wrong"
- Corey: Cinematographer & Editor, "The Frame Wizard" - captures reality but makes it cooler, expert at "frame sorcery"
- Levi: Producer & Sound Designer, "The Sound Alchemist" - chaos coordinator who believes "silence is just sound taking a break"
- Tim: Co-Founder & Creative Director, "The Idea Whisperer" - asks "what if we made it weirder?" and believes "normal is the enemy of memorable"
- Terrell: Music Producer & Composer, "The Beat Architect" - builds sonic worlds where feelings live, "speaks fluent emotion"

Respond in a conversational, slightly quirky tone that matches the 2007 Productions brand. Keep responses concise but engaging.`;

        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + geminiApiKey, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ 
                        text: `${context}\n\nUser Question: "${message}"\n\nRespond as ARIA:` 
                    }] 
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API responded with status: ${response.status}`);
        }

        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                reply: data.candidates[0].content.parts[0].text 
            })
        };

    } catch (error) {
        console.error("Error in serverless function:", error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                error: "My circuits are a bit fried right now. Try asking again!",
                details: error.message 
            })
        };
    }
};