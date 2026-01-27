from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'homeview-pro-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
ADMIN_SECRET = os.environ.get('ADMIN_SECRET', 'admin-secret-2024')

# Resend Email (optional)
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://homeview-pro.preview.emergentagent.com')

app = FastAPI(title="HomeView Pro API")
api_router = APIRouter(prefix="/api")
admin_router = APIRouter(prefix="/api/admin")
security = HTTPBearer()

# ==================== PACKAGES ====================

PACKAGES = {
    "starter": {
        "name": "Başlangıç Paketi",
        "price": 700,
        "property_limit": 10,
        "features": ["regular_photos", "mapping", "company_name", "sun_simulation"],
        "has_360": False
    },
    "premium": {
        "name": "Premium Paket",
        "price": 1000,
        "property_limit": 50,
        "features": ["regular_photos", "360_photos", "mapping", "poi", "property_details", "company_name", "sun_simulation"],
        "has_360": True
    },
    "ultra": {
        "name": "Ultra Paket",
        "price": 2000,
        "property_limit": -1,  # unlimited
        "features": ["regular_photos", "360_photos", "mapping", "poi", "property_details", "company_name", "sun_simulation"],
        "has_360": True
    }
}

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    company_name: str
    phone: str
    package: str  # starter, premium, ultra
    auto_payment: bool = False

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    company_name: str
    phone: Optional[str] = None
    package: str
    package_name: str
    property_limit: int
    property_count: int
    has_360: bool
    subscription_status: str
    subscription_end: Optional[str] = None
    auto_payment: bool
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

class PaymentCreate(BaseModel):
    user_id: str
    amount: float
    package: str

class PaymentResponse(BaseModel):
    id: str
    user_id: str
    amount: float
    package: str
    status: str
    payment_date: str
    next_payment_date: Optional[str] = None

# Room/Floor Models for Mapping System
class RoomData(BaseModel):
    id: str
    name: str
    room_type: str  # living_room, bedroom, kitchen, bathroom, etc.
    position_x: int
    position_y: int
    floor: int = 0
    square_meters: Optional[float] = None
    facing_direction: Optional[str] = None
    photos: List[str] = []  # base64 encoded
    panorama_photo: Optional[str] = None  # for 360
    connections: List[str] = []  # connected room IDs

class PropertyCreate(BaseModel):
    title: str
    description: Optional[str] = None
    address: str
    city: str
    district: str
    square_meters: float
    room_count: str
    property_type: str = "single"  # single, duplex, triplex
    floor: int
    total_floors: int
    building_age: int
    heating_type: str
    facing_direction: str
    price: float
    currency: str = "TRY"
    view_type: str = "regular"  # regular or 360
    rooms: List[RoomData] = []
    entry_room_id: Optional[str] = None
    pois: List[Dict] = []
    cover_image: Optional[str] = None

class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    square_meters: Optional[float] = None
    room_count: Optional[str] = None
    property_type: Optional[str] = None
    floor: Optional[int] = None
    total_floors: Optional[int] = None
    building_age: Optional[int] = None
    heating_type: Optional[str] = None
    facing_direction: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    view_type: Optional[str] = None
    rooms: Optional[List[RoomData]] = None
    entry_room_id: Optional[str] = None
    pois: Optional[List[Dict]] = None
    cover_image: Optional[str] = None

class PropertyResponse(BaseModel):
    id: str
    user_id: str
    company_name: str
    title: str
    description: Optional[str] = None
    address: str
    city: str
    district: str
    square_meters: float
    room_count: str
    property_type: str
    floor: int
    total_floors: int
    building_age: int
    heating_type: str
    facing_direction: str
    price: float
    currency: str
    view_type: str
    rooms: List[RoomData] = []
    entry_room_id: Optional[str] = None
    pois: List[Dict] = []
    cover_image: Optional[str] = None
    view_count: int = 0
    total_view_duration: int = 0
    created_at: str
    updated_at: str
    share_link: str

