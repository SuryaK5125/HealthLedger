// Copies only the named fields from a request body. Anything the client sends
// that is not on the list is dropped, so fields like userId or profileId cannot
// be injected through the request body (mass assignment).
function pick(source, allowedFields) {
  const result = {};
  for (const field of allowedFields) {
    if (source[field] !== undefined) {
      result[field] = source[field];
    }
  }
  return result;
}

module.exports = { pick };
