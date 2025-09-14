import { jwtVerify } from "@/lib/jwt";

export interface PayloadRequest extends Request {
  payload?: Record<string, any>;
}

type Handler = (req: PayloadRequest, context?: any) => Promise<Response>;

export function withAuth(handler: Handler): Handler {
  return async (req: Request, context) => {
    console.warn(JSON.stringify(req.headers.keys()))
    console.warn(JSON.stringify(req.headers.values()))
    const authHeader = req.headers.get("Authorization");
    console.warn(`${req.url} - authHeader1: ${authHeader}`);
    console.warn(`${req.url} - JWT_SECRET_KEY: ${process.env.JWT_SECRET_KEY}`)
    console.warn(`${req.url} - JWT_ISSUER: ${process.env.JWT_ISSUER}`)
    console.warn(`${req.url} - JWT_AUDIENCE: ${process.env.JWT_AUDIENCE}`)
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.warn(`${req.url} - authHeader2: ${authHeader}`);
    const token = authHeader.split(" ")[1];
    const { payload, error } = await jwtVerify(token);
    if (!payload) {
      return new Response(JSON.stringify({ error: error }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    // If authenticated, call the original handler
    return handler({ ...req, payload } as PayloadRequest, context);
  };
}
