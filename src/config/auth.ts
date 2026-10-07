export const GOOGLE_CLIENT_ID = (
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '327205352885-o2vv81vt9vv98o9lshp93nojg558bggf.apps.googleusercontent.com'
).trim();

export const isGoogleAuthEnabled = Boolean(
  GOOGLE_CLIENT_ID &&
  GOOGLE_CLIENT_ID !== 'your_google_client_id_here' &&
  GOOGLE_CLIENT_ID !== 'undefined' &&
  GOOGLE_CLIENT_ID !== 'null'
);

