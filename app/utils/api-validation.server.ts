import { json } from "@remix-run/node";
import { requireAuth } from "./auth.server";

export async function secureApiAction(
  request: Request,
  handler: (request: Request) => Promise<Response>
) {
  try {
    // Require authentication
    await requireAuth(request);
    
    // Validate request method
    if (!['GET', 'POST', 'PUT', 'DELETE'].includes(request.method)) {
      return json({ error: "Method not allowed" }, { status: 405 });
    }
    
    // Rate limiting check (basic implementation)
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    // TODO: Implement proper rate limiting with Redis/database
    
    return await handler(request);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    return json({ error: "Unauthorized" }, { status: 401 });
  }
}

export function validateDeleteAction(body: any, allowedActions: string[]) {
  if (!body || typeof body.action !== 'string') {
    return { valid: false, error: "Invalid request body" };
  }
  
  if (!allowedActions.includes(body.action)) {
    return { valid: false, error: "Invalid action" };
  }
  
  // Check for additional malicious fields
  const allowedKeys = ['action'];
  const bodyKeys = Object.keys(body);
  const extraKeys = bodyKeys.filter(key => !allowedKeys.includes(key));
  
  if (extraKeys.length > 0) {
    return { valid: false, error: "Invalid request format" };
  }
  
  return { valid: true };
}
