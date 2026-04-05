from sqlalchemy import Column, String, Boolean, DateTime, Text, Float, Integer, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from backend.database import Base

def new_uuid(): return str(uuid.uuid4())
def now(): return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    id            = Column(String(36), primary_key=True, default=new_uuid)
    email         = Column(String(255), unique=True, nullable=False, index=True)
    hashed_pw     = Column(String(255), nullable=False)
    full_name     = Column(String(255), default="")
    app_slug      = Column(String(64), nullable=False, index=True)  # which app they signed up on
    plan          = Column(String(32), default="free")               # free|starter|pro|enterprise
    is_active     = Column(Boolean, default=True)
    is_verified   = Column(Boolean, default=False)
    created_at    = Column(DateTime(timezone=True), default=now)
    updated_at    = Column(DateTime(timezone=True), default=now, onupdate=now)
    subscriptions = relationship("Subscription", back_populates="user")
    ai_logs       = relationship("AILog", back_populates="user")

class Subscription(Base):
    __tablename__ = "subscriptions"
    id             = Column(String(36), primary_key=True, default=new_uuid)
    user_id        = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    app_slug       = Column(String(64), nullable=False)
    stripe_sub_id  = Column(String(255), unique=True)
    plan           = Column(String(32), default="free")
    status         = Column(String(32), default="active")
    current_period_end = Column(DateTime(timezone=True))
    created_at     = Column(DateTime(timezone=True), default=now)
    user           = relationship("User", back_populates="subscriptions")

class AILog(Base):
    __tablename__ = "ai_logs"
    id          = Column(String(36), primary_key=True, default=new_uuid)
    user_id     = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    app_slug    = Column(String(64), nullable=False)
    model       = Column(String(64), default="gpt-4o-mini")
    prompt_tokens  = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    duration_ms = Column(Integer, default=0)
    created_at  = Column(DateTime(timezone=True), default=now)
    user        = relationship("User", back_populates="ai_logs")

class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"
    id         = Column(String(36), primary_key=True, default=new_uuid)
    user_id    = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    app_slug   = Column(String(64), nullable=False, index=True)
    event_name = Column(String(128), nullable=False)
    properties = Column(Text, default="{}")
    created_at = Column(DateTime(timezone=True), default=now)
