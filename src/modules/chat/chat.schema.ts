export const chatHistorySchema = {
    params: {
        type: "object",
        properties: {
            orderId: { type: "string", format: "uuid" }
        },
        required: ["orderId"]
    }
};