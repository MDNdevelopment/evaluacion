import axios from "axios";
import { useTokenStore } from "../stores/useTokenStore";

export const checkPrivileges = async () => {
  const token = useTokenStore.getState().token;
  try {
    const data = await axios({
      // withCredentials: true,
      method: "get",
      url: "https://mdn-evaluacion.onrender.com/api/privileges",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => {
      return res.data.privilege;
    });
    return data;
  } catch (e) {
    console.log({ errorGetPrivileges: e });
    return 1;
  }
};
