/**
 * React Native deep link + Universal Link handler.
 * Registers for both http:// (Universal Links / App Links) and custom scheme.
 */
import {Linking, Alert} from 'react-native';
import {NavigationContainerRef} from '@react-navigation/native';

type LinkHandler = (params: Record<string, string>) => void;

const _handlers: Map<string, LinkHandler> = new Map();

export function registerDeepLinkHandler(path: string, handler: LinkHandler) {
  _handlers.set(path, handler);
}

export function initDeepLinks(navigationRef: React.RefObject<NavigationContainerRef<any>>) {
  // Handle link when app is already open
  const subscription = Linking.addEventListener("url", ({url}) => {
    handleUrl(url, navigationRef);
  });

  // Handle initial link (app opened via link)
  Linking.getInitialURL().then((url) => {
    if (url) handleUrl(url, navigationRef);
  });

  return () => subscription.remove();
}

function handleUrl(url: string, navigationRef: React.RefObject<NavigationContainerRef<any>>) {
  try {
    // Parse both https://domain.com/path and app://path
    const parsed = url.includes("://") ? new URL(url) : null;
    if (!parsed) return;

    const path = parsed.pathname;
    const params: Record<string, string> = {};
    parsed.searchParams.forEach((value, key) => { params[key] = value; });

    // Route to registered handlers
    for (const [pattern, handler] of _handlers.entries()) {
      if (path.startsWith(pattern)) {
        handler({...params, _path: path});
        return;
      }
    }

    // Default: navigate to matched screen
    if (navigationRef.current?.isReady()) {
      if (path.startsWith("/auth/reset-password")) {
        navigationRef.current.navigate("ResetPassword" as never, params as never);
      } else if (path.startsWith("/share/")) {
        navigationRef.current.navigate("Share" as never, params as never);
      }
    }
  } catch (err) {
    console.warn("Deep link parse error:", err);
  }
}
