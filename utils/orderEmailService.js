const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOrderEmail = async (options) => {
  const {
    email,
    userName,
    orderId,
    products,
    totalAmount,
    shippingAddress,
    paymentMethod,
    type = "confirmation",
  } = options;

  const isDelivered = type === "delivered";
  const subject = isDelivered
    ? `Order Delivered! #${orderId}`
    : `Order Confirmation #${orderId}`;

  const title = isDelivered ? "Order Delivered" : "Order Confirmed";
  const message = isDelivered
    ? "Your order has been successfully delivered. We hope you enjoy your purchase!"
    : "Thank you for your purchase. We're getting your order ready to be shipped.";

  // Formatting currency
  const formatPrice = (amount) => `$${Number(amount).toFixed(2)}`;

  // Premium HTML Template
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; color: #18181b; }
            .container { max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #e4e4e7; overflow: hidden; }
            .header { background: #000000; color: #ffffff; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; letter-spacing: 0.1em; text-transform: uppercase; }
            .content { padding: 40px; }
            .order-info { margin-bottom: 30px; border-bottom: 1px solid #e4e4e7; padding-bottom: 20px; }
            .order-id { font-size: 14px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 5px; }
            .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; margin-top: 30px; }
            .item-list { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .item-list th { text-align: left; padding: 10px 0; border-bottom: 1px solid #e4e4e7; font-size: 12px; text-transform: uppercase; color: #71717a; }
            .item-list td { padding: 15px 0; border-bottom: 1px solid #e4e4e7; font-size: 14px; }
            .total-section { text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .detail-box p { margin: 5px 0; font-size: 14px; color: #52525b; line-height: 1.5; }
            .detail-box strong { display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #18181b; margin-bottom: 8px; }
            .footer { background: #f4f4f5; color: #71717a; padding: 20px; text-align: center; font-size: 12px; }
            .btn { display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${title}</h1>
            </div>
            <div class="content">
                <p>Hi ${userName},</p>
                <p>${message}</p>
                
                <div class="order-info">
                    <p class="order-id">Order #${orderId}</p>
                    <p style="font-size: 14px; color: #71717a; margin: 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>

                <div class="details-grid">
                    <div class="detail-box">
                        <strong>Shipping Address</strong>
                        <p>
                            ${
                              shippingAddress
                                ? `${shippingAddress.street || ""}<br>
                            ${shippingAddress.city || ""}, ${
                                    shippingAddress.state || ""
                                  } ${shippingAddress.zipCode || ""}<br>
                            ${shippingAddress.country || ""}`
                                : "Address not provided"
                            }
                        </p>
                    </div>
                    <div class="detail-box">
                        <strong>Payment Details</strong>
                        <p>
                            Method: ${paymentMethod || "Online"}<br>
                            Status: ${isDelivered ? "Paid" : "Processed"}
                        </p>
                    </div>
                </div>

                <div class="section-title">Order Items</div>
                <table class="item-list">
                    <thead>
                        <tr>
                            <th width="60%">Item</th>
                            <th width="20%">Qty</th>
                            <th width="20%" style="text-align: right;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products
                          .map(
                            (item) => `
                            <tr>
                                <td>${
                                  item.product ? item.product.name : "Product"
                                }</td>
                                <td>${item.quantity}</td>
                                <td style="text-align: right;">${formatPrice(
                                  item.quantity *
                                    (item.product ? item.product.price : 0)
                                )}</td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>

                <div class="total-section">
                    Total: ${formatPrice(totalAmount)}
                </div>

                <div style="text-align: center;">
                    <a href="${
                      process.env.CLIENT_URL || "http://localhost:5173"
                    }/orders/${orderId}" class="btn">View Order Details</a>
                </div>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Soko. All rights reserved.</p>
                <p>If you have any questions, reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "onboarding@resend.dev",
      to: email, // In test mode, this must match the verified definition
      subject: subject,
      html: htmlTemplate,
    });

    if (error) {
      console.error("Resend Error:", error);
    } else {
      console.log(`Order Email (${type}) sent:`, data.id);
    }
  } catch (err) {
    console.error("Resend Exception:", err);
  }
};

module.exports = sendOrderEmail;
