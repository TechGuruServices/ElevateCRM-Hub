from fastapi import APIRouter, Form, Request
from fastapi.responses import RedirectResponse, JSONResponse
from pydantic import EmailStr
import datetime as dt
import os

import resend

router = APIRouter()

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
TEAM_INBOX = os.getenv("WAITLIST_INBOX", "")
THANKS_URL = os.getenv("THANKS_URL", "/thanks.html")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

THANK_YOU_SUBJECT = "You're on the ElevateCRM Hub Private Beta list 🎉"
THANK_YOU_HTML = """<!doctype html><html><body style="margin:0;padding:24px;font-family:system-ui,-apple-system,Segoe UI,Roboto">
<table width="100%"><tr><td align="center"><table width="640" style="background:#0b1220;color:#fff;border-radius:20px;padding:28px">
<tr><td style="text-align:center">
<h1 style="margin:0 0 10px;font-size:24px;">Welcome to the list 🎉</h1>
<p style="margin:0 0 12px;color:#cbd5e1">Thanks for joining the ElevateCRM Hub Private Beta.</p>
<p style="margin:0 0 18px;color:#cbd5e1">We’ll reach out with your access window and updates soon.</p>
<a href="https://elevatecrmhub.space" style="display:inline-block;background:linear-gradient(90deg,#00c2ff,#7c3aed);color:#fff;text-decoration:none;border-radius:12px;padding:10px 16px;font-weight:700">Visit Website</a>
<p style="margin:18px 0 0;font-size:12px;color:#94a3b8">No spam. Unsubscribe anytime.</p>
</td></tr></table></td></tr></table></body></html>"""


def send_autoresponder(to_email: str, name: str) -> None:
    if not RESEND_API_KEY:
        return
    try:
        resend.Emails.send(
            {
                "from": "ElevateCRM Hub <no-reply@elevatecrmhub.space>",
                "to": [to_email],
                "subject": THANK_YOU_SUBJECT,
                "html": THANK_YOU_HTML.replace(
                    "Welcome to the list", f"Welcome, {name.split()[0]}! 🎉"
                ),
            }
        )
    except Exception as exc:
        print("Autoresponder error:", exc)


def notify_team(email: str, name: str, ip: str) -> None:
    if not (RESEND_API_KEY and TEAM_INBOX):
        return
    try:
        resend.Emails.send(
            {
                "from": "ElevateCRM Hub <no-reply@elevatecrmhub.space>",
                "to": [addr.strip() for addr in TEAM_INBOX.split(",") if addr.strip()],
                "subject": f"New beta signup: {name} <{email}>",
                "text": f"{dt.datetime.utcnow().isoformat()}Z\nName: {name}\nEmail: {email}\nIP: {ip}\n",
            }
        )
    except Exception as exc:
        print("Team notify error:", exc)


@router.post("/public/waitlist")
async def waitlist(
    request: Request,
    name: str = Form(...),
    email: EmailStr = Form(...),
    consent: str = Form(...),
    website: str | None = Form(None),
) -> RedirectResponse | JSONResponse:
    if website:
        return RedirectResponse(url=THANKS_URL, status_code=303)
    if consent != "yes":
        return JSONResponse({"error": "consent_required"}, status_code=400)

    client_ip = request.headers.get(
        "x-forwarded-for", request.client.host if request.client else ""
    )
    send_autoresponder(to_email=str(email), name=name)
    notify_team(email=str(email), name=name, ip=client_ip)

    return RedirectResponse(url=THANKS_URL, status_code=303)
