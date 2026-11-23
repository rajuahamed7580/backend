const sendResponse = (res, data) => {
  const statusCode = data.statusCode || 200;
  const responsePayload = {
    success: data.success !== undefined ? data.success : true,
    message: data.message || 'Successfully completed',
    meta: data.meta,
    data: data.data !== undefined ? data.data : null
  };

  if (!responsePayload.meta) {
    delete responsePayload.meta;
  }

  return res.status(statusCode).json(responsePayload);
};

export default sendResponse;
