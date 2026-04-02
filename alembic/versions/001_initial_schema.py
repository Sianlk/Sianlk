"""Initial schema — users, refresh_tokens, subscriptions

Revision ID: 001
Revises:
Create Date: 2026-04-03
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id',                UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('email',             sa.String(255), nullable=False, unique=True, index=True),
        sa.Column('hashed_password',   sa.String(255), nullable=False),
        sa.Column('full_name',         sa.String(255), nullable=True),
        sa.Column('role',              sa.String(50),  nullable=False, server_default='user'),
        sa.Column('subscription_tier', sa.String(50),  nullable=False, server_default='free'),
        sa.Column('is_active',         sa.Boolean(),   nullable=False, server_default='true'),
        sa.Column('is_verified',       sa.Boolean(),   nullable=False, server_default='false'),
        sa.Column('mfa_enabled',       sa.Boolean(),   nullable=False, server_default='false'),
        sa.Column('mfa_secret',        sa.String(64),  nullable=True),
        sa.Column('stripe_customer_id',sa.String(255), nullable=True),
        sa.Column('created_at',        sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at',        sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.Column('deleted_at',        sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        'refresh_tokens',
        sa.Column('id',         UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id',    UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('token_hash', sa.String(64),  nullable=False, unique=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('revoked',    sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        'plans',
        sa.Column('id',          UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('name',        sa.String(100), nullable=False),
        sa.Column('stripe_price_id', sa.String(255), nullable=True),
        sa.Column('amount_cents', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('currency',    sa.String(3),  nullable=False, server_default='aud'),
        sa.Column('interval',    sa.String(20), nullable=False, server_default='month'),
        sa.Column('features',    JSONB,         nullable=True),
        sa.Column('is_active',   sa.Boolean(),  nullable=False, server_default='true'),
        sa.Column('created_at',  sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        'subscriptions',
        sa.Column('id',                  UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id',             UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('plan_id',             UUID(as_uuid=True), sa.ForeignKey('plans.id'), nullable=True),
        sa.Column('stripe_subscription_id', sa.String(255), nullable=True),
        sa.Column('status',              sa.String(50), nullable=False, server_default='active'),
        sa.Column('current_period_start',sa.DateTime(timezone=True), nullable=True),
        sa.Column('current_period_end',  sa.DateTime(timezone=True), nullable=True),
        sa.Column('cancel_at_period_end',sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at',          sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at',          sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        'gdpr_consents',
        sa.Column('id',           UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id',      UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('consent_type', sa.String(100), nullable=False),
        sa.Column('granted',      sa.Boolean(),   nullable=False),
        sa.Column('ip_address',   sa.String(45),  nullable=True),
        sa.Column('user_agent',   sa.Text(),      nullable=True),
        sa.Column('created_at',   sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_index('ix_users_email',          'users',          ['email'])
    op.create_index('ix_refresh_tokens_user',  'refresh_tokens', ['user_id'])
    op.create_index('ix_subscriptions_user',   'subscriptions',  ['user_id'])
    op.create_index('ix_gdpr_consents_user',   'gdpr_consents',  ['user_id'])


def downgrade() -> None:
    op.drop_table('gdpr_consents')
    op.drop_table('subscriptions')
    op.drop_table('plans')
    op.drop_table('refresh_tokens')
    op.drop_table('users')
