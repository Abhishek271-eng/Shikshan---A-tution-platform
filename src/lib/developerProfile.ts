export const DEFAULT_DEVELOPER_PHOTO = '/images/abhishek.jpg';
export const DEVELOPER_STORAGE_KEY = 'shikshan_developer_profile';

export const getDeveloperPhoto = (): string => {
  try {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(DEVELOPER_STORAGE_KEY) : null;
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.photoUrl) return parsed.photoUrl;
    }
  } catch {
    // Ignore storage parsing errors
  }
  return DEFAULT_DEVELOPER_PHOTO;
};