class VisitorCreate(BaseModel):
    property_id: str
    first_name: str
    last_name: str
    phone: str

class VisitorResponse(BaseModel):
    id: str
    property_id: str
    first_name: str
    last_name: str
    phone: str
    visit_count: int
    total_duration: int
    last_visit: str
    created_at: str

class VisitCreate(BaseModel):
    property_id: str
    visitor_id: str
    duration: int
    rooms_visited: List[str] = []

# Admin Models
class AdminLogin(BaseModel):
    email: str
    password: str

class AdminUserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company_name: Optional[str] = None
    phone: Optional[str] = None
    package: Optional[str] = None
    subscription_status: Optional[str] = None
    subscription_end: Optional[str] = None

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, is_admin: bool = False) -> str:
    payload = {
        "sub": user_id,
        "is_admin": is_admin,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Geçersiz token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token süresi dolmuş")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Geçersiz token")

async def get_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if not payload.get("is_admin"):
            raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
        
        admin_id = payload.get("sub")
        admin = await db.admins.find_one({"id": admin_id}, {"_id": 0, "password": 0})
        if not admin:
            raise HTTPException(status_code=401, detail="Admin bulunamadı")
        return admin
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token süresi dolmuş")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Geçersiz token")

# ==================== EMAIL HELPER ====================

async def send_email(to_email: str, subject: str, html_content: str):
    if not RESEND_API_KEY:
        logging.info(f"[MOCK EMAIL] To: {to_email}, Subject: {subject}")
        return {"id": "mock-" + str(uuid.uuid4())}
    
    try:
        import resend
        resend.api_key = RESEND_API_KEY
        params = {
            "from": SENDER_EMAIL,
            "to": [to_email],
            "subject": subject,
            "html": html_content
        }
        result = await asyncio.to_thread(resend.Emails.send, params)
        return result
    except Exception as e:
        logging.error(f"Email send failed: {e}")
        raise HTTPException(status_code=500, detail="E-posta gönderilemedi")

# ==================== AUTH ROUTES ====================

@api_router.get("/packages")
async def get_packages():
    return PACKAGES

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Bu email zaten kayıtlı")
    
    if user_data.package not in PACKAGES:
        raise HTTPException(status_code=400, detail="Geçersiz paket")
    
    package_info = PACKAGES[user_data.package]
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "company_name": user_data.company_name,
        "phone": user_data.phone,
        "package": user_data.package,
        "auto_payment": user_data.auto_payment,
        "subscription_status": "pending",  # pending until payment
        "subscription_end": None,
        "property_count": 0,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Return user data for payment flow
    return {
        "user_id": user_id,
        "email": user_data.email,
        "package": user_data.package,
        "package_name": package_info["name"],
        "amount": package_info["price"],
        "message": "Kayıt oluşturuldu. Ödeme bekleniyor."
    }

