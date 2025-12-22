import http from "../../../../api/http";

export const executeStepApi = async (
  endpoint: string,
  payload: any
) => {
  const res = await http.post(endpoint, payload);
  return res.data;
};
