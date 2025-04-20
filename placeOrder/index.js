import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({ region: "us-east-1" });

export const handler = async (event) => {
  try {
    const claims = event.requestContext.authorizer.claims;
    const userId = claims.sub;

    const body = JSON.parse(event.body);
    const { items, totalAmount } = body;

    if (!items || !Array.isArray(items) || !totalAmount) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing order data" }),
      };
    }

    const orderId = uuidv4();

    const params = {
      TableName: "Orders",
      Item: {
        orderId: { S: orderId },
        userId: { S: userId },
        items: { S: JSON.stringify(items) },
        totalAmount: { N: totalAmount.toString() },
        createdAt: { S: new Date().toISOString() },
      },
    };

    await client.send(new PutItemCommand(params));

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Order placed", orderId }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
