const usersService = require("./users.service");

async function getMyProfile(req, res, next) {
  try {
    const profile = await usersService.getOrCreateProfile(
      req.user.id,
      req.user.name || req.user.email || null
    );

    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyProfile,
};
