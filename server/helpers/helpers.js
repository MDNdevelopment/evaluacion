import { verify } from "jsonwebtoken";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SECRET_KEY;

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const withAuth =
  (...data) =>
  async (config) => {
    const token = config.headers.Authrization?.split(" ")[1];

    //Verifies access token if present
    const verified = token ? await verifyToken(token) : false;

    //Returns 403 if token is invalid and auth is enabled
    if (process.env.USE_AUTH && !verified) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: "Unauthorized" }),
      };
    }

    //Calls the original mock function
    return typeof data[0] === "function" ? data[0](config) : data;
  };

export const verifyToken = async (token, options = undefined) => {
  try {
    const verification = jwt.verify(token, process.env.JWT_SECRET);
    return options?.returnPayload ? verification.payload : true;
  } catch {
    return false;
  }
};
