package email

import (
	"fmt"
	"net/smtp"

	"github.com/stokku-ai/backend/internal/config"
)

// SMTPMailer handles sending emails via SMTP (Gmail).
type SMTPMailer struct {
	cfg config.SMTPConfig
}

// NewSMTPMailer creates a new SMTPMailer instance.
func NewSMTPMailer(cfg config.SMTPConfig) *SMTPMailer {
	return &SMTPMailer{cfg: cfg}
}

// SendOTP sends a one-time password to the given email address.
func (m *SMTPMailer) SendOTP(toEmail, otpCode string) error {
	from := m.cfg.Email
	password := m.cfg.Password
	host := m.cfg.Host
	port := m.cfg.Port
	addr := fmt.Sprintf("%s:%s", host, port)

	subject := "Kode OTP Login Stokku.ai"
	body := buildOTPEmailHTML(otpCode, m.cfg.FromName)

	msg := fmt.Sprintf(
		"From: %s <%s>\r\n"+
			"To: %s\r\n"+
			"Subject: %s\r\n"+
			"MIME-Version: 1.0\r\n"+
			"Content-Type: text/html; charset=\"UTF-8\"\r\n"+
			"\r\n%s",
		m.cfg.FromName, from, toEmail, subject, body,
	)

	auth := smtp.PlainAuth("", from, password, host)
	return smtp.SendMail(addr, auth, from, []string{toEmail}, []byte(msg))
}

func buildOTPEmailHTML(otpCode, fromName string) string {
	return fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a56db,#1e3a5f);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">🔐 %s</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Verifikasi Login</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;color:#374151;font-size:16px;line-height:1.6;">Halo,</p>
              <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.6;">
                Gunakan kode OTP berikut untuk menyelesaikan proses login Anda:
              </p>
              <!-- OTP Code -->
              <div style="background:#f0f7ff;border:2px dashed #1a56db;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
                <span style="font-size:36px;font-weight:800;letter-spacing:12px;color:#1a56db;font-family:'Courier New',monospace;">%s</span>
              </div>
              <p style="margin:0 0 8px;color:#6b7280;font-size:14px;line-height:1.5;">
                ⏱️ Kode ini berlaku selama <strong>5 menit</strong>.
              </p>
              <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.5;">
                Jika Anda tidak meminta kode ini, abaikan email ini.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                &copy; 2026 %s — Smart Inventory Management
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`, fromName, otpCode, fromName)
}
