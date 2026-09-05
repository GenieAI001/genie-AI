import { Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getPublicSettings } from '@workspace/api-client-react';

// Google's public AdMob test ad unit IDs. Used whenever the admin hasn't
// configured a real one yet, so ad placements always render *something*
// during development instead of erroring out.
const TEST_UNIT_IDS = {
  banner: Platform.select({
    ios: 'ca-app-pub-3940256099942544/2934735716',
    android: 'ca-app-pub-3940256099942544/6300978111',
    default: '',
  }),
  interstitial: Platform.select({
    ios: 'ca-app-pub-3940256099942544/4411468910',
    android: 'ca-app-pub-3940256099942544/1033173712',
    default: '',
  }),
  rewarded: Platform.select({
    ios: 'ca-app-pub-3940256099942544/1712485313',
    android: 'ca-app-pub-3940256099942544/5224354917',
    default: '',
  }),
};

function keyFor(kind: 'BANNER' | 'INTERSTITIAL' | 'REWARDED') {
  const platform = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';
  return `ADMOB_${kind}_UNIT_ID_${platform}`;
}

/**
 * Reads ad unit IDs from the backend (set by the admin dashboard's Settings
 * page) so they can be changed without an app store release. Falls back to
 * Google's test ad units when nothing has been configured yet.
 */
export function useAdmobConfig() {
  const query = useQuery({
    queryKey: ['admob-settings'],
    queryFn: getPublicSettings,
    staleTime: 30 * 60 * 1000,
  });

  const settings = query.data ?? {};

  return {
    bannerUnitId: settings[keyFor('BANNER')] || TEST_UNIT_IDS.banner || null,
    interstitialUnitId: settings[keyFor('INTERSTITIAL')] || TEST_UNIT_IDS.interstitial || null,
    rewardedUnitId: settings[keyFor('REWARDED')] || TEST_UNIT_IDS.rewarded || null,
    isLoading: query.isLoading,
  };
}
