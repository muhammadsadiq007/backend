import jwt from "jsonwebtoken";

export const permissionCheck = (requiredPermission) => (req, res, next) => {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_KEY);

      const user = decoded;
    if (!user || user.permissions[requiredPermission] !== 1)
    {
        return res.status(403).json({status : false, error: "You are Authorized for this action"})
    }
    next()
  };