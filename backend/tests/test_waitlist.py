from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_waitlist_redirect(monkeypatch):
    monkeypatch.setenv("THANKS_URL", "/thanks.html")
    response = client.post(
        "/api/public/waitlist",
        data={"name": "Test User", "email": "test@example.com", "consent": "yes"},
    )
    assert response.status_code in (303, 307)
