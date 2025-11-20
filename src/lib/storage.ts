import { apiFormRequest, apiRequest } from './apiClient';

export type UploadedImage = {
  url: string;
  path: string | null;
};

export const uploadImageFile = async (file: File, folder = 'gallery'): Promise<UploadedImage> => {
  const formData = new FormData();
  formData.append('file', file);
  if (folder) {
    formData.append('folder', folder);
  }

  const response = await apiFormRequest<{ imageUrl: string; storagePath: string }>({
    path: '/api/upload-image',
    formData,
    auth: true,
  });

  return { url: response.imageUrl, path: response.storagePath ?? null };
};

export const deleteImageAtPath = async (path?: string | null) => {
  if (!path) {
    return;
  }
  try {
    await apiRequest({
      path: `/api/upload-image?path=${encodeURIComponent(path)}`,
      method: 'DELETE',
      auth: true,
    });
  } catch (error) {
    console.warn('Unable to delete storage object', path, error);
  }
};
