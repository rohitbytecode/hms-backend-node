import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

export const sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"HMS Team" <${process.env.GMAIL_EMAIL}>`,
    to: email,
    replyTo: process.env.GMAIL_EMAIL,
    subject: 'Your One-Time Password (OTP) – Secure Verification',

    text: `Your OTP is ${otp}. It is valid for 5 minutes. Do not share this code with anyone.`,

    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          
          <h2 style="color: #333333; margin-bottom: 10px;">Verification Required</h2>
          
          <p style="color: #555555; font-size: 14px; line-height: 1.6;">
            Dear User,
          </p>
          
          <p style="color: #555555; font-size: 14px; line-height: 1.6;">
            We received a request to verify your identity. Please use the One-Time Password (OTP) below to proceed:
          </p>
          
          <div style="text-align: center; margin: 25px 0;">
            <span style="display: inline-block; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #1a73e8; background-color: #f1f3f4; padding: 12px 24px; border-radius: 6px;">
              ${otp}
            </span>
          </div>
          
          <p style="color: #555555; font-size: 14px; line-height: 1.6;">
            This OTP is valid for <strong>5 minutes</strong>. 
            For security reasons, please do not share this code with anyone.
          </p>
          
          <p style="color: #555555; font-size: 14px; line-height: 1.6;">
            If you did not request this verification, you may safely ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;" />
          
          <p style="color: #888888; font-size: 12px; line-height: 1.5;">
            This is an automated message. Please do not reply to this email.
          </p>
          
          <p style="color: #888888; font-size: 12px;">
            © ${new Date().getFullYear()} HMS Team. All rights reserved.
          </p>
          
        </div>
      </div>
    `
  });
};

export const sendPortalCredentials = async (email, name, password) => {
  await transporter.sendMail({
    from: `"HMS Team" <${process.env.GMAIL_EMAIL}>`,
    to: email,
    subject: 'Your HMS Patient Portal Account Details',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome to HMS, ${name}!</h2>
        <p>Your patient portal account has been created successfully.</p>
        <p><strong>Username/Email:</strong> ${email}</p>
        <p><strong>Temporary Password:</strong> ${password}</p>
        <p style="color: #555;">Please log in to the portal and change your password for security.</p>
        <hr />
        <p style="font-size: 12px; color: #888;">© ${new Date().getFullYear()} HMS Team.</p>
      </div>
    `
  });
};