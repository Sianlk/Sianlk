"""
Email service — transactional email via SMTP with TLS.
"""
from __future__ import annotations
import logging, smtplib, ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from api.core.config import settings

logger = logging.getLogger(__name__)

_HTML_BASE = """<!DOCTYPE html>
<html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
{body}
<hr style="margin:32px 0;border-color:#E5E7EB">
<p style="color:#9CA3AF;font-size:11px">&copy; {app_name} · Sianlk Pty Ltd</p>
</body></html>"""

_TEMPLATES: dict[str, dict] = {
    "welcome": {
        "subject": "Welcome to {app_name}!",
        "body": ("<h1 style=\"color:{primary}\">Welcome, {name}!</h1>"
                 "<p>Your account is ready. <a href=\"{url}\" style=\"color:{primary}\">Get started</a></p>"),
    },
    "verify_email": {
        "subject": "Verify your email — {app_name}",
        "body": ("<h1 style=\"color:{primary}\">Verify your email</h1>"
                 "<p>Hi {name}, <a href=\"{url}\">click here to verify your email</a>. Expires in 24 h.</p>"),
    },
    "reset_password": {
        "subject": "Password reset — {app_name}",
        "body": ("<h1 style=\"color:{primary}\">Reset your password</h1>"
                 "<p>Hi {name}, <a href=\"{url}\">click here to reset your password</a>. Expires in 1 h.</p>"
                 "<p>If you did not request a reset, ignore this email.</p>"),
    },
    "subscription_confirmed": {
        "subject": "Subscription confirmed — {plan} on {app_name}",
        "body": ("<h1 style=\"color:{primary}\">Subscription Active</h1>"
                 "<p>Hi {name}, your <strong>{plan}</strong> subscription is active.</p>"
                 "<p>Next billing: {next_billing} · Amount: {amount}</p>"
                 "<p><a href=\"{url}\">Manage your subscription</a></p>"),
    },
}

class EmailService:
    def __init__(self) -> None:
        self.sender    = getattr(settings, "EMAIL_FROM",   "noreply@sianlk.com")
        self.smtp_host = getattr(settings, "SMTP_HOST",    "smtp.gmail.com")
        self.smtp_port = int(getattr(settings, "SMTP_PORT", 587))
        self.smtp_user = getattr(settings, "SMTP_USER",    "")
        self.smtp_pass = getattr(settings, "SMTP_PASS",    "")
        self.app_name  = getattr(settings, "APP_NAME",     "Platform")
        self.primary   = getattr(settings, "BRAND_COLOR",  "#6366F1")

    def _render(self, template_name: str, **kwargs) -> tuple[str, str]:
        tpl = _TEMPLATES[template_name]
        ctx = {"app_name": self.app_name, "primary": self.primary, **kwargs}
        subject = tpl["subject"].format(**ctx)
        body    = tpl["body"].format(**ctx)
        html    = _HTML_BASE.format(body=body, app_name=self.app_name)
        return subject, html

    def _send(self, to: str, subject: str, html: str) -> bool:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"]    = f"{self.app_name} <{self.sender}>"
            msg["To"]      = to
            msg.attach(MIMEText(html, "html"))
            ctx = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as srv:
                srv.starttls(context=ctx)
                if self.smtp_user:
                    srv.login(self.smtp_user, self.smtp_pass)
                srv.sendmail(self.sender, to, msg.as_string())
            logger.info("Email sent to %s: %s", to, subject)
            return True
        except Exception as exc:
            logger.error("Email failed to %s: %s", to, exc)
            return False

    def send_welcome(self, to: str, name: str, url: str) -> bool:
        s, h = self._render("welcome", name=name, url=url)
        return self._send(to, s, h)

    def send_verify_email(self, to: str, name: str, url: str) -> bool:
        s, h = self._render("verify_email", name=name, url=url)
        return self._send(to, s, h)

    def send_reset_password(self, to: str, name: str, url: str) -> bool:
        s, h = self._render("reset_password", name=name, url=url)
        return self._send(to, s, h)

    def send_subscription_confirmed(self, to: str, name: str, plan: str,
                                     next_billing: str, amount: str, url: str) -> bool:
        s, h = self._render("subscription_confirmed", name=name, plan=plan,
                             next_billing=next_billing, amount=amount, url=url)
        return self._send(to, s, h)

email_service = EmailService()
