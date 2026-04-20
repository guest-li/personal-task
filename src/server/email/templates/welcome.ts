export function welcomeEmailHtml(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1a365d;">Welcome to Education Consultancy!</h1>
  <p>Hi ${escapeHtml(name)},</p>
  <p>Thank you for creating your account. You can now:</p>
  <ul>
    <li>Browse universities and programs</li>
    <li>Save your favorites</li>
    <li>Book a free consultation</li>
  </ul>
  <p>If you have any questions, feel free to reach out to our team.</p>
  <p>Best regards,<br>Education Consultancy Team</p>
</body>
</html>`.trim();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
