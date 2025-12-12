export const processPublicImagePath = (path, usePublic = true) => {
  if (!path) return "";
  // Ensure the path starts with a slash
  if (!path.startsWith("/")) {
    path = "/" + path;
  }
  if (usePublic) {
    path = process.env.NEXT_PUBLIC_BASE_URL + path;
  }
  return path;
};
