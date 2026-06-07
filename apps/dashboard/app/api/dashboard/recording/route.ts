import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const recordingUrl = searchParams.get("url");

  if (!recordingUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    return NextResponse.json({ error: "Twilio credentials not configured on server" }, { status: 500 });
  }

  try {
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    
    const res = await fetch(recordingUrl, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`
      },
      redirect: "manual"
    });

    if (res.status >= 300 && res.status < 400) {
      const redirectUrl = res.headers.get("location");
      if (redirectUrl) {
        return NextResponse.json({ url: redirectUrl });
      }
    }

    let errorMessage = `Twilio returned status ${res.status}: ${res.statusText || "No redirect found"}`;
    try {
      const responseText = await res.text();
      if (responseText) {
        errorMessage += ` - ${responseText.substring(0, 150)}`;
      }
    } catch (_) {}

    return NextResponse.json({ error: errorMessage }, { status: res.status >= 400 && res.status < 600 ? res.status : 500 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