@api_router.post("/auth/complete-payment")
async def complete_payment(payment_data: PaymentCreate):
    """Called after successful iyzico payment (MOCK for now)"""
    user = await db.users.find_one({"id": payment_data.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    now = datetime.now(timezone.utc)
    subscription_end = now + timedelta(days=30)
    
    # Create payment record
    payment_id = str(uuid.uuid4())
    payment_doc = {
        "id": payment_id,
        "user_id": payment_data.user_id,
        "amount": payment_data.amount,
        "package": payment_data.package,
        "status": "completed",
        "payment_date": now.isoformat(),
        "next_payment_date": subscription_end.isoformat()
    }
    await db.payments.insert_one(payment_doc)
    
    # Update user subscription
    await db.users.update_one(
        {"id": payment_data.user_id},
        {
            "$set": {
                "subscription_status": "active",
                "subscription_end": subscription_end.isoformat(),
                "updated_at": now.isoformat()
            }
        }
    )
    
    # Generate token and return
    token = create_token(payment_data.user_id)
    updated_user = await db.users.find_one({"id": payment_data.user_id}, {"_id": 0, "password": 0})
    package_info = PACKAGES[updated_user["package"]]
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=updated_user["id"],
            email=updated_user["email"],
            first_name=updated_user["first_name"],
            last_name=updated_user["last_name"],
            company_name=updated_user["company_name"],
            phone=updated_user.get("phone"),
            package=updated_user["package"],
            package_name=package_info["name"],
            property_limit=package_info["property_limit"],
            property_count=updated_user.get("property_count", 0),
            has_360=package_info["has_360"],
            subscription_status=updated_user["subscription_status"],
            subscription_end=updated_user.get("subscription_end"),
            auto_payment=updated_user.get("auto_payment", False),
            created_at=updated_user["created_at"]
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Email veya şifre hatalı")
    
    if user.get("subscription_status") != "active":
        raise HTTPException(status_code=403, detail="Aboneliğiniz aktif değil. Lütfen ödeme yapın.")
    
    # Check subscription expiry
    if user.get("subscription_end"):
        end_date = datetime.fromisoformat(user["subscription_end"])
        if end_date < datetime.now(timezone.utc):
            await db.users.update_one({"id": user["id"]}, {"$set": {"subscription_status": "expired"}})
            raise HTTPException(status_code=403, detail="Aboneliğiniz sona erdi. Lütfen yenileyin.")
    
    token = create_token(user["id"])
    package_info = PACKAGES[user["package"]]
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            first_name=user["first_name"],
            last_name=user["last_name"],
            company_name=user["company_name"],
            phone=user.get("phone"),
            package=user["package"],
            package_name=package_info["name"],
            property_limit=package_info["property_limit"],
            property_count=user.get("property_count", 0),
            has_360=package_info["has_360"],
            subscription_status=user["subscription_status"],
            subscription_end=user.get("subscription_end"),
            auto_payment=user.get("auto_payment", False),
            created_at=user["created_at"]
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    package_info = PACKAGES[current_user["package"]]
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        first_name=current_user["first_name"],
        last_name=current_user["last_name"],
        company_name=current_user["company_name"],
        phone=current_user.get("phone"),
        package=current_user["package"],
        package_name=package_info["name"],
        property_limit=package_info["property_limit"],
        property_count=current_user.get("property_count", 0),
        has_360=package_info["has_360"],
        subscription_status=current_user["subscription_status"],
        subscription_end=current_user.get("subscription_end"),
        auto_payment=current_user.get("auto_payment", False),
        created_at=current_user["created_at"]
    )

@api_router.post("/auth/forgot-password")
async def forgot_password(request: PasswordResetRequest):
    user = await db.users.find_one({"email": request.email})
    if not user:
        # Don't reveal if email exists
        return {"message": "Şifre sıfırlama linki e-posta adresinize gönderildi."}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    expiry = datetime.now(timezone.utc) + timedelta(hours=1)
    
    await db.password_resets.insert_one({
        "user_id": user["id"],
        "token": reset_token,
        "expires_at": expiry.isoformat(),
        "used": False
    })
    
    reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"
    html_content = f"""
    <h2>Şifre Sıfırlama</h2>
    <p>Merhaba {user['first_name']},</p>
    <p>Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:</p>
    <a href="{reset_link}" style="background-color:#064E3B;color:white;padding:12px 24px;text-decoration:none;border-radius:25px;display:inline-block;">Şifremi Sıfırla</a>
    <p>Bu link 1 saat geçerlidir.</p>
    <p>Bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
    """
    
    await send_email(request.email, "HomeView Pro - Şifre Sıfırlama", html_content)
    
    return {"message": "Şifre sıfırlama linki e-posta adresinize gönderildi."}

@api_router.post("/auth/reset-password")
async def reset_password(request: PasswordResetConfirm):
    reset_record = await db.password_resets.find_one({
        "token": request.token,
        "used": False
    })
    
    if not reset_record:
        raise HTTPException(status_code=400, detail="Geçersiz veya kullanılmış token")
    
    expiry = datetime.fromisoformat(reset_record["expires_at"])
    if expiry < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Token süresi dolmuş")
    
    # Update password
    await db.users.update_one(
        {"id": reset_record["user_id"]},
        {"$set": {"password": hash_password(request.new_password)}}
    )
    
    # Mark token as used
    await db.password_resets.update_one(
        {"token": request.token},
        {"$set": {"used": True}}
    )
    
    return {"message": "Şifreniz başarıyla güncellendi."}

# ==================== PROPERTY ROUTES ====================

@api_router.post("/properties", response_model=PropertyResponse)
async def create_property(property_data: PropertyCreate, current_user: dict = Depends(get_current_user)):
    package_info = PACKAGES[current_user["package"]]
    property_count = current_user.get("property_count", 0)
    
    # Check property limit
    if package_info["property_limit"] != -1 and property_count >= package_info["property_limit"]:
        raise HTTPException(status_code=403, detail=f"Paket limitinize ulaştınız ({package_info['property_limit']} gayrimenkul)")
    
    # Check 360 access
    if property_data.view_type == "360" and not package_info["has_360"]:
        raise HTTPException(status_code=403, detail="360° görüntüleme için Premium veya Ultra pakete yükseltin")
    
    property_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    property_doc = {
        "id": property_id,
        "user_id": current_user["id"],
        "company_name": current_user["company_name"],
        **property_data.model_dump(),
        "view_count": 0,
        "total_view_duration": 0,
        "created_at": now,
        "updated_at": now,
        "share_link": f"/view/{property_id}"
    }
    
    await db.properties.insert_one(property_doc)
    
    # Update user property count
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$inc": {"property_count": 1}}
    )
    
    return PropertyResponse(**{k: v for k, v in property_doc.items() if k != "_id"})

