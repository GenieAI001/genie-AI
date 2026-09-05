import React from 'react';
import { Platform, View } from 'react-native';
import { useAdmobConfig } from '@/hooks/useAdmobConfig';

/**
 * Drop this in anywhere you want a banner ad (e.g. bottom of a screen,
 * between list sections). Renders nothing on web or while the ad unit ID
 * is still loading/unset, so it never breaks layout.
 *
 * The native ads module only exists on iOS/Android builds — it's imported
 * lazily so this file doesn't crash `expo start --web` or Metro's web bundle,
 * which can't resolve the native-only package.
 */
export function AdBanner() {
  const { bannerUnitId } = useAdmobConfig();

  if (Platform.OS === 'web' || !bannerUnitId) {
    return null;
  }

  return <NativeAdBanner unitId={bannerUnitId} />;
}

function NativeAdBanner({ unitId }: { unitId: string }) {
  // Lazy require: avoids bundling/resolving the native module on web.
  const { BannerAd, BannerAdSize } = require('react-native-google-mobile-ads');

  return (
    <View style={{ alignItems: 'center', marginVertical: 8 }}>
      <BannerAd unitId={unitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}
