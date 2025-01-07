export const errorHandler = (error, functionName) => {
  console.error(`❌ Error in ${functionName}:`, error.message);
  console.error(error);
};

export const buildResponse = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
