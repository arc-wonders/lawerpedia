import json
import os
from urllib.request import Request, urlopen

from dotenv import load_dotenv


def http_json(url: str, method: str = "GET", body: dict | None = None, headers: dict | None = None):
    data = None if body is None else json.dumps(body).encode("utf-8")
    req = Request(url, method=method, data=data, headers=headers or {})
    if data is not None:
        req.add_header("Content-Type", "application/json")
    with urlopen(req, timeout=15) as resp:
        raw = resp.read()
        if not raw:
            return None
        return json.loads(raw.decode("utf-8"))


def main():
    load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
    port = os.getenv("PORT", "4000")
    base = f"http://127.0.0.1:{port}"

    # Public consultation
    consultation = http_json(
        f"{base}/api/consultations",
        method="POST",
        body={
            "name": "Test User",
            "email": "test.user@example.com",
            "phone": "+91 99999 11111",
            "subject": "Test consultation",
            "message": "This is a dummy consultation created by seed_dummy.py",
        },
    )

    # Admin login -> token
    admin_username = os.getenv("ADMIN_USERNAME", "admin")
    admin_password = os.getenv("ADMIN_PASSWORD", "")
    login = http_json(
        f"{base}/api/auth/login",
        method="POST",
        body={"username": admin_username, "password": admin_password},
    )
    token = login["token"]
    auth_headers = {"Authorization": f"Bearer {token}"}

    gallery = http_json(
        f"{base}/api/admin/gallery",
        method="POST",
        body={
            "title": "Dummy Gallery Image",
            "url": "https://via.placeholder.com/800x800?text=LawyerPedia+Dummy",
        },
        headers=auth_headers,
    )

    conclave = http_json(
        f"{base}/api/admin/conclaves",
        method="POST",
        body={
            "title": "Dummy Conclave",
            "date": "July 1, 2026",
            "status": "upcoming",
            "attendees": "123",
            "description": "Dummy conclave created by seed_dummy.py",
            "fullDescription": "This is dummy long description stored in MongoDB.",
            "highlights": ["Highlight A", "Highlight B"],
            "venue": "Online",
            "time": "6:00 PM - 7:00 PM",
        },
        headers=auth_headers,
    )

    print("Seeded:")
    print(f"- consultationId={consultation['item']['id']}")
    print(f"- galleryId={gallery['item']['id']}")
    print(f"- conclaveId={conclave['item']['id']}")


if __name__ == "__main__":
    main()

