// Dynamic Expo config. Expo merges this over app.json, and — unlike JSON —
// it can read environment variables at build time. That's needed for the
// AdMob plugin: the two AdMob "App IDs" (one per platform) are baked into
// the native binary at build time, so they can't be changed at runtime like
// the ad *unit* IDs (banner/interstitial/rewarded), which the app fetches
// from the backend settings API instead — see hooks/useAdmobConfig.ts.
//
// Set these before running `expo prebuild` / building for a store:
//   ADMOB_APP_ID_IOS, ADMOB_APP_ID_ANDROID
//
// Until you set real values, this falls back to Google's public AdMob test
// App IDs so development builds work out of the box without showing errors.
const TEST_ADMOB_APP_ID_IOS = 'ca-app-pub-3940256099942544~1458002511';
const TEST_ADMOB_APP_ID_ANDROID = 'ca-app-pub-3940256099942544~3347511713';

/** @param {{ config: import('expo/config').ExpoConfig }} options */
module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    [
      'react-native-google-mobile-ads',
      {
        iosAppId: process.env.ADMOB_APP_ID_IOS || TEST_ADMOB_APP_ID_IOS,
        androidAppId: process.env.ADMOB_APP_ID_ANDROID || TEST_ADMOB_APP_ID_ANDROID,
      },
    ],
  ],
});
