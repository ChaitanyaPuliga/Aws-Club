const {
  createRemoteJWKSet,
  jwtVerify,
} = require("jose");
const dns = require("node:dns");

const jwksUrl = process.env.NEON_AUTH_JWKS_URL;

if (!jwksUrl) {
  throw new Error(
    "NEON_AUTH_JWKS_URL is missing from backend .env"
  );
}

/*
 * Prefer IPv4 for Node's outbound JWKS request.
 *
 * Your machine can reach the Neon endpoint with curl over both
 * IPv4 and IPv6, but the earlier Node fetch was timing out on
 * the NAT64 IPv6 address.
 */
const ipv4Fetch = async (url, options) => {
  const originalLookup = dns.lookup;

  dns.lookup = function patchedLookup(
    hostname,
    opts,
    callback
  ) {
    if (typeof opts === "function") {
      return originalLookup(
        hostname,
        {
          family: 4,
          all: false,
        },
        opts
      );
    }

    return originalLookup(
      hostname,
      {
        ...opts,
        family: 4,
        all: false,
      },
      callback
    );
  };

  try {
    return await fetch(url, options);
  } finally {
    dns.lookup = originalLookup;
  }
};

const JWKS = createRemoteJWKSet(
  new URL(jwksUrl),
  {
    customFetch: ipv4Fetch,
    timeoutDuration: 15000,
    cooldownDuration: 30000,
    cacheMaxAge: 600000,
  }
);

async function authMiddleware(req, res, next) {
  try {
    const authorization =
      req.headers.authorization || "";

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authorization
      .slice("Bearer ".length)
      .trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { payload } =
      await jwtVerify(token, JWKS);

    if (!payload.sub) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token",
      });
    }

    req.user = {
      id: String(payload.sub),

      email:
        typeof payload.email === "string"
          ? payload.email
          : null,

      name:
        typeof payload.name === "string"
          ? payload.name
          : null,
    };

    next();
  } catch (error) {
    console.error(
      "Auth error:",
      error
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired authentication token",
    });
  }
}


const prisma = require("../config/db");

async function requireAdmin(
  req,
  res,
  next
) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const profile =
      await prisma.userProfile.findUnique({
        where: {
          authUserId: req.user.id,
        },
        select: {
          id: true,
          role: true,
          fullName: true,
        },
      });

    if (!profile) {
      return res.status(403).json({
        success: false,
        message:
          "Application profile not found",
      });
    }

    if (profile.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    req.profile = profile;

    next();
  } catch (error) {
    console.error(
      "Admin authorization error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify administrator access",
    });
  }
}

authMiddleware.requireAdmin = requireAdmin;

module.exports = authMiddleware;