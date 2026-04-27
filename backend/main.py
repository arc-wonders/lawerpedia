import os
import secrets
import csv
import io
import asyncio
import random
import urllib.request
import urllib.error
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

PING_SECRET = os.getenv("PING_SECRET", "").strip()

CORS_ORIGIN = os.getenv("CORS_ORIGIN", "").strip()

if not MONGODB_URL:
    raise RuntimeError("Missing MONGODB_URL (set it as an environment variable)")

if not os.getenv("JWT_SECRET"):
    # Keep running (dev-friendly) but log clearly.
    print(
        "WARNING: JWT_SECRET is not set. Using an ephemeral secret; logins will break on restart."
    )


bearer = HTTPBearer(auto_error=False)

_last_ping_time: Optional[datetime] = None


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
        "slug": doc.get("slug"),
        "title": doc.get("title"),
        "date": doc.get("date"),
        "status": doc.get("status"),
        "attendees": doc.get("attendees"),
        "description": doc.get("description"),
        "fullDescription": doc.get("fullDescription"),
        "highlights": doc.get("highlights") or [],
        "venue": doc.get("venue"),
        "time": doc.get("time"),
        "journeyIndex": doc.get("journeyIndex"),
        "journeyMeta": doc.get("journeyMeta"),
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
    slug: Optional[str] = None
    journeyIndex: Optional[int] = None
    journeyMeta: Optional[str] = None


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


def _truthy(value: str) -> bool:
    return value.strip().lower() in ("1", "true", "yes", "y", "on")


async def get_db() -> AsyncIOMotorDatabase:
    if _db is None:
        raise RuntimeError("DB not initialized")
    return _db


