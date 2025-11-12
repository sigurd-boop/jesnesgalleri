import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';
import { getFirebaseStorage } from './firebase';

export type UploadedImage = {
  url: string;
  path: string;
};

const createFilePath = (folder: string, fileName: string) => {
  const cleanFolder = folder.replace(/\/+$/, '');
  const extension = fileName.includes('.') ? fileName.split('.').pop() : 'jpg';
  const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  return `${cleanFolder}/${Date.now()}-${uniqueId}.${extension ?? 'jpg'}`;
};

export const uploadImageFile = async (file: File, folder = 'gallery'): Promise<UploadedImage> => {
  const storage = getFirebaseStorage();
  if (!storage) {
    throw new Error('Firebase Storage is not initialized.');
  }

  const path = createFilePath(folder, file.name || 'image');
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return { url, path };
};

export const deleteImageAtPath = async (path?: string | null) => {
  if (!path) {
    return;
  }
  const storage = getFirebaseStorage();
  if (!storage) {
    return;
  }
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.warn('Unable to delete storage object', path, error);
  }
};
