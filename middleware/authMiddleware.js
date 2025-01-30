import jwt from "jsonwebtoken";
import User from "../models/User.js";
 
const verifyUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

     if(!token) {
      return res.status(404).json({ success: false, error: "Token Not Found" });
    }
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    if (!decoded) { 
      return res.status(404).json({ success: false, error: "Token Not Valid" });
    }

    const user = await User.findById({ _id: decoded._id }).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, error: "User Not Found" });
    }

    if(user) {
    req.user = user;
    return next();
    }
  } catch (error) {
    return res.status(401).json({ success: false, error: "AuthMiddleware Server Error" });

  }
};

export default verifyUser;
