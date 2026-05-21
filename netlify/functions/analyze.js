const https = require("https");

exports.handler = async function (event) {
    if (event.httpMethod !== "POST") {
          return { statusCode: 405, body: "Method Not Allowed" };
    }

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    if (!ANTHROPIC_API_KEY) {
          return { statusCode: 500, body: JSON.stringify({ error: "API key not configured" }) };
    }

    let body;
    try {
          body = JSON.parse(event.body);
    } catch (e) {
          return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
    }

    const payload = JSON.stringify(body);

    const options = {
          hostname: "api.anthropic.com",
          path: "/v1/messages",
          method: "POST",
          headers: {
                  "Content-Type": "application/json",
                  "x-api-key": ANTHROPIC_API_KEY,
                  "anthropic-version": "2023-06-01",
                  "Content-Length": Buffer.byteLength(payload),
          },
    };

    return new Promise((resolve) => {
          const req = https.request(options, (res) => {
                  let data = "";
                  res.on("data", (chunk) => { data += chunk; });
                  res.on("end", () => {
                            resolve({
                                        statusCode: res.statusCode,
                                        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                                        body: data,
                            });
                  });
          });
          req.on("error", (e) => {
                  resolve({ statusCode: 500, body: JSON.stringify({ error: e.message }) });
          });
          req.write(payload);
          req.end();
    });
};
