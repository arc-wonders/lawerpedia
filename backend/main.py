import os
import secrets
import csv
import io
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Literal, Optional

import bcrypt
import jwt
from bson import ObjectId
from bson.binary import Binary
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Query, Request, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.responses import JSONResponse
from starlette.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import ReturnDocument
from pydantic import BaseModel, Field


load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

PORT = int(os.getenv("PORT", "4000"))
MONGODB_URL = os.getenv("MONGODB_URL", "")
MONGODB_DB = os.getenv("MONGODB_DB", "lawyerpedia")

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")

JWT_SECRET = os.getenv("JWT_SECRET") or secrets.token_hex(48)
JWT_ALG = "HS256"
JWT_EXPIRES_DAYS = 7

CORS_ORIGIN = os.getenv("CORS_ORIGIN", "").strip()

if not MONGODB_URL:
    raise RuntimeError("Missing MONGODB_URL (set it as an environment variable)")

if not os.getenv("JWT_SECRET"):
    # Keep running (dev-friendly) but log clearly.
    print(
        "WARNING: JWT_SECRET is not set. Using an ephemeral secret; logins will break on restart."
    )


bearer = HTTPBearer(auto_error=False)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def _norm_str(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _norm_email(value: Any) -> str:
    return _norm_str(value).lower()


def _norm_phone(value: Any) -> str:
    # Keep it simple: trim spaces; admins can define their own formatting rules later.
    return _norm_str(value)


def _norm_name(value: Any) -> str:
    return " ".join(_norm_str(value).split()).lower()

def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except Exception:
        return False


def oid_or_400(id_str: str) -> ObjectId:
    if not ObjectId.is_valid(id_str):
        raise HTTPException(status_code=400, detail="Invalid id")
    return ObjectId(id_str)


def media_url(request: Request, media_id: ObjectId) -> str:
    # Build an absolute URL so the frontend can use it cross-origin (Vite on 5173).
    return str(request.base_url).rstrip("/") + f"/api/media/{str(media_id)}"


def map_conclave(doc: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": str(doc["_id"]),
        "title": doc.get("title"),
        "date": doc.get("date"),
        "status": doc.get("status"),
        "attendees": doc.get("attendees"),
        "description": doc.get("description"),
        "fullDescription": doc.get("fullDescription"),
        "highlights": doc.get("highlights") or [],
        "venue": doc.get("venue"),
        "time": doc.get("time"),
        "createdAt": doc.get("createdAt"),
        "updatedAt": doc.get("updatedAt"),
    }


def map_consultation(doc: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": str(doc["_id"]),
        "name": doc.get("name"),
        "email": doc.get("email"),
        "phone": doc.get("phone"),
        "subject": doc.get("subject"),
        "message": doc.get("message"),
        "status": doc.get("status"),
        "createdAt": doc.get("createdAt"),
        "updatedAt": doc.get("updatedAt"),
    }


def map_gallery(doc: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": str(doc["_id"]),
        "title": doc.get("title"),
        "url": doc.get("url"),
        "isFeatured": bool(doc.get("isFeatured", False)),
        "createdAt": doc.get("createdAt"),
        "updatedAt": doc.get("updatedAt"),
    }


def map_article(doc: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": str(doc["_id"]),
        "title": doc.get("title"),
        "summary": doc.get("summary"),
        "content": doc.get("content"),
        "kind": doc.get("kind"),
        "status": doc.get("status"),
        "thumbnailUrl": doc.get("thumbnailUrl"),
        "externalUrl": doc.get("externalUrl"),
        "createdAt": doc.get("createdAt"),
        "updatedAt": doc.get("updatedAt"),
    }


def sign_admin_token(admin_id: str, username: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRES_DAYS)
    payload = {"sub": admin_id, "username": username, "type": "admin", "exp": exp}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def require_admin(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer),
) -> Dict[str, Any]:
    if not creds or creds.scheme.lower() != "bearer" or not creds.credentials:
        raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        decoded = jwt.decode(
            creds.credentials, JWT_SECRET, algorithms=[JWT_ALG], options={"require": ["exp"]}
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Unauthorized")
    if decoded.get("type") != "admin":
        raise HTTPException(status_code=401, detail="Unauthorized")
    return decoded


class LoginBody(BaseModel):
    username: str
    password: str


ConclaveStatus = Literal["upcoming", "past"]


class ConclaveBody(BaseModel):
    title: str
    date: str
    status: ConclaveStatus
    attendees: str
    description: str
    fullDescription: str
    highlights: List[str] = Field(default_factory=list)
    venue: str
    time: str


class ConsultationCreateBody(BaseModel):
    name: str
    email: str
    phone: str
    subject: str
    message: str


ConsultationStatus = Literal["pending", "completed"]


class ConsultationUpdateBody(BaseModel):
    status: ConsultationStatus


class GalleryCreateBody(BaseModel):
    title: str
    url: str


class GalleryUpdateBody(BaseModel):
    title: Optional[str] = None
    isFeatured: Optional[bool] = None


ArticleKind = Literal["article", "update"]
ArticleStatus = Literal["published", "draft"]


class ArticleBody(BaseModel):
    title: str
    summary: str = ""
    content: str = ""
    kind: ArticleKind = "article"
    status: ArticleStatus = "published"
    thumbnailUrl: Optional[str] = None
    externalUrl: Optional[str] = None


ConclaveFormFieldType = Literal["text", "email", "phone", "textarea", "select"]


class ConclaveFormField(BaseModel):
    key: str
    label: str
    type: ConclaveFormFieldType
    required: bool = False
    placeholder: Optional[str] = None
    options: List[str] = Field(default_factory=list)


class ConclaveFormUpsertBody(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    fields: List[ConclaveFormField] = Field(default_factory=list)
    enabled: bool = True


class ConclaveSubmissionBody(BaseModel):
    answers: Dict[str, Any] = Field(default_factory=dict)


def cors_origins() -> List[str]:
    if not CORS_ORIGIN:
        return ["*"]
    return [o.strip() for o in CORS_ORIGIN.split(",") if o.strip()]


app = FastAPI(title="LawyerPedia API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins(),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


_mongo_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None


async def get_db() -> AsyncIOMotorDatabase:
    if _db is None:
        raise RuntimeError("DB not initialized")
    return _db


async def ensure_seed_data(db: AsyncIOMotorDatabase) -> None:
    conclaves_col = db["conclaves"]
    count = await conclaves_col.count_documents({})
    ts = now_iso()
    if count == 0:
        await conclaves_col.insert_many(
            [
                {
                    "title": "Legal Awareness Conclave 2026",
                    "date": "June 15, 2026",
                    "status": "upcoming",
                    "attendees": "Expected 600+",
                    "description": "A comprehensive event covering consumer rights, criminal law basics, and legal remedies for common issues.",
                    "fullDescription": "Join us for India's premier legal awareness conclave, designed to empower individuals with knowledge of their legal rights and remedies. This comprehensive event will feature expert speakers, interactive workshops, and networking opportunities with legal professionals from across the country.",
                    "highlights": [
                        "Expert panel discussions on consumer protection laws",
                        "Interactive workshops on criminal law basics",
                        "Legal aid clinic with free consultations",
                        "Networking opportunities with legal professionals",
                        "Certificate of participation",
                    ],
                    "venue": "India Habitat Centre, New Delhi",
                    "time": "9:00 AM - 6:00 PM",
                    "createdAt": ts,
                    "updatedAt": ts,
                },
                {
                    "title": "Corporate Law Summit 2025",
                    "date": "November 12, 2025",
                    "status": "past",
                    "attendees": "500+",
                    "description": "Successfully conducted summit on startup legal compliance, attended by 500+ entrepreneurs and legal professionals.",
                    "fullDescription": "Our Corporate Law Summit brought together leading entrepreneurs, legal experts, and policymakers to discuss the evolving landscape of startup legal compliance in India. The event featured keynote speeches, panel discussions, and hands-on workshops.",
                    "highlights": [
                        "Keynote by prominent startup lawyers",
                        "Panel on recent regulatory changes",
                        "Workshops on incorporation and compliance",
                        "Investor-founder legal relationship sessions",
                        "Networking with 500+ attendees",
                    ],
                    "venue": "The Leela Ambience, Gurugram",
                    "time": "Full Day Event",
                    "createdAt": ts,
                    "updatedAt": ts,
                },
                {
                    "title": "Women's Legal Rights Workshop",
                    "date": "August 20, 2025",
                    "status": "past",
                    "attendees": "300+",
                    "description": "Empowering workshop focusing on women's legal rights, property laws, and domestic violence protection.",
                    "fullDescription": "An empowering day dedicated to educating women about their legal rights in India. This workshop covered crucial topics including property rights, matrimonial laws, workplace harassment, and domestic violence protection mechanisms.",
                    "highlights": [
                        "Sessions on property and inheritance rights",
                        "Understanding domestic violence laws",
                        "Workplace harassment prevention",
                        "Legal aid resources and support systems",
                        "One-on-one legal counseling",
                    ],
                    "venue": "India International Centre, New Delhi",
                    "time": "10:00 AM - 5:00 PM",
                    "createdAt": ts,
                    "updatedAt": ts,
                },
            ]
        )

    articles_col = db["articles"]
    articles_count = await articles_col.count_documents({})
    if articles_count == 0:
        await articles_col.insert_many(
            [
                {
                    "title": "Understanding Your Rights in Consumer Disputes",
                    "summary": "A practical guide to consumer protection laws, refunds, and dispute resolution steps.",
                    "content": "Consumer disputes are common — from defective products to delayed services.\n\nThis article explains the basics of consumer rights, what documents to keep, and how to approach grievance redressal.\n\nIf you need help, book a consultation through LawyerPedia.",
                    "kind": "article",
                    "status": "published",
                    "thumbnailUrl": None,
                    "externalUrl": None,
                    "createdAt": ts,
                    "updatedAt": ts,
                },
                {
                    "title": "Update: Free Legal Aid Camp (This Weekend)",
                    "summary": "Join us for a free legal consultation drive with limited slots.",
                    "content": "We are organizing a free legal aid camp this weekend.\n\nBring any relevant documents and be on time. Slots are limited and will be served on a first-come basis.",
                    "kind": "update",
                    "status": "published",
                    "thumbnailUrl": None,
                    "externalUrl": None,
                    "createdAt": ts,
                    "updatedAt": ts,
                },
                {
                    "title": "Corporate Compliance Checklist for Startups",
                    "summary": "A beginner-friendly compliance checklist for founders: filings, contracts, and risk basics.",
                    "content": "Compliance can feel overwhelming when you're building.\n\nThis checklist covers essential filings, basic contract hygiene, and common mistakes to avoid.",
                    "kind": "article",
                    "status": "published",
                    "thumbnailUrl": None,
                    "externalUrl": None,
                    "createdAt": ts,
                    "updatedAt": ts,
                },
            ]
        )


async def ensure_admin_user(db: AsyncIOMotorDatabase) -> None:
    admins_col = db["admins"]
    existing = await admins_col.find_one({"username": ADMIN_USERNAME})
    if existing:
        return
    if not ADMIN_PASSWORD:
        print(
            "WARNING: ADMIN_PASSWORD is not set; skipping admin user creation. Set it in backend/.env to enable /admin login."
        )
        return
    ts = now_iso()
    await admins_col.insert_one(
        {
            "username": ADMIN_USERNAME,
            "passwordHash": hash_password(ADMIN_PASSWORD),
            "createdAt": ts,
            "updatedAt": ts,
        }
    )


async def ensure_default_forms(db: AsyncIOMotorDatabase) -> None:
    forms_col = db["conclave_forms"]
    conclaves_col = db["conclaves"]

    async for conclave in conclaves_col.find({}):
        existing = await forms_col.find_one({"conclaveId": conclave["_id"]})
        if existing:
            continue

        ts = now_iso()
        await forms_col.insert_one(
            {
                "conclaveId": conclave["_id"],
                "enabled": True,
                "title": "Event Registration",
                "description": "Register for this event by filling the form below.",
                "fields": [
                    {
                        "key": "name",
                        "label": "Full Name",
                        "type": "text",
                        "required": True,
                        "placeholder": "Enter your name",
                        "options": [],
                    },
                    {
                        "key": "email",
                        "label": "Email",
                        "type": "email",
                        "required": True,
                        "placeholder": "you@example.com",
                        "options": [],
                    },
                    {
                        "key": "phone",
                        "label": "Phone",
                        "type": "phone",
                        "required": True,
                        "placeholder": "+91 98765 43210",
                        "options": [],
                    },
                ],
                "createdAt": ts,
                "updatedAt": ts,
            }
        )


@app.on_event("startup")
async def _startup() -> None:
    global _mongo_client, _db
    _mongo_client = AsyncIOMotorClient(MONGODB_URL)
    _db = _mongo_client[MONGODB_DB]
    await _db.command({"ping": 1})
    await ensure_seed_data(_db)
    await ensure_admin_user(_db)
    await ensure_default_forms(_db)


@app.on_event("shutdown")
async def _shutdown() -> None:
    global _mongo_client, _db
    if _mongo_client is not None:
        _mongo_client.close()
    _mongo_client = None
    _db = None


@app.get("/health")
async def health(db: AsyncIOMotorDatabase = Depends(get_db)) -> Dict[str, Any]:
    try:
        await db.command({"ping": 1})
        return {"ok": True}
    except Exception:
        raise HTTPException(status_code=500, detail="Unhealthy")


@app.post("/api/auth/login")
async def auth_login(body: LoginBody, db: AsyncIOMotorDatabase = Depends(get_db)) -> Dict[str, Any]:
    admin = await db["admins"].find_one({"username": body.username})
    if not admin or not verify_password(body.password, admin.get("passwordHash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = sign_admin_token(str(admin["_id"]), admin["username"])
    return {"token": token, "username": admin["username"]}


@app.get("/api/conclaves")
async def public_conclaves(request: Request, db: AsyncIOMotorDatabase = Depends(get_db)) -> Dict[str, Any]:
    docs = await db["conclaves"].find({}).sort("createdAt", -1).to_list(length=500)
    conclave_ids = [d["_id"] for d in docs]

    images = []
    if conclave_ids:
        images = await (
            db["conclave_images"]
            .find({"conclaveId": {"$in": conclave_ids}})
            .sort([("isThumbnail", -1), ("createdAt", 1)])
            .to_list(length=5000)
        )

    by_conclave: Dict[str, List[Dict[str, Any]]] = {}
    for img in images:
        key = str(img["conclaveId"])
        by_conclave.setdefault(key, []).append(img)

    items = []
    for d in docs:
        c = map_conclave(d)
        img_docs = by_conclave.get(str(d["_id"]), [])
        urls = [media_url(request, img["mediaId"]) for img in img_docs if img.get("mediaId")]
        thumb = next((img for img in img_docs if img.get("isThumbnail")), None) or (img_docs[0] if img_docs else None)
        c["imageUrls"] = urls
        c["thumbnailUrl"] = media_url(request, thumb["mediaId"]) if thumb and thumb.get("mediaId") else None
        items.append(c)

    return {"items": items}


@app.get("/api/gallery")
async def public_gallery(request: Request, db: AsyncIOMotorDatabase = Depends(get_db)) -> Dict[str, Any]:
    docs = await db["gallery"].find({}).sort("createdAt", -1).to_list(length=500)
    items = []
    for d in docs:
        item = map_gallery(d)
        media_id = d.get("mediaId")
        if media_id:
            item["url"] = media_url(request, media_id)
        items.append(item)
    return {"items": items}


@app.get("/api/articles")
async def public_list_articles(db: AsyncIOMotorDatabase = Depends(get_db)) -> Dict[str, Any]:
    docs = await (
        db["articles"]
        .find({"status": "published"})
        .sort("createdAt", -1)
        .to_list(length=1000)
    )
    items = [map_article(d) for d in docs]
    # Public list does not need full content payload; keep responses light.
    for it in items:
        it["content"] = ""
    return {"items": items}


@app.get("/api/articles/{id}")
async def public_get_article(id: str, db: AsyncIOMotorDatabase = Depends(get_db)) -> Dict[str, Any]:
    oid = oid_or_400(id)
    doc = await db["articles"].find_one({"_id": oid, "status": "published"})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    return {"item": map_article(doc)}


@app.get("/api/media/{id}")
async def get_media(id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    oid = oid_or_400(id)
    doc = await db["media"].find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")

    data = doc.get("data", b"")
    content_type = doc.get("contentType") or "application/octet-stream"
    filename = doc.get("filename") or f"{id}"

    headers = {
        "Content-Disposition": f'inline; filename="{filename}"',
        "Cache-Control": "public, max-age=86400",
    }
    return StreamingResponse(iter([data]), media_type=content_type, headers=headers)


def map_conclave_form(doc: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": str(doc["_id"]),
        "conclaveId": str(doc["conclaveId"]),
        "enabled": bool(doc.get("enabled", True)),
        "title": doc.get("title"),
        "description": doc.get("description"),
        "fields": doc.get("fields") or [],
        "createdAt": doc.get("createdAt"),
        "updatedAt": doc.get("updatedAt"),
    }


@app.get("/api/conclaves/{id}/form")
async def public_get_conclave_form(
    id: str, db: AsyncIOMotorDatabase = Depends(get_db)
) -> Dict[str, Any]:
    conclave_id = oid_or_400(id)
    form = await db["conclave_forms"].find_one({"conclaveId": conclave_id})
    return {"form": map_conclave_form(form) if form else None}


@app.post("/api/conclaves/{id}/submissions", status_code=status.HTTP_201_CREATED)
async def public_submit_conclave_form(
    id: str, body: ConclaveSubmissionBody, db: AsyncIOMotorDatabase = Depends(get_db)
) -> Dict[str, Any]:
    conclave_id = oid_or_400(id)
    form = await db["conclave_forms"].find_one({"conclaveId": conclave_id})
    if not form or not form.get("enabled", True):
        raise HTTPException(status_code=404, detail="Form not found")

    fields = form.get("fields") or []
    allowed_keys = {f.get("key") for f in fields if f.get("key")}
    required_keys = {f.get("key") for f in fields if f.get("required") and f.get("key")}
    answers = body.answers or {}

    for k in required_keys:
        v = answers.get(k)
        if v is None or (isinstance(v, str) and not v.strip()):
            raise HTTPException(status_code=400, detail=f"Missing required field: {k}")

    sanitized = {k: answers.get(k) for k in allowed_keys if k in answers}
    # Dedupe: block multiple registrations per conclave if name/email/phone matches.
    name_norm = _norm_name(answers.get("name"))
    email_norm = _norm_email(answers.get("email"))
    phone_norm = _norm_phone(answers.get("phone"))

    or_filters: List[Dict[str, Any]] = []
    if email_norm:
        or_filters.append({"dedupe.emailNorm": email_norm})
        # Backward-compat for older docs (if any) that don't have `dedupe`
        or_filters.append({"answers.email": answers.get("email")})
    if phone_norm:
        or_filters.append({"dedupe.phoneNorm": phone_norm})
        or_filters.append({"answers.phone": answers.get("phone")})
    if name_norm:
        or_filters.append({"dedupe.nameNorm": name_norm})
        or_filters.append({"answers.name": answers.get("name")})

    if or_filters:
        existing = await db["conclave_submissions"].find_one(
            {"conclaveId": conclave_id, "$or": or_filters}
        )
        if existing:
            raise HTTPException(
                status_code=409,
                detail="You have already registered for this conclave.",
            )

    ts = now_iso()
    result = await db["conclave_submissions"].insert_one(
        {
            "conclaveId": conclave_id,
            "formId": form["_id"],
            "answers": sanitized,
            "dedupe": {
                "nameNorm": name_norm,
                "emailNorm": email_norm,
                "phoneNorm": phone_norm,
            },
            "createdAt": ts,
        }
    )
    return {"id": str(result.inserted_id)}


@app.post("/api/consultations", status_code=status.HTTP_201_CREATED)
async def public_create_consultation(
    body: ConsultationCreateBody, db: AsyncIOMotorDatabase = Depends(get_db)
) -> Dict[str, Any]:
    ts = now_iso()
    result = await db["consultations"].insert_one(
        {
            "name": body.name,
            "email": body.email,
            "phone": body.phone,
            "subject": body.subject,
            "message": body.message,
            "status": "pending",
            "createdAt": ts,
            "updatedAt": ts,
        }
    )
    doc = await db["consultations"].find_one({"_id": result.inserted_id})
    return {"item": map_consultation(doc)}


@app.get("/api/admin/consultations")
async def admin_list_consultations(
    _admin: Dict[str, Any] = Depends(require_admin),
    status_: Optional[ConsultationStatus] = Query(default=None, alias="status"),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Dict[str, Any]:
    q: Dict[str, Any] = {}
    if status_ in ("pending", "completed"):
        q["status"] = status_
    docs = await db["consultations"].find(q).sort("createdAt", -1).to_list(length=2000)
    return {"items": [map_consultation(d) for d in docs]}


@app.patch("/api/admin/consultations/{id}")
async def admin_update_consultation(
    id: str,
    body: ConsultationUpdateBody,
    _admin: Dict[str, Any] = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Dict[str, Any]:
    oid = oid_or_400(id)
    ts = now_iso()
    result = await db["consultations"].find_one_and_update(
        {"_id": oid},
        {"$set": {"status": body.status, "updatedAt": ts}},
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Not found")
    return {"item": map_consultation(result)}


@app.delete("/api/admin/consultations/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_consultation(
    id: str,
    _admin: Dict[str, Any] = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> None:
    oid = oid_or_400(id)
    result = await db["consultations"].delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return None


@app.get("/api/admin/conclaves")
async def admin_list_conclaves(
    _admin: Dict[str, Any] = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Dict[str, Any]:
    docs = await db["conclaves"].find({}).sort("createdAt", -1).to_list(length=500)
    return {"items": [map_conclave(d) for d in docs]}


@app.post("/api/admin/conclaves", status_code=status.HTTP_201_CREATED)
async def admin_create_conclave(
    body: ConclaveBody,
    _admin: Dict[str, Any] = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Dict[str, Any]:
    ts = now_iso()
    result = await db["conclaves"].insert_one(
        {
            **body.model_dump(),
            "highlights": [h for h in body.highlights if h],
            "createdAt": ts,
            "updatedAt": ts,
        }
    )
    doc = await db["conclaves"].find_one({"_id": result.inserted_id})
    return {"item": map_conclave(doc)}


@app.put("/api/admin/conclaves/{id}")
async def admin_update_conclave(
    id: str,
    body: ConclaveBody,
    _admin: Dict[str, Any] = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Dict[str, Any]:
    oid = oid_or_400(id)
    ts = now_iso()
    result = await db["conclaves"].find_one_and_update(
        {"_id": oid},
        {
            "$set": {
                **body.model_dump(),
                "highlights": [h for h in body.highlights if h],
                "updatedAt": ts,
            }
        },
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Not found")
    return {"item": map_conclave(result)}


@app.delete("/api/admin/conclaves/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_conclave(
    id: str,
    _admin: Dict[str, Any] = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> None:
    oid = oid_or_400(id)
    result = await db["conclaves"].delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return None


@app.get("/api/admin/conclaves/{id}/form")
async def admin_get_conclave_form(
    id: str,
    _admin: Dict[str, Any] = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Dict[str, Any]:
    conclave_id = oid_or_400(id)
    form = await db["conclave_forms"].find_one({"conclaveId": conclave_id})
    return {"form": map_conclave_form(form) if form else None}


@app.put("/api/admin/conclaves/{id}/form")
async def admin_put_conclave_form(
    id: str,
    body: ConclaveFormUpsertBody,
    _admin: Dict[str, Any] = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Dict[str, Any]:
    conclave_id = oid_or_400(id)
    ts = now_iso()

    keys = [f.key.strip() for f in body.fields if f.key and f.key.strip()]
    if len(keys) != len(set(keys)):
        raise HTTPException(status_code=400, detail="Duplicate field keys")

    fields: List[Dict[str, Any]] = []
    for f in body.fields:
        key = f.key.strip()
        if not key:
            continue
        fields.append(
            {
                "key": key,
                "label": f.label,
                "type": f.type,
                "required": bool(f.required),
                "placeholder": f.placeholder,
                "options": [o for o in (f.options or []) if isinstance(o, str) and o.strip()],
            }
        )

    update = {
        "enabled": bool(body.enabled),
        "title": body.title,
        "description": body.description,
        "fields": fields,
        "updatedAt": ts,
    }

    existing = await db["conclave_forms"].find_one({"conclaveId": conclave_id})
    if existing:
        form = await db["conclave_forms"].find_one_and_update(
            {"_id": existing["_id"]},
            {"$set": update},
            return_document=ReturnDocument.AFTER,
        )
        return {"form": map_conclave_form(form)}

    doc = {"conclaveId": conclave_id, "createdAt": ts, **update}
    result = await db["conclave_forms"].insert_one(doc)
    form = await db["conclave_forms"].find_one({"_id": result.inserted_id})
    return {"form": map_conclave_form(form)}


@app.get("/api/admin/conclaves/{id}/submissions")
async def admin_list_conclave_submissions(
    id: str,
    _admin: Dict[str, Any] = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Dict[str, Any]:
    conclave_id = oid_or_400(id)
    docs = await (
        db["conclave_submissions"]
        .find({"conclaveId": conclave_id})
        .sort("createdAt", -1)
        .to_list(length=5000)
    )
    items = [
        {"id": str(d["_id"]), "createdAt": d.get("createdAt"), "answers": d.get("answers") or {}}
        for d in docs
    ]
    return {"items": items}


@app.get("/api/admin/conclaves/{id}/submissions.csv")
async def admin_export_conclave_submissions_csv(
    id: str,
    _admin: Dict[str, Any] = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    conclave_id = oid_or_400(id)
    form = await db["conclave_forms"].find_one({"conclaveId": conclave_id})
    fields = (form or {}).get("fields") or []

    field_keys = [f.get("key") for f in fields if f.get("key")]
    field_labels = {f.get("key"): (f.get("label") or f.get("key")) for f in fields if f.get("key")}

    docs = await (
        db["conclave_submissions"]
        .find({"conclaveId": conclave_id})
        .sort("createdAt", -1)
        .to_list(length=20000)
    )

    def iter_csv():
        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow(["submissionId", "createdAt"] + [field_labels.get(k, k) for k in field_keys])
        yield buffer.getvalue()

        for d in docs:
            buffer = io.StringIO()
            writer = csv.writer(buffer)
            answers = d.get("answers") or {}
            writer.writerow([str(d["_id"]), d.get("createdAt")] + [answers.get(k, "") for k in field_keys])
            yield buffer.getvalue()

    filename = f"conclave_{id}_submissions.csv"
    headers = {"Content-Disposition": f'attachment; filename=\"{filename}\"'}
    return StreamingResponse(iter_csv(), media_type="text/csv; charset=utf-8", headers=headers)


@app.get("/api/admin/conclaves/{id}/images")
async def admin_list_conclave_images(
    id: str,
    request: Request,
    _admin: Dict[str, Any] = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Dict[str, Any]:
    conclave_id = oid_or_400(id)
    docs = await (
        db["conclave_images"]
        .find({"conclaveId": conclave_id})
        .sort([("isThumbnail", -1), ("createdAt", 1)])
        .to_list(length=1000)
    )
    items = [
        {
            "id": str(d["_id"]),
            "mediaId": str(d["mediaId"]),
            "url": media_url(request, d["mediaId"]),
            "isThumbnail": bool(d.get("isThumbnail", False)),
            "createdAt": d.get("createdAt"),
        }
        for d in docs
    ]
    return {"items": items}


@app.post("/api/admin/conclaves/{id}/images", status_code=status.HTTP_201_CREATED)
async def admin_upload_conclave_image(
    id: str,
    request: Request,
    file: UploadFile = File(...),
    set_thumbnail: bool = Form(default=False),
    _admin: Dict[str, Any] = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Dict[str, Any]:
    conclave_id = oid_or_400(id)
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are supported")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")

    ts = now_iso()
    media_insert = await db["media"].insert_one(
        {
            "filename": file.filename,
            "contentType": file.content_type,
            "size": len(data),
            "data": Binary(data),
            "createdAt": ts,
        }
    )

    img_insert = await db["conclave_images"].insert_one(
        {
            "conclaveId": conclave_id,
            "mediaId": media_insert.inserted_id,
            "isThumbnail": False,
            "createdAt": ts,
        }
    )

    # If it's the first image or user explicitly wants thumbnail, set it.
    existing_thumb = await db["conclave_images"].find_one(
        {"conclaveId": conclave_id, "isThumbnail": True}
    )
    if set_thumbnail or not existing_thumb:
        await db["conclave_images"].update_many(
            {"conclaveId": conclave_id}, {"$set": {"isThumbnail": False}}
        )
        await db["conclave_images"].update_one(
            {"_id": img_insert.inserted_id}, {"$set": {"isThumbnail": True}}
        )

    img = await db["conclave_images"].find_one({"_id": img_insert.inserted_id})
    return {
        "item": {
            "id": str(img["_id"]),
            "mediaId": str(img["mediaId"]),
            "url": media_url(request, img["mediaId"]),
            "isThumbnail": bool(img.get("isThumbnail", False)),
            "createdAt": img.get("createdAt"),
        }
    }


@app.post("/api/admin/conclaves/{id}/images/{image_id}/thumbnail")
async def admin_set_conclave_thumbnail(
    id: str,
    image_id: str,
    _admin: Dict[str, Any] = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Dict[str, Any]:
    conclave_id = oid_or_400(id)
    img_oid = oid_or_400(image_id)

    img = await db["conclave_images"].find_one({"_id": img_oid, "conclaveId": conclave_id})
    if not img:
        raise HTTPException(status_code=404, detail="Not found")

    await db["conclave_images"].update_many(
        {"conclaveId": conclave_id}, {"$set": {"isThumbnail": False}}
    )
    await db["conclave_images"].update_one({"_id": img_oid}, {"$set": {"isThumbnail": True}})
    return {"ok": True}


@app.delete("/api/admin/conclaves/{id}/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_conclave_image(
    id: str,
    image_id: str,
    _admin: Dict[str, Any] = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> None:
    conclave_id = oid_or_400(id)
    img_oid = oid_or_400(image_id)

    img = await db["conclave_images"].find_one({"_id": img_oid, "conclaveId": conclave_id})
    if not img:
        raise HTTPException(status_code=404, detail="Not found")

    await db["conclave_images"].delete_one({"_id": img_oid})
    # Best-effort: remove media (this image is only referenced by this record currently).
    await db["media"].delete_one({"_id": img.get("mediaId")})

    # Ensure there is a thumbnail if any images remain.
    remaining = await (
        db["conclave_images"]
        .find({"conclaveId": conclave_id})
        .sort([("createdAt", 1)])
        .to_list(length=2)
    )
    if remaining and not any(r.get("isThumbnail") for r in remaining):
        await db["conclave_images"].update_one(
            {"_id": remaining[0]["_id"]}, {"$set": {"isThumbnail": True}}
        )

    return None


@app.get("/api/admin/gallery")
async def admin_list_gallery(
    request: Request,
    _admin: Dict[str, Any] = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Dict[str, Any]:
    docs = await db["gallery"].find({}).sort("createdAt", -1).to_list(length=2000)
    items = []
    for d in docs:
        item = map_gallery(d)
        if d.get("mediaId"):
            item["url"] = media_url(request, d["mediaId"])
        items.append(item)
    return {"items": items}


@app.get("/api/admin/articles")
async def admin_list_articles(
    _admin: Dict[str, Any] = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Dict[str, Any]:
    docs = await db["articles"].find({}).sort("createdAt", -1).to_list(length=2000)
    return {"items": [map_article(d) for d in docs]}


@app.post("/api/admin/articles", status_code=status.HTTP_201_CREATED)
async def admin_create_article(
    body: ArticleBody,
    _admin: Dict[str, Any] = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Dict[str, Any]:
    ts = now_iso()
    result = await db["articles"].insert_one(
        {
            **body.model_dump(),
            "createdAt": ts,
            "updatedAt": ts,
        }
    )
    doc = await db["articles"].find_one({"_id": result.inserted_id})
    return {"item": map_article(doc)}


@app.put("/api/admin/articles/{id}")
async def admin_update_article(
    id: str,
    body: ArticleBody,
    _admin: Dict[str, Any] = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Dict[str, Any]:
    oid = oid_or_400(id)
    ts = now_iso()
    result = await db["articles"].find_one_and_update(
        {"_id": oid},
        {"$set": {**body.model_dump(), "updatedAt": ts}},
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Not found")
    return {"item": map_article(result)}


@app.delete("/api/admin/articles/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_article(
    id: str,
    _admin: Dict[str, Any] = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> None:
    oid = oid_or_400(id)
    result = await db["articles"].delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return None


@app.post("/api/admin/gallery", status_code=status.HTTP_201_CREATED)
async def admin_create_gallery(
    body: GalleryCreateBody,
    _admin: Dict[str, Any] = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Dict[str, Any]:
    ts = now_iso()
    result = await db["gallery"].insert_one(
        {"title": body.title, "url": body.url, "createdAt": ts, "updatedAt": ts}
    )
    doc = await db["gallery"].find_one({"_id": result.inserted_id})
    return {"item": map_gallery(doc)}


@app.post("/api/admin/gallery/upload", status_code=status.HTTP_201_CREATED)
async def admin_upload_gallery_image(
    request: Request,
    file: UploadFile = File(...),
    title: str = Form(default=""),
    _admin: Dict[str, Any] = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Dict[str, Any]:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are supported")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")

    ts = now_iso()
    media_insert = await db["media"].insert_one(
        {
            "filename": file.filename,
            "contentType": file.content_type,
            "size": len(data),
            "data": Binary(data),
            "createdAt": ts,
        }
    )

    insert = await db["gallery"].insert_one(
        {
            "title": title or (file.filename or "Gallery Image"),
            "mediaId": media_insert.inserted_id,
            "createdAt": ts,
            "updatedAt": ts,
        }
    )
    doc = await db["gallery"].find_one({"_id": insert.inserted_id})
    item = map_gallery(doc)
    item["url"] = media_url(request, doc["mediaId"])
    return {"item": item}


@app.patch("/api/admin/gallery/{id}")
async def admin_update_gallery(
    id: str,
    request: Request,
    body: GalleryUpdateBody,
    _admin: Dict[str, Any] = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Dict[str, Any]:
    oid = oid_or_400(id)
    patch: Dict[str, Any] = {}
    if body.title is not None:
        patch["title"] = body.title
    if body.isFeatured is not None:
        patch["isFeatured"] = bool(body.isFeatured)

    if not patch:
        doc = await db["gallery"].find_one({"_id": oid})
        if not doc:
            raise HTTPException(status_code=404, detail="Not found")
        item = map_gallery(doc)
        if doc.get("mediaId"):
            item["url"] = media_url(request, doc["mediaId"])
        return {"item": item}

    patch["updatedAt"] = now_iso()
    result = await db["gallery"].find_one_and_update(
        {"_id": oid},
        {"$set": patch},
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Not found")

    item = map_gallery(result)
    if result.get("mediaId"):
        item["url"] = media_url(request, result["mediaId"])
    return {"item": item}


@app.delete("/api/admin/gallery/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_gallery(
    id: str,
    _admin: Dict[str, Any] = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> None:
    oid = oid_or_400(id)
    doc = await db["gallery"].find_one({"_id": oid})
    result = await db["gallery"].delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    if doc and doc.get("mediaId"):
        await db["media"].delete_one({"_id": doc["mediaId"]})
    return None


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return fastapi_error(exc.status_code, exc.detail)


def fastapi_error(code: int, message: str):
    # Keep response shape consistent with frontend expectations.
    return JSONResponse(status_code=code, content={"error": message})


@app.middleware("http")
async def normalize_errors(request: Request, call_next):
    try:
        return await call_next(request)
    except HTTPException as exc:
        return fastapi_error(exc.status_code, exc.detail)
    except Exception:
        return fastapi_error(500, "Internal server error")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
