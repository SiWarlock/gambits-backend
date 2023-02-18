const jwt = require("jsonwebtoken");

exports.validateHeader = (req) => {
  const token = req.headers["x-access-token"];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.wallet = decoded;
      return req;
    } catch (err) {
      return null;
    }
  }
  return null;
};
