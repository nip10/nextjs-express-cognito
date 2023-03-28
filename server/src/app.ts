import * as dotenv from "dotenv";
dotenv.config();
import express, { type Request, type Response } from "express";
import CognitoExpress from "cognito-express";

const { COGNITO_REGION, COGNITO_USER_POOL_ID } = process.env;

const app = express();

const cognitoExpress = new CognitoExpress({
  region: COGNITO_REGION,
  cognitoUserPoolId: COGNITO_USER_POOL_ID,
  tokenUse: "access", //Possible Values: access | id
  tokenExpiration: 3600000, //Up to default expiration of 1 hour (3600000 ms)
});

app.get("/", (req: Request, res: Response) => {
  return res.json({
    data: "Hello world",
  });
});

app.get("/restricted", async (req: Request, res: Response) => {
  const accessTokenFromClient = req.headers.accesstoken;
  if (!accessTokenFromClient) {
    return res.status(401).json({ error: "Access Token missing from header" });
  }
  const response = await cognitoExpress.validate(accessTokenFromClient);
  return res.json({
    cognitoResponse: response,
  });
});

app.listen(3001, () => {
  console.log("Example app listening on port 3001");
});
