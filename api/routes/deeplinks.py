"""Universal Links (iOS) and App Links (Android) endpoint."""
from fastapi import APIRouter
from api.core.config import settings

router = APIRouter()

@router.get("/.well-known/apple-app-site-association")
async def apple_app_site_association():
    """iOS Universal Links — required for App Store deep linking."""
    return {
        "applinks": {
            "apps": [],
            "details": [{
                "appID": f"{settings.APPLE_TEAM_ID}.com.sianlk.app",
                "paths": ["/app/*", "/auth/*", "/share/*"]
            }]
        },
        "webcredentials": {
            "apps": [f"{settings.APPLE_TEAM_ID}.com.sianlk.app"]
        }
    }

@router.get("/.well-known/assetlinks.json")
async def asset_links():
    """Android App Links — required for Play Store deep linking."""
    return [{
        "relation": ["delegate_permission/common.handle_all_urls"],
        "target": {
            "namespace": "android_app",
            "package_name": "com.sianlk.app",
            "sha256_cert_fingerprints": [
                "REPLACE_WITH_YOUR_KEYSTORE_SHA256_FINGERPRINT"
            ]
        }
    }]