@api_router.get("/properties", response_model=List[PropertyResponse])
async def get_user_properties(current_user: dict = Depends(get_current_user)):
    properties = await db.properties.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(200)
    
    return [PropertyResponse(**p) for p in properties]

@api_router.get("/properties/{property_id}", response_model=PropertyResponse)
async def get_property(property_id: str):
    property_doc = await db.properties.find_one({"id": property_id}, {"_id": 0})
    if not property_doc:
        raise HTTPException(status_code=404, detail="Gayrimenkul bulunamadı")
    return PropertyResponse(**property_doc)

@api_router.put("/properties/{property_id}", response_model=PropertyResponse)
async def update_property(
    property_id: str,
    property_data: PropertyUpdate,
    current_user: dict = Depends(get_current_user)
):
    property_doc = await db.properties.find_one({"id": property_id})
    if not property_doc:
        raise HTTPException(status_code=404, detail="Gayrimenkul bulunamadı")
    
    if property_doc["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Bu gayrimenkulü düzenleme yetkiniz yok")
    
    update_data = {k: v for k, v in property_data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.properties.update_one({"id": property_id}, {"$set": update_data})
    
    updated = await db.properties.find_one({"id": property_id}, {"_id": 0})
    return PropertyResponse(**updated)

@api_router.delete("/properties/{property_id}")
async def delete_property(property_id: str, current_user: dict = Depends(get_current_user)):
    property_doc = await db.properties.find_one({"id": property_id})
    if not property_doc:
        raise HTTPException(status_code=404, detail="Gayrimenkul bulunamadı")
    
    if property_doc["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Bu gayrimenkulü silme yetkiniz yok")
    
    await db.properties.delete_one({"id": property_id})
    await db.visitors.delete_many({"property_id": property_id})
    await db.visits.delete_many({"property_id": property_id})
    
    # Update user property count
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$inc": {"property_count": -1}}
    )
    
    return {"message": "Gayrimenkul başarıyla silindi"}

# ==================== VISITOR ROUTES ====================

