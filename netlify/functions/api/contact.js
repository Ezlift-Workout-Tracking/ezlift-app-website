import { NextResponse } from "next/server";

const HCAPTCHA_SECRET_KEY = process.env.HCAPTCHA_SECRET_KEY || "ES_675ab5673ef14986bd44e2f51129eade";
const DISCORD_WEBHOOK =  "https://discord.com/api/webhooks/1327635232895012944/qwPrrrUMEF2CdwskrOE-TK3Qe96oVlA0RLt6vIoKiF-qa-cgoH8Ix6qQAzgEttWZ7K67";

async function verifyHCaptcha(token: string): Promise<boolean> {
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

export async function POST(req: Request) {
  try {
    // Log the incoming request
    console.log('Received contact form submission');
    
    // Parse the request body
    const body = await req.json();
    const { name, email, message, captchaToken } = body;
    
    // Validate required fields
    if (!name || !email || !message || !captchaToken) {
      console.error('Missing required fields:', { name, email, message, hasToken: !!captchaToken });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify hCaptcha
    const isValid = await verifyHCaptcha(captchaToken);
    if (!isValid) {
      console.error('Captcha validation failed');
      return NextResponse.json(
        { error: "Captcha validation failed" },
        { status: 400 }
      );
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
    return NextResponse.json({ 
      message: "Form submitted successfully",
      status: "success" 
    });

  } catch (error) {
    // Log the full error details
    console.error('Error processing form submission:', error);
    
    // Return a more detailed error response
    return NextResponse.json(
      { 
        error: "Internal Server Error",
        message: (error instanceof Error) ? error.message : 'Unknown error',
        details: (error instanceof Error && process.env.NODE_ENV === 'development') ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}