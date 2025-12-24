const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "onboarding@resend.dev",
      to: options.email,
      subject: options.subject,
      html: options.html || options.message.replace(/\n/g, "<br>"), // Convert text newlines to breaks for HTML view or use text field
      text: options.message,
    });

    if (error) {
      console.error("Resend Error:", error);
      throw new Error(error.message);
    }

    console.log("Email sent successfully:", data.id);
  } catch (error) {
    console.error("Email send failed:", error);
    throw error;
  }
};

module.exports = sendEmail;
