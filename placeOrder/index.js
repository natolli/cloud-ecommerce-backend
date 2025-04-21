const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { v4: uuidv4 } = require("uuid");

const client = new DynamoDBClient({ region: "us-east-1" });

exports.handler = async (event) => {
  try {
    // Optional: handle OPTIONS preflight (CORS)
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
        },
        body: "",
      };
    }

    const claims = event.requestContext.authorizer.claims;
    const userId = claims.sub;

    const body = JSON.parse(event.body);
    const { items, totalAmount } = body;

    if (!items || !Array.isArray(items) || !totalAmount) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
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
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Order placed", orderId }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
