// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const HCAPTCHA_SECRET_KEY = process.env.HCAPTCHA_SECRET_KEY || "ES_675ab5673ef14986bd44e2f51129eade";
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL || "https://discord.com/api/webhooks/1323013440322670592/Ou2iS_tN_ugBwc4ZFlL6cQRHavl-UfJkcZuKCpVSeDQs3QawAeT-ZvoIeQD2M55hRWpG";

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
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const { email, captchaToken, metadata } = JSON.parse(event.body);

    // Validate required fields
    if (!email || !captchaToken) {
      console.error('Missing required fields:', { email, hasToken: !!captchaToken });
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" })
      };
    }

    // Validate email format
    const trimmedEmail = email.trim();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid email format" })
      };
    }

    // Additional validation for maximum length
    if (trimmedEmail.length > 254) { // RFC 5321
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email address is too long" })
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
    const response = await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: "New Android Waitlist Signup",
        embeds: [{
          title: "Android Waitlist Entry",
          fields: [
            { name: "Email", value: trimmedEmail },
            { name: "Timestamp", value: metadata.timestamp },
            { name: "User Agent", value: metadata.userAgent },
            { name: "Timezone", value: metadata.timezone },
            { name: "Screen Resolution", value: metadata.screenResolution }
          ],
          color: 5814783,
          timestamp: new Date().toISOString()
        }]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord webhook failed:', errorText);
      throw new Error('Discord webhook failed');
    }

    console.log('Waitlist submission successful');
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Successfully joined waitlist" })
    };

  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to join waitlist" })
    };
  }
};