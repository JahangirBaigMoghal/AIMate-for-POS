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

    const redirectUrl = res.headers.get("location");
    if (redirectUrl) {
      return NextResponse.json({ url: redirectUrl });
    }

    return NextResponse.json({ url: recordingUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
