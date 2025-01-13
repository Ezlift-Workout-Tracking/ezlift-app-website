// Email validation regex - same as frontend for consistency
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL || "https://discord.com/api/webhooks/1323013440322670592/Ou2iS_tN_ugBwc4ZFlL6cQRHavl-UfJkcZuKCpVSeDQs3QawAeT-ZvoIeQD2M55hRWpG";

  try {
    const { email } = JSON.parse(event.body);

    // Validate email
    if (!email || typeof email !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email is required" })
      };
    }

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
            { name: "Email", value: trimmedEmail }
          ],
          color: 5814783,
          timestamp: new Date().toISOString()
        }]
      }),
    });

    if (!response.ok) {
      throw new Error('Discord webhook failed');
    }

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