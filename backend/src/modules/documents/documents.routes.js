const express = require("express");

const documentsController = require("./documents.controller");
const authMiddleware = require("../../middleware/auth");

const router = express.Router();

/*
 * Member document library
 *
 * GET /api/documents
 */
router.get(
  "/",
  documentsController.listDocuments
);

/*
 * ADMIN: publish a new document
 *
 * POST /api/documents/admin/publish
 */
router.post(
  "/admin/publish",
  authMiddleware,
  authMiddleware.requireAdmin,
  documentsController.publishDocument
);

/*
 * ADMIN: update an existing document
 *
 * PUT /api/documents/admin/:id
 */
router.put(
  "/admin/:id",
  authMiddleware,
  authMiddleware.requireAdmin,
  documentsController.updateDocument
);

/*
 * GET /api/documents/:id
 *
 * Must remain AFTER the /admin routes.
 */
router.get(
  "/:id",
  documentsController.getDocument
);

module.exports = router;