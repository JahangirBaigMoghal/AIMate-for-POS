export async function GET() {
  return Response.json({
    ok: true,
    service: "dashboard",
    time: new Date().toISOString()
  });
}
