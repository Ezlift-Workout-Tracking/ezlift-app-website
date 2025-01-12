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

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email is required" })
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
            { name: "Email", value: email }
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