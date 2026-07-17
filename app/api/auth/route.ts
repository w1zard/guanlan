import { clearSessionCookie, createSessionCookie, hasPasswordSession, passwordIsConfigured, verifyPassword } from "../../lib/password-auth";

export async function GET(request: Request) {
  return Response.json({ authenticated:await hasPasswordSession(request), configured:passwordIsConfigured() });
}

export async function POST(request: Request) {
  try {
    if (!passwordIsConfigured()) return Response.json({ error:"Password authentication is not configured" }, { status:503 });
    const body = await request.json() as { password?: string };
    if (!body.password || !(await verifyPassword(body.password))) return Response.json({ error:"Invalid password" }, { status:401 });
    return Response.json({ authenticated:true }, { headers:{ "set-cookie":await createSessionCookie(request), "cache-control":"no-store" } });
  } catch (error) {
    return Response.json({ error:error instanceof Error ? error.message : "Unable to sign in" }, { status:500 });
  }
}

export async function DELETE(request: Request) {
  return Response.json({ authenticated:false }, { headers:{ "set-cookie":clearSessionCookie(request), "cache-control":"no-store" } });
}
