// netlify/functions/contact.js
const HCAPTCHA_SECRET_KEY = process.env.HCAPTCHA_SECRET_KEY || "ES_675ab5673ef14986bd44e2f51129eade";
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1327635232895012944/qwPrrrUMEF2CdwskrOE-TK3Qe96oVlA0RLt6vIoKiF-qa-cgoH8Ix6qQAzgEttWZ7K67";

async function verifyHCaptcha(token) {
  try {
    console.log('Verifying hCaptcha token...');
    const response = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        secret: HCAPTCHA_SECRET_KEY,
        response: token,
      }).toString(),
    });

    if (!response.ok) {
      console.error('hCaptcha verification failed:', await response.text());
      return false;
    }

    const data = await response.json();
    console.log('hCaptcha verification result:', data);
    return data.success === true;
  } catch (error) {
    console.error('Error during hCaptcha verification:', error);
    return false;
  }
}

exports.handler = async function(event, context) {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    // Parse the request body
    const body = JSON.parse(event.body);
    const { name, email, message, captchaToken } = body;
    
    // Validate required fields
    if (!name || !email || !message || !captchaToken) {
      console.error('Missing required fields:', { name, email, message, hasToken: !!captchaToken });
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" })
      };
    }

    // Verify hCaptcha
    const isValid = await verifyHCaptcha(captchaToken);
    if (!isValid) {
      console.error('Captcha validation failed');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Captcha validation failed" })
      };
    }

    // Send to Discord
    console.log('Sending to Discord webhook...');
    const discordResponse = await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: "New Contact Form Submission",
        embeds: [
          {
            title: "Contact Form Details",
            fields: [
              { name: "Name", value: name, inline: true },
              { name: "Email", value: email, inline: true },
              { name: "Message", value: message },
            ],
            color: 5814783,
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      console.error('Discord webhook failed:', errorText);
      throw new Error(`Failed to send to Discord: ${errorText}`);
    }

    console.log('Form submission successful');
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: "Form submitted successfully",
        status: "success" 
      })
    };

  } catch (error) {
    console.error('Error processing form submission:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Internal Server Error",
        message: error.message
      })
    };
  }
};