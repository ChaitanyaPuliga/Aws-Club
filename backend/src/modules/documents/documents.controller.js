const documentsService = require("./documents.service");

async function listDocuments(req, res, next) {
  try {
    const documents =
      await documentsService.listDocuments();

    res.json({
      success: true,
      documents,
    });
  } catch (error) {
    next(error);
  }
}

async function getDocument(req, res, next) {
  try {
    const document =
      await documentsService.getDocument(
        req.params.id
      );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.json({
      success: true,
      document,
    });
  } catch (error) {
    next(error);
  }
}

async function publishDocument(
  req,
  res,
  next
) {
  try {
    const {
      title,
      fileName,
      description,
      content,
    } = req.body;

    const document =
      await documentsService.publishDocument({
        title,
        fileName,
        description,
        content,
      });

    res.status(201).json({
      success: true,
      message:
        "Document published and indexed successfully",
      document,
    });
  } catch (error) {
    next(error);
  }
}

async function updateDocument(
  req,
  res,
  next
) {
  try {
    const {
      title,
      fileName,
      description,
      content,
    } = req.body;

    const document =
      await documentsService.updateDocument(
        req.params.id,
        {
          title,
          fileName,
          description,
          content,
        }
      );

    res.json({
      success: true,
      message:
        "Document updated and re-indexed successfully",
      document,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listDocuments,
  getDocument,
  publishDocument,
  updateDocument,
};