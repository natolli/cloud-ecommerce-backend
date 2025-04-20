const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({ region: "us-east-1" });

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { userId, productId, name, price, quantity } = body;

    if (!userId || !productId || !name || !price || !quantity) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing fields in request body" }),
      };
    }

    const params = {
      TableName: "Cart",
      Item: {
        userId: { S: userId },
        productId: { S: productId },
        name: { S: name },
        price: { N: price.toString() },
        quantity: { N: quantity.toString() },
      },
    };

    await client.send(new PutItemCommand(params));

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Item added to cart" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
