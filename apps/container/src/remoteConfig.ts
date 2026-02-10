/**
 * Remote Configuration
 *
 * This module provides utilities for working with remote module configurations
 * loaded from a server manifest file. The manifest is fetched dynamically at runtime,
 * allowing for flexible deployment and configuration management.
 */

import {
  getRemoteConfig,
  getRemoteEntryUrl,
  type RemoteConfig,
} from "./manifestService";

/**
 * Gets the full URL for a remote's entry file
 *
 * @param remoteName - Name of the remote (e.g., 'absences', 'profile')
 * @returns Promise resolving to the complete URL of the remoteEntry.js file
 */
export async function getRemoteUrl(remoteName: string): Promise<string> {
  const config = await getRemoteConfig(remoteName);
  return getRemoteEntryUrl(config);
}

/**
 * Gets the complete remote entry string in Module Federation format
 *
 * @param remoteName - Name of the remote
 * @returns Promise resolving to a string like "remoteName@http://url/remoteEntry.js"
 */
export async function getRemoteEntry(remoteName: string): Promise<string> {
  const config = await getRemoteConfig(remoteName);
  const url = getRemoteEntryUrl(config);
  return `${config.name}@${url}`;
}

/**
 * Gets the complete configuration for a remote
 *
 * @param remoteName - Name of the remote
 * @returns Promise resolving to the RemoteConfig object
 */
export async function getRemote(remoteName: string): Promise<RemoteConfig> {
  return getRemoteConfig(remoteName);
}
