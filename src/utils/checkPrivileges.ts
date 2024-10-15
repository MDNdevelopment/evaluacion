import Cookies from "js-cookie";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  id: string;
}

export const checkPrivileges = async () => {
  const token = Cookies.get("auth-token");
  let decodedToken: DecodedToken;
  if (token) {
    decodedToken = jwtDecode(token);
  } else {
    throw new Error("Token is undefined");
  }

  const userId = decodedToken.id;

  if (decodedToken) {
    try {
      const fetchedPrivileges = await axios({
        method: "get",
        url: "http://localhost:5500/api/privileges",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          uuid: userId,
        },
      }).then((res) => {
        console.log({ result: res.data });
        return res.data;
      });
    } catch (e) {
      console.log(e);
      return 1;
    }
  }

  return 1;
};