async def ensure_seed_data(db: AsyncIOMotorDatabase) -> None:
    conclaves_col = db["conclaves"]

    # Make seeding idempotent. Keep user-created conclaves intact, but remove the old demo titles if present.
    await conclaves_col.create_index("slug", unique=True, sparse=True)
    await conclaves_col.delete_many(
        {
            "title": {
                "$in": [
                    "Legal Awareness Conclave 2026",
                    "Corporate Law Summit 2025",
                    "Women's Legal Rights Workshop",
                ]
            }
        }
    )

    tlp_conclaves = [
        {
            "slug": "tlp-conclave-1",
            "journeyIndex": 1,
            "journeyMeta": "8 March 2026",
            "title": "1st TLP Conclave",
            "date": "8 March 2026",
            "status": "past",
            "attendees": "9",
            "description": "An intimate gathering of 9 lawyers focused on open dialogue, sharing experiences, and understanding the realities of legal practice beyond formal environments.",
            "fullDescription": "An intimate gathering of 9 lawyers focused on open dialogue, sharing experiences, and understanding the realities of legal practice beyond formal environments.",
            "highlights": [],
            "venue": "Venue not specified",
            "time": "Not specified",
        },
        {
            "slug": "tlp-conclave-2",
            "journeyIndex": 2,
            "journeyMeta": "25 April 2026 • Samrat Hotel, New Delhi",
            "title": "2nd TLP Conclave",
            "date": "25 April 2026",
            "status": "past",
            "attendees": "15",
            "description": "Expanded to 15 lawyers—with conversations over tea or coffee, where discussions flowed naturally and connections were built effortlessly.",
            "fullDescription": "Expanded to 15 lawyers—with conversations over tea or coffee, where discussions flowed naturally and connections were built effortlessly.",
            "highlights": [],
            "venue": "Samrat Hotel, New Delhi",
            "time": "Not specified",
        },
    ]

    for item in tlp_conclaves:
        ts = now_iso()
        await conclaves_col.update_one(
            {"slug": item["slug"]},
            {"$set": {**item, "updatedAt": ts}, "$setOnInsert": {"createdAt": ts}},
            upsert=True,
        )

    articles_col = db["articles"]

    # Idempotent seed for baseline articles (avoid frontend hardcoding).
    await articles_col.create_index("seedKey", unique=True, sparse=True)
    await articles_col.delete_many(
        {
            "title": {
                "$in": [
                    "Understanding Your Rights in Consumer Disputes",
                    "Update: Free Legal Aid Camp (This Weekend)",
                    "Corporate Compliance Checklist for Startups",
                ]
            }
        }
    )

    seed_articles = [
        {
            "seedKey": "article-ip-mistakes-startups",
            "title": "5 Common IP Mistakes Startups Make (And How to Avoid Them)",
            "summary": "Common intellectual-property pitfalls for startups and practical steps to avoid them, from audits and assignments to timing, searches, and international strategy.",
            "kind": "article",
            "status": "published",
            "thumbnailUrl": None,
            "externalUrl": None,
            "content": (
                "In the dynamic world of startups, intellectual property (IP) often becomes an overlooked asset until it's too late. Neglecting IP can lead to costly legal battles, loss of competitive advantage, and diminished investor confidence. Understanding and proactively managing IP is crucial for safeguarding your startup's innovations and brand identity.\n\n"
                "1. Failing to Identify and Protect Existing IP Assets\n"
                "The Mistake: Many startups overlook the IP they already possess, such as unique software code, branding elements, or proprietary processes.\n"
                "Why It Matters: Unrecognized IP can be inadvertently exposed or unprotected, leading to potential theft or loss of exclusive rights.\n"
                "How to Avoid It: Conduct a comprehensive IP audit early in your startup journey. Identify all potential IP assets and consult with IP professionals to determine the best protection strategies, whether through patents, trademarks, copyrights, or trade secrets.\n\n"
                "2. Inadequate IP Assignment Agreements\n"
                "The Mistake: Assuming that IP created by employees or contractors automatically belongs to the company.\n"
                "Why It Matters: Without clear agreements, individuals may retain rights to critical IP, leading to disputes or loss of control over essential assets.\n"
                "How to Avoid It: Implement robust IP assignment clauses in all employment and contractor agreements. Ensure that any IP developed is explicitly assigned to the company, preventing future ownership conflicts.\n\n"
                "3. Public Disclosure Before Securing IP Protection\n"
                "The Mistake: Revealing product details or innovations publicly before filing for IP protection.\n"
                "Why It Matters: Public disclosure can jeopardize the novelty requirement for patents and may forfeit the ability to secure protection in certain jurisdictions.\n"
                "How to Avoid It: File for the appropriate IP protection before any public disclosure, including pitches, publications, or product launches. Use non-disclosure agreements (NDAs) when discussing sensitive information with third parties.\n\n"
                "4. Neglecting Comprehensive IP Searches\n"
                "The Mistake: Failing to conduct thorough searches to ensure your IP doesn't infringe on existing rights.\n"
                "Why It Matters: Infringing on another's IP can lead to legal disputes, financial penalties, and the need to rebrand or redesign products.\n"
                "How to Avoid It: Perform detailed patent, trademark, and design searches before finalizing product designs or branding. This proactive approach helps avoid infringement issues and informs your IP strategy.\n\n"
                "5. Overlooking International IP Protection\n"
                "The Mistake: Securing IP rights only in the domestic market, ignoring international considerations.\n"
                "Why It Matters: As your startup grows, entering new markets without IP protection can expose you to infringement and limit your ability to operate globally.\n"
                "How to Avoid It: Develop an international IP strategy aligned with your business expansion plans. Consider using international treaties and agreements to streamline the process of securing IP rights in multiple jurisdictions.\n\n"
                "Conclusion\n"
                "Intellectual property is a cornerstone of a startup's value and competitive edge. By proactively identifying, protecting, and managing IP assets, startups can avoid common pitfalls that hinder growth and success. Engaging with IP professionals and integrating IP considerations into your business strategy ensures that your innovations remain secure and your startup is positioned for long-term success."
            ),
        },
        {
            "seedKey": "article-affirmative-action-quotas-ews",
            "title": "Affirmative Action & Quotas – Review petitions pending on EWS and other reservation policies",
            "summary": "A legal explainer on the EWS quota after Janhit Abhiyan (2022), the status of review petitions, and ongoing implementation litigation in High Courts.",
            "kind": "article",
            "status": "published",
            "thumbnailUrl": None,
            "externalUrl": None,
            "content": (
                "Introduction\n"
                "The last decade has seen seismic shifts in Indian affirmative-action law. The One Hundred and Third Constitutional Amendment (2019) — which created a 10% reservation for Economically Weaker Sections (EWS) in education and public employment — produced one of the Supreme Court’s most contested reservation rulings in recent years. The constitutional questions it raised (and attendant litigation) sit at the intersection of Article 14, Articles 15 & 16, the “basic structure” doctrine, and the Court’s earlier reservation jurisprudence (notably Indra Sawhney). This article explains the legal background, summarizes the controlling Supreme Court disposition, describes the state of review/implementation litigation, analyzes unresolved issues, and outlines likely routes for further challenge or reform.\n\n"
                "1. Legal background — principles that govern reservation law\n"
                "Social vs. economic backwardness. Historically, the Court has treated reservation as a remedy for “socially and educationally backward” classes (caste-based disadvantage, structural social exclusion). Indra Sawhney v. Union of India (Mandal case) cemented this approach and framed important limits on affirmative action. The Mandal judgment also enunciated the “creamy layer” concept (for OBCs) and accepted a rough 50% ceiling on total quotas as a guiding principle.\n"
                "Parliament’s 103rd Amendment (EWS). Parliament added Articles 15(6) and 16(6), authorising up to 10% reservation for economically weaker citizens, excluding SCs/STs/OBCs from that 10% slot. That shift raised the legal question whether reservation could be founded solely on economic criteria and whether the 50% ceiling is inviolable.\n\n"
                "2. The Supreme Court’s ruling (Janhit Abhiyan v. Union of India) — the controlling decision\n"
                "A five-judge bench delivered a split, but controlling, judgment in Janhit Abhiyan v. Union of India (decided Nov. 7, 2022). The Court (by a 3:2 majority) upheld the constitutional validity of the 103rd Amendment and approved a 10% EWS quota, holding that the Constitution permits reservation on economic grounds and that the Amendment did not violate the basic structure in the majority’s view. The judgment is fact-rich and fragmented — multiple separate opinions — and the dissenting judges expressed strong reservations about excluding historically disadvantaged classes (SC/ST/OBC) from EWS and about relying solely on economic criteria.\n"
                "Load-bearing points (from the judgment and its aftermath):\n"
                "The majority accepted that economic criteria can be a valid basis for classification for reservation.\n"
                "The Court did not treat the 50% ceiling as an absolute, inflexible constitutional limit in the way Indra Sawhney had suggested; the majority allowed some flexibility while noting contextual restraints.\n\n"
                "3. Review petitions and their disposition — what remains pending?\n"
                "Review petitions to the Supreme Court: Following the Janhit Abhiyan judgment, review petitions were filed. The Supreme Court considered (and in many reported instances refused) to re-open the core holding. In mid-May 2023 the Court dismissed a clutch of review petitions seeking reconsideration of the 10% EWS ruling. The dismissal curtailed one obvious avenue of immediate challenge at the apex level.\n"
                "Ongoing litigation on implementation and collateral issues: Even though the apex court upheld the Amendment, litigation continues on numerous implementation questions — for example:\n"
                "Age-relaxation and related rules: High Courts have considered (and in some cases reversed or limited) EWS-related relaxations in recruitment notifications.\n"
                "Applicability in running recruitments/retrospective effect: Several High Courts have refused to apply EWS to recruitment processes already underway or completed where the application forms did not collect EWS status.\n"
                "Other reservation policy litigation: Separately, the Court’s recent interventions on subclassification within SC/ST quotas and other structural reforms produced review petitions that the Court has disposed of or declined to re-open.\n\n"
                "4. Why petitions persist despite the apex judgment — legal and practical fault lines\n"
                "Fragmented reasoning and narrow majorities. A 3:2 split and multiple separate opinions leave open interpretative ambiguities — e.g., range of permissible economic tests, whether states may combine EWS with other quotas, and whether the “exclusion” of SC/ST/OBC from EWS withstands all possible factual permutations. Those ambiguities incentivize further litigation.\n"
                "Implementation details create justiciable disputes. What counts as an “EWS” qualification for a given recruitment — income cutoffs, asset tests, proof, interaction with existing relaxations (age, fees), and retrospective application — produce high-stakes litigation at High Court level.\n"
                "Policy churn at state level. States may adopt differing approaches to EWS or to other quota expansions leading to fresh challenges under Indra Sawhney principles (50% ceiling debates) and under Article 14.\n\n"
                "5. Strategic legal avenues open to litigants and the Court\n"
                "Curative petitions and further review at the Supreme Court: Given that the apex court has already dismissed several review pleas, curative petitions (rare and narrowly entertained) remain theoretically available, but the hurdle is very high.\n"
                "Targeted challenges to implementation rules: Litigants frequently obtain relief by challenging specific rules framed in exercise of the Amendment — e.g., the exact income threshold, asset tests, eligibility documentation, or exclusion rules — on grounds of arbitrariness, unequal treatment, or failure to follow delegated-legislation norms.\n"
                "Legislative options: Parliament or state legislatures can refine the statutory/regulatory architecture for EWS, reducing litigation by clear, evidence-based rules.\n"
                "Policy reform — using data to justify deviations from the “50%” benchmark: If governments wish to expand affirmative action beyond traditional ceilings, they will need robust empirical demonstrations of extraordinary circumstances.\n\n"
                "6. Practical recommendations for practitioners, litigants and policy-makers\n"
                "For petitioners (challenging EWS measures): Focus on discrete implementation defects rather than re-litigating settled constitutional lines unless new, compelling reasoning or factual matrices are available.\n"
                "For respondents/government bodies: Bring detailed rule-making records into the record — socio-economic data, reasoned explanations for income/asset thresholds, and consistent verification mechanisms.\n"
                "For the Supreme Court: A larger bench referral on whether economic criteria alone are constitutionally permissible in all contexts, and the doctrinal status of the 50% ceiling, could provide long-term clarity.\n\n"
                "7. Concluding observations\n"
                "The Janhit Abhiyan decision changed the legal landscape by validating a constitutionally authorised EWS quota; yet a mix of doctrinal division at the apex and a flood of implementation litigation means the law remains unsettled at the margins. Many review petitions that sought wholesale reversal were dismissed, but high-stakes questions about implementation, the interaction of EWS with existing quotas, and the broader normative story of affirmative action in India continue to animate courts and legislatures. For now the litigation strategy most likely to succeed is focused, evidence-driven challenge to specific rules and practices rather than broad constitutional re-argument — unless a clear vehicle for a larger bench is carved out."
            ),
        },
        {
            "seedKey": "article-amazon-one-click-patent",
            "title": "Amazon One-Click Patent Case – Functional or Too Generic?",
            "summary": "A look at Amazon’s One-Click patent controversy, the functionality vs. abstraction debate, key litigation, and why it would likely fail under India’s Section 3(k).",
            "kind": "article",
            "status": "published",
            "thumbnailUrl": None,
            "externalUrl": None,
            "content": (
                "In the late 1990s, Amazon revolutionized the way consumers shopped online by introducing its “One-Click” ordering system—a technology that allowed customers to make purchases with a single action, bypassing the traditional multi-step checkout process. The company secured a U.S. patent for this innovation in 1999 (U.S. Patent No. 5,960,411), sparking one of the most debated discussions in intellectual property law:\n"
                "Can a simple business method, seemingly generic, qualify for patent protection?\n\n"
                "The controversy surrounding the Amazon One-Click patent lies at the intersection of functionality and generality. While some hailed it as a pioneering e-commerce mechanism deserving protection, critics condemned it as overly broad, stifling competition and innovation.\n\n"
                "In India, under Section 3(k) of the Patents Act, 1970, business methods and algorithms per se are not patentable. A case like “One-Click” would most likely be rejected here as too generic and falling under excluded subject matter.\n\n"
                "Amazon’s One-Click patent essentially covered the process of:\n"
                "Storing a customer’s billing and shipping information.\n"
                "Allowing repeat purchases with a single click, without re-entering data.\n\n"
                "The functional aspect was clear: streamlining online transactions and enhancing user convenience. However, opponents argued that the patent was too generic, as the method relied on existing technologies such as cookies and database management, which were not themselves novel.\n\n"
                "In the year 1999, Amazon sued Barnes & Noble for infringing its One-Click patent through the latter’s “Express Lane” feature.\n"
                "The U.S. Court of Appeals for the Federal Circuit initially upheld an injunction against Barnes & Noble, preventing it from using the system.\n"
                "However, prolonged litigation and subsequent patent challenges questioned whether Amazon’s patent truly involved a non-obvious inventive step. This case drew sharp attention to the validity of business method patents, especially those that seemed to monopolize common place digital functions.\n\n"
                "The central question is whether the One-Click patent represented a functional technological improvement or merely a generic idea applied online.\n\n"
                "Arguments for Functionality\n"
                "It provided a practical solution to a specific problem in e-commerce: repetitive and time-consuming checkout processes.\n"
                "By enhancing user experience, it arguably promoted growth in online retail.\n"
                "Courts initially acknowledged the innovation as more than an abstract idea.\n\n"
                "Arguments for Genericness\n"
                "The system primarily relied on known tools (cookies, stored user data) arranged in a predictable manner.\n"
                "Granting exclusive rights risked monopolizing a basic commercial practice, hindering competitors from adopting similar convenience features.\n"
                "Following the Supreme Court’s stricter approach to patent eligibility in Alice Corp. v. CLS Bank International (2014), many scholars argue the One-Click patent would likely not withstand scrutiny today.\n\n"
                "Policy Implications\n"
                "The Amazon One-Click case highlighted the tension between protecting genuine innovation and preventing overbroad monopolies. On one hand, granting patents for pioneering digital tools incentivizes businesses to invest in novel solutions. On the other, if patents are too broad, they can suppress competition and innovation in rapidly evolving fields like e-commerce and fintech. Ultimately, the patent expired in 2017, and the technology became public domain, opening the way for widespread adoption of single-click and frictionless payment systems.\n\n"
                "Conclusion\n"
                "The Amazon One-Click patent remains a landmark in the debate over functional innovation versus generic abstraction in patent law. While Amazon successfully leveraged it to dominate early e-commerce, legal scholars and practitioners continue to question whether it deserved patent protection in the first place. In retrospect, the case underscores the importance of balancing innovation incentives with fair competition, particularly in the digital era where seemingly simple ideas can have profound commercial impact."
            ),
        },
    ]

    for item in seed_articles:
        ts = now_iso()
        await articles_col.update_one(
            {"seedKey": item["seedKey"]},
            {"$set": {**item, "updatedAt": ts}, "$setOnInsert": {"createdAt": ts}},
            upsert=True,
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


@app.get("/internal/ping")
async def internal_ping(request: Request) -> Dict[str, Any]:
    global _last_ping_time

    # Validate secret if set
    if PING_SECRET:
        incoming = request.headers.get("x-ping-secret")
        if incoming != PING_SECRET:
            raise HTTPException(status_code=401, detail="Unauthorized")

    now = datetime.now(timezone.utc)

    # Rate limiting: ignore if ping received too frequently (< 10 seconds)
    if _last_ping_time and (now - _last_ping_time).total_seconds() < 10:
        return {"ok": True, "skipped": True, "time": now.isoformat()}

    _last_ping_time = now
    ts = now.isoformat()

    # Log ping for debugging/monitoring
    print(f"PING received at {ts}")

    return {"ok": True, "time": ts, "service": "lawerpedia"}


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
            **body.model_dump(exclude_none=True),
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
                **body.model_dump(exclude_none=True),
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
