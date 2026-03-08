// ============================================================
// IP ADDRESS HELPER
// Extracts client IP address from Next.js request
// ============================================================

/**
 * Get client IP address from request
 * Handles various proxy headers (X-Forwarded-For, X-Real-IP, etc.)
 * 
 * @param {Request} request - Next.js request object
 * @returns {string} - Client IP address or 'unknown'
 */
export function getClientIP(request) {
  try {
    // Check various headers (in order of priority)
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) {
      // X-Forwarded-For can contain multiple IPs, take the first one
      const ips = forwardedFor.split(",").map((ip) => ip.trim());
      return ips[0] || "unknown";
    }

    const realIP = request.headers.get("x-real-ip");
    if (realIP) {
      return realIP.trim();
    }

    const cfConnectingIP = request.headers.get("cf-connecting-ip"); // Cloudflare
    if (cfConnectingIP) {
      return cfConnectingIP.trim();
    }

    // Fallback: try to get from request URL or connection
    const remoteAddress = request.headers.get("x-remote-address");
    if (remoteAddress) {
      return remoteAddress.trim();
    }

    // If deployed on Vercel, check Vercel-specific headers
    const vercelIP = request.headers.get("x-vercel-forwarded-for");
    if (vercelIP) {
      const ips = vercelIP.split(",").map((ip) => ip.trim());
      return ips[0] || "unknown";
    }

    return "unknown";
  } catch (error) {
    console.error("Error extracting IP address:", error);
    return "unknown";
  }
}
