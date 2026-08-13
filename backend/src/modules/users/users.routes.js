const express = require("express");
const usersController = require("./users.controller");
const authMiddleware = require("../../middleware/auth");

const router = express.Router();

router.get("/me", authMiddleware, usersController.getMyProfile);

module.exports = router;