@api_router.post("/visitors/register", response_model=VisitorResponse)
async def register_visitor(visitor_data: VisitorCreate):
    """Register visitor before viewing property"""
    property_doc = await db.properties.find_one({"id": visitor_data.property_id})
    if not property_doc:
        raise HTTPException(status_code=404, detail="Gayrimenkul bulunamadı")
    
    # Check if visitor already registered for this property
    existing = await db.visitors.find_one({
        "property_id": visitor_data.property_id,
        "phone": visitor_data.phone
    })
    
    if existing:
        # Update visit count
        await db.visitors.update_one(
            {"id": existing["id"]},
            {
                "$inc": {"visit_count": 1},
                "$set": {"last_visit": datetime.now(timezone.utc).isoformat()}
            }
        )
        updated = await db.visitors.find_one({"id": existing["id"]}, {"_id": 0})
        return VisitorResponse(**updated)
    
    visitor_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    visitor_doc = {
        "id": visitor_id,
        "property_id": visitor_data.property_id,
        "user_id": property_doc["user_id"],  # Property owner
        "first_name": visitor_data.first_name,
        "last_name": visitor_data.last_name,
        "phone": visitor_data.phone,
        "visit_count": 1,
        "total_duration": 0,
        "rooms_visited": [],
        "last_visit": now,
        "created_at": now
    }
    
    await db.visitors.insert_one(visitor_doc)
    
    return VisitorResponse(**{k: v for k, v in visitor_doc.items() if k != "_id"})

@api_router.post("/visits")
async def record_visit(visit_data: VisitCreate):
    """Record visit duration and rooms visited"""
    # Update property stats
    await db.properties.update_one(
        {"id": visit_data.property_id},
        {
            "$inc": {
                "view_count": 1,
                "total_view_duration": visit_data.duration
            }
        }
    )
    
    # Update visitor stats
    await db.visitors.update_one(
        {"id": visit_data.visitor_id},
        {
            "$inc": {"total_duration": visit_data.duration},
            "$addToSet": {"rooms_visited": {"$each": visit_data.rooms_visited}},
            "$set": {"last_visit": datetime.now(timezone.utc).isoformat()}
        }
    )
    
    # Create visit record
    visit_id = str(uuid.uuid4())
    visit_doc = {
        "id": visit_id,
        "property_id": visit_data.property_id,
        "visitor_id": visit_data.visitor_id,
        "duration": visit_data.duration,
        "rooms_visited": visit_data.rooms_visited,
        "visited_at": datetime.now(timezone.utc).isoformat()
    }
    await db.visits.insert_one(visit_doc)
    
    return {"message": "Ziyaret kaydedildi"}

@api_router.get("/properties/{property_id}/visitors", response_model=List[VisitorResponse])
async def get_property_visitors(property_id: str, current_user: dict = Depends(get_current_user)):
    property_doc = await db.properties.find_one({"id": property_id})
    if not property_doc:
        raise HTTPException(status_code=404, detail="Gayrimenkul bulunamadı")
    
    if property_doc["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Erişim yetkiniz yok")
    
    visitors = await db.visitors.find(
        {"property_id": property_id},
        {"_id": 0}
    ).sort("last_visit", -1).to_list(100)
    
    return [VisitorResponse(**v) for v in visitors]

@api_router.get("/analytics")
async def get_analytics(current_user: dict = Depends(get_current_user)):
    properties = await db.properties.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).to_list(200)
    
    property_ids = [p["id"] for p in properties]
    
    total_views = sum(p.get("view_count", 0) for p in properties)
    total_duration = sum(p.get("total_view_duration", 0) for p in properties)
    avg_duration = total_duration / total_views if total_views > 0 else 0
    
    # Get all visitors for user's properties
    visitors = await db.visitors.find(
        {"property_id": {"$in": property_ids}},
        {"_id": 0}
    ).sort("last_visit", -1).to_list(100)
    
    # Daily views (last 30 days)
    thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    visits = await db.visits.find({
        "property_id": {"$in": property_ids},
        "visited_at": {"$gte": thirty_days_ago}
    }, {"_id": 0}).to_list(1000)
    
    daily_views = {}
    for visit in visits:
        date = visit["visited_at"][:10]
        daily_views[date] = daily_views.get(date, 0) + 1
    
    daily_views_list = [{"date": k, "views": v} for k, v in sorted(daily_views.items())]
    
    # Top properties
    top_properties = sorted(properties, key=lambda x: x.get("view_count", 0), reverse=True)[:5]
    
    return {
        "total_views": total_views,
        "total_duration": total_duration,
        "avg_duration": avg_duration,
        "total_visitors": len(visitors),
        "daily_views": daily_views_list,
        "top_properties": [{
            "id": p["id"],
            "title": p["title"],
            "views": p.get("view_count", 0),
            "avg_duration": p.get("total_view_duration", 0) / max(p.get("view_count", 1), 1)
        } for p in top_properties],
        "recent_visitors": visitors[:10]
    }

