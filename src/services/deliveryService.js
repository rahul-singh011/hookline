import axios from "axios";
import crypto from "crypto";

const signPayload = (payload, signingSecret) => {
  const payloadString = JSON.stringify(payload);

  const signature = crypto
    .createHmac("sha256", signingSecret)
    .update(payloadString)
    .digest("hex");

  return `sha256=${signature}`;
};

const deliverWebHook = async ({
  endpointUrl,
  payload,
  eventType,
  eventId,
  deliveryId,
  signingSecret,
}) => {
  const startTime = Date.now();

  const signature = signPayload(payload, signingSecret);

  try {
    const response = await axios.post(endpointUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        "X-HookLine-Signature": signature,
        "X-HookLine-Event": eventType,
        "X-HookLine-Event-Id": eventId,
        "X-HookLine-Delivery-Id": deliveryId,
        "User-Agent": "HookLine-Delivery/1.0",
      },
      timeout: 10000,
      validateStatus: () => true,
    });

    const duration = Date.now() - startTime;

    const success = response.status >= 200 && response.status < 300;

    return {
      success,
      statusCode: response.status,
      duration,
      responseBody: response.data
        ? JSON.stringify(response.data).substring(0, 500)
        : null,
      errorMessage: null,
    };
  } catch (err) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      statusCode: null,
      duration,
      responseBody: null,
      errorMessage: err.message,
    };
  }
};

export { deliverWebHook, signPayload };
