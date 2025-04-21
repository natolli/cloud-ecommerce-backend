const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({ region: "us-east-1" });

exports.handler = async (event) => {
  try {
    const search = event.queryStringParameters?.search;
    const params = { TableName: "Products" };
    const data = await client.send(new ScanCommand(params));

    const items = (data.Items || []).map((item) => ({
      productId: item.productId.S,
      name: item.name.S,
      price: item.price.N,
      category: item.category.S,
      image: item.image?.S || null, // ✅ Now includes image
    }));

    const filtered = search
      ? items.filter((item) =>
          item.name.toLowerCase().includes(search.toLowerCase())
        )
      : items;

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(filtered),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