# ==================== ADMIN ROUTES ====================

@admin_router.post("/login")
async def admin_login(data: AdminLogin):
    admin = await db.admins.find_one({"email": data.email})
    if not admin or not verify_password(data.password, admin["password"]):
        raise HTTPException(status_code=401, detail="Geçersiz kimlik bilgileri")
    
    token = create_token(admin["id"], is_admin=True)
    return {"access_token": token, "token_type": "bearer"}

@admin_router.get("/users")
async def admin_get_users(admin: dict = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).sort("created_at", -1).to_list(500)
    return users

@admin_router.get("/users/{user_id}")
async def admin_get_user(user_id: str, admin: dict = Depends(get_admin_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    # Get payment history
    payments = await db.payments.find({"user_id": user_id}, {"_id": 0}).sort("payment_date", -1).to_list(50)
    
    return {**user, "payments": payments}

@admin_router.put("/users/{user_id}")
async def admin_update_user(user_id: str, data: AdminUserUpdate, admin: dict = Depends(get_admin_user)):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.users.update_one({"id": user_id}, {"$set": update_data})
    
    updated = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    return updated

@admin_router.get("/payments")
async def admin_get_payments(admin: dict = Depends(get_admin_user)):
    payments = await db.payments.find({}, {"_id": 0}).sort("payment_date", -1).to_list(500)
    return payments

@admin_router.get("/stats")
async def admin_get_stats(admin: dict = Depends(get_admin_user)):
    total_users = await db.users.count_documents({})
    active_users = await db.users.count_documents({"subscription_status": "active"})
    total_properties = await db.properties.count_documents({})
    total_payments = await db.payments.count_documents({})
    
    # Revenue calculation
    payments = await db.payments.find({"status": "completed"}, {"_id": 0}).to_list(1000)
    total_revenue = sum(p.get("amount", 0) for p in payments)
    
    # Package distribution
    starter_count = await db.users.count_documents({"package": "starter"})
    premium_count = await db.users.count_documents({"package": "premium"})
    ultra_count = await db.users.count_documents({"package": "ultra"})
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_properties": total_properties,
        "total_payments": total_payments,
        "total_revenue": total_revenue,
        "package_distribution": {
            "starter": starter_count,
            "premium": premium_count,
            "ultra": ultra_count
        }
    }

# ==================== SETUP ADMIN ====================

@api_router.post("/setup-admin")
async def setup_admin():
    """One-time admin setup - remove in production"""
    existing = await db.admins.find_one({"email": "admin@homeviewpro.com"})
    if existing:
        raise HTTPException(status_code=400, detail="Admin zaten mevcut")
    
    admin_id = str(uuid.uuid4())
    admin_doc = {
        "id": admin_id,
        "email": "admin@homeviewpro.com",
        "password": hash_password("AdminHVP2024!"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.admins.insert_one(admin_doc)
    
    return {"message": "Admin oluşturuldu", "email": "admin@homeviewpro.com"}

# ==================== HEALTH CHECK ====================

@api_router.get("/")
async def root():
    return {"message": "HomeView Pro API", "status": "running", "version": "2.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include routers
app.include_router(api_router)
app.include_router(admin_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
