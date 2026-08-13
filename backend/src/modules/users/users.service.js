const prisma = require("../../config/db");

async function getOrCreateProfile(authUserId, fullName = null) {
  if (!authUserId) {
    const error = new Error("Authenticated user id is missing from the token");
    error.status = 401;
    throw error;
  }

  return prisma.userProfile.upsert({
    where: { authUserId },
    create: { authUserId, fullName },
    update: fullName ? { fullName } : {},
  });
}

async function getProfile(authUserId) {
  return prisma.userProfile.findUnique({
    where: {
      authUserId,
    },
  });
}

module.exports = {
  getOrCreateProfile,
  getProfile,
}; 
