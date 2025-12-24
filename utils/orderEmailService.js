const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOrderEmail = async (options) => {
    // Premium HTML Template
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; color: #18181b; }
            .container { max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 0px; overflow: hidden; }
            .header { background: #000000; color: #ffffff; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; letter-spacing: 0.1em; text-transform: uppercase; }
            .content { padding: 40px; }
            .order-info { margin-bottom: 30px; border-bottom: 1px solid #e4e4e7; padding-bottom: 20px; }
            .order-id { font-size: 14px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; }
            .item-list { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .item-list th { text-align: left; padding: 10px 0; border-bottom: 2px solid #000; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; }
            .item-list td { padding: 15px 0; border-bottom: 1px solid #e4e4e7; font-size: 14px; }
            .total-section { text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold; }
            .footer { background: #f4f4f5; color: #71717a; padding: 20px; text-align: center; font-size: 12px; }
            .btn { display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Order Confirmed</h1>
            </div>
            <div class="content">
                <p>Hi ${options.userName},</p>
                <p>Thank you for your purchase. We're getting your order ready to be shipped.</p>
                
                <div class="order-info">
                    <p class="order-id">Order #${options.orderId}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>

                <table class="item-list">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${options.products.map(item => `
                            <tr>
                                <td>${item.product ? item.product.name : 'Product'}</td>
                                <td>${item.quantity}</td>
                                <td>$${(item.quantity * (item.product ? item.product.price : 0)).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="total-section">
                    Total: $${options.totalAmount.toFixed(2)}
                </div>

                <div style="text-align: center;">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/orders/${options.orderId}" class="btn">View Order</a>
                </div>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} VendorVerse. All rights reserved.</p>
                <p>If you have any questions, reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        const { data, error } = await resend.emails.send({
            from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
            to: options.email,
            subject: `Order Confirmation #${options.orderId}`,
            html: htmlTemplate
        });

        if (error) {
            console.error('Resend Error:', error);
            // Don't throw here to avoid failing order implementation, just log
        } else {
            console.log('Order Email sent:', data.id);
        }
    } catch (err) {
        console.error('Resend Exception:', err);
    }
};

module.exports = sendOrderEmail;
