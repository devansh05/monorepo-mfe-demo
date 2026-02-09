// Remote configuration simulating AWS CDN deployment
// In production, these would be your actual CDN URLs
export const REMOTE_CONFIG = {
  absences: {
    name: "absences",
    // Simulating AWS CloudFront CDN URL
    // In production: 'https://d1234abcd.cloudfront.net/absences'
    url: process.env.ABSENCES_URL || "http://localhost:3001",
    entry: "/remoteEntry.js",
  },
  profile: {
    name: "profile",
    // Simulating AWS CloudFront CDN URL
    // In production: 'https://d5678efgh.cloudfront.net/profile'
    url: process.env.PROFILE_URL || "http://localhost:3002",
    entry: "/remoteEntry.js",
  },
};

export const getRemoteUrl = (
  remoteName: keyof typeof REMOTE_CONFIG,
): string => {
  const config = REMOTE_CONFIG[remoteName];
  return `${config.url}${config.entry}`;
};

export const getRemoteEntry = (
  remoteName: keyof typeof REMOTE_CONFIG,
): string => {
  const config = REMOTE_CONFIG[remoteName];
  return `${config.name}@${config.url}${config.entry}`;
};
