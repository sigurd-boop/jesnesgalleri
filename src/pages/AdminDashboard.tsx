import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  createGalleryItem,
  deleteGalleryItem,
  galleryCategories,
  galleryCategoryLabels,
  subscribeToGalleryItems,
  updateGalleryItem,
  type GalleryCategory,
  type GalleryItem,
  type GalleryItemInput,
} from '../lib/galleryRepository';
import { ButtonLink, Eyebrow, Muted, PageDescription, PageTitle, Surface } from '../components/Bits';
import { uploadImageFile, deleteImageAtPath } from '../lib/storage';
import { useEffectOnce } from '../utils/useEffectOnce';

type FormState = GalleryItemInput & {
  id?: string;
};

const DEFAULT_MODEL_PATH = '/models/textured.glb';

const emptyForm: FormState = {
  title: '',
  description: '',
  modelPath: DEFAULT_MODEL_PATH,
  category: 'collection',
  imageUrl: null,
  imageStoragePath: null,
  galleryShots: [],
  galleryShotStoragePaths: [],
  displayOrder: null,
};

const AdminDashboard = () => {
  const { user, logout, adminEmailsConfigured } = useAuth();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [galleryShotFiles, setGalleryShotFiles] = useState<File[]>([]);

  useEffectOnce(() =>
    subscribeToGalleryItems(
      (nextItems) => {
        setItems(nextItems);
        setLoading(false);
      },
      (subscribeError) => {
        console.error('Kunne ikke hente gallerielementer', subscribeError);
        setError(
          subscribeError.message ||
            'Klarte ikke å hente galleriet. Kontroller Firebase-konfigurasjonen.',
        );
        setLoading(false);
      },
    ),
  );

  const isEditing = useMemo(() => Boolean(formState.id), [formState.id]);

  const updateField = (field: keyof GalleryItemInput, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormState(emptyForm);
    setSuccessMessage(null);
    setPreviewFile(null);
    setGalleryShotFiles([]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    const nextState: FormState = {
      ...formState,
    };

    try {
      console.log('[Admin] Submitting formState', nextState);
      if (previewFile) {
        if (nextState.imageStoragePath) {
          await deleteImageAtPath(nextState.imageStoragePath);
        }
        console.log('[Admin] Uploading preview file', previewFile.name);
        const uploadedPreview = await uploadImageFile(previewFile, 'gallery/previews');
        nextState.imageUrl = uploadedPreview.url;
        nextState.imageStoragePath = uploadedPreview.path ?? null;
        console.log('[Admin] Preview uploaded', uploadedPreview);
      }

      if (galleryShotFiles.length) {
        const uploads = await Promise.all(
          galleryShotFiles.map((file) => uploadImageFile(file, 'gallery/shots')),
        );
        nextState.galleryShots = [...(nextState.galleryShots ?? []), ...uploads.map((upload) => upload.url)];
        nextState.galleryShotStoragePaths = [
          ...(nextState.galleryShotStoragePaths ?? []),
          ...uploads.map((upload) => upload.path).filter((path): path is string => Boolean(path)),
        ];
      }

      const payload: GalleryItemInput = {
        title: nextState.title,
        description: nextState.description,
        modelPath: DEFAULT_MODEL_PATH,
        category: nextState.category,
        imageUrl: nextState.imageUrl ?? null,
        galleryShots: nextState.galleryShots?.length ? nextState.galleryShots : null,
        postedAt: nextState.postedAt ?? null,
        tags: nextState.tags ?? null,
        imageStoragePath: nextState.imageStoragePath ?? null,
        galleryShotStoragePaths: nextState.galleryShotStoragePaths?.length
          ? nextState.galleryShotStoragePaths
          : null,
        displayOrder:
          typeof nextState.displayOrder === 'number' && !Number.isNaN(nextState.displayOrder)
            ? nextState.displayOrder
            : null,
      };

      if (formState.id) {
        console.log('[Admin] Updating document', formState.id, payload);
        await updateGalleryItem(formState.id, payload);
        setSuccessMessage('Oppføringen ble oppdatert.');
      } else {
        console.log('[Admin] Creating new document', payload);
        await createGalleryItem(payload);
        setSuccessMessage('Ny oppføring ble lagt til.');
      }
      setFormState(emptyForm);
      setPreviewFile(null);
      setGalleryShotFiles([]);
    } catch (submitError) {
      console.error('Klarte ikke å lagre oppføringen', submitError);
      setError((submitError as Error).message ?? 'Lagring mislyktes.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: GalleryItem) => {
    console.log('[Admin] Editing item', item.id, item);
    setFormState({
      id: item.id,
      title: item.title,
      description: item.description,
      modelPath: item.modelPath,
      category: item.category,
      imageUrl: item.imageUrl ?? null,
      imageStoragePath: item.imageStoragePath ?? null,
      galleryShots: item.galleryShots ?? [],
      galleryShotStoragePaths: item.galleryShotStoragePaths ?? [],
    });
    setSuccessMessage(null);
    setPreviewFile(null);
    setGalleryShotFiles([]);
  };

  const handleGalleryShotRemoval = async (index: number) => {
    const storagePath = formState.galleryShotStoragePaths?.[index];
    if (storagePath) {
      await deleteImageAtPath(storagePath);
    }
    setFormState((prev) => ({
      ...prev,
      galleryShots: prev.galleryShots?.filter((_, shotIndex) => shotIndex !== index) ?? [],
      galleryShotStoragePaths: prev.galleryShotStoragePaths?.filter((_, shotIndex) => shotIndex !== index) ?? [],
    }));
  };

  const handleGalleryShotFileChange = (files: FileList | null) => {
    if (!files?.length) {
      return;
    }
    setGalleryShotFiles((prev) => [...prev, ...Array.from(files)]);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Er du sikker på at du vil slette denne oppføringen?');
    if (!confirmed) {
      return;
    }

    try {
      console.log('[Admin] Deleting item', id);
      const item = items.find((entry) => entry.id === id);
      await deleteGalleryItem(id);
      console.log('[Admin] Artwork removed from backend', id);
      if (item) {
        await deleteImageAtPath(item.imageStoragePath);
        if (item.galleryShotStoragePaths?.length) {
          await Promise.all(item.galleryShotStoragePaths.map((path) => deleteImageAtPath(path)));
        }
      }
    } catch (deleteError) {
      console.error('Klarte ikke å slette oppføringen', deleteError);
      setError((deleteError as Error).message ?? 'Sletting mislyktes.');
    }
  };

  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <Eyebrow>administrator</Eyebrow>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <PageTitle>Kontrollpanel for galleriet</PageTitle>
            <PageDescription>
              Last opp nye galleri-bilder, oppdater beskrivelser og styr rekkefølgen de vises i. Alt lagres direkte i
              backend-API-et og speiles i det offentlige galleriet.
            </PageDescription>
          </div>
          <div className="flex flex-col items-end gap-1 text-right text-xs uppercase tracking-[0.3em] text-slate-500">
            <span className="text-[0.6rem] text-slate-400">{user?.email}</span>
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
            >
              Logg ut
            </button>
          </div>
        </div>
        {!adminEmailsConfigured ? (
          <Surface variant="subtle" className="border-dashed text-sm text-slate-600">
            <p>
              Ingen admin-adresser er konfigurert. Legg til en kommaseparert liste i
              <code className="mx-2 rounded bg-slate-900/90 px-2 py-1 font-mono text-xs text-white">VITE_FIREBASE_ADMIN_EMAILS</code>
              for å begrense tilgangen.
            </p>
          </Surface>
        ) : null}
      </header>

      <Surface className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Tittel</span>
              <input
                required
                value={formState.title}
                onChange={(event) => updateField('title', event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Kategori</span>
              <select
                value={formState.category}
                onChange={(event) => updateField('category', event.target.value as GalleryCategory)}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
              >
                {galleryCategories.map((category) => (
                  <option key={category} value={category}>
                    {galleryCategoryLabels[category]}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Rekkefølge (lavere tall vises først)
              </span>
              <input
                type="number"
                value={formState.displayOrder ?? ''}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    displayOrder: event.target.value === '' ? null : Number(event.target.value),
                  }))
                }
                placeholder="0"
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
              />
            </label>
          </div>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Beskrivelse</span>
            <textarea
              required
              value={formState.description}
              onChange={(event) => updateField('description', event.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
            />
          </label>
          <input type="hidden" value={formState.imageUrl ?? ''} readOnly />
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Forhåndsvisning (last opp)</span>
            {formState.imageUrl ? (
              <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white/60 p-3">
                <img src={formState.imageUrl} alt="Preview" className="h-16 w-16 rounded-xl object-cover" />
                <button
                  type="button"
                  className="rounded-full border border-rose-300 px-3 py-1 text-xs uppercase tracking-[0.3em] text-rose-600 transition hover:bg-rose-50"
                  onClick={async () => {
                    await deleteImageAtPath(formState.imageStoragePath);
                    setFormState((prev) => ({ ...prev, imageUrl: null, imageStoragePath: null }));
                  }}
                >
                  Fjern
                </button>
              </div>
            ) : (
              <Muted className="text-xs">Ingen preview lastet opp ennå.</Muted>
            )}
            <input type="file" accept="image/*" onChange={(event) => setPreviewFile(event.target.files?.[0] ?? null)} />
            {previewFile ? <Muted className="text-xs">Ny fil: {previewFile.name}</Muted> : null}
          </div>
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Galleri-bilder</span>
            {formState.galleryShots?.length ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {formState.galleryShots.map((shot, index) => (
                  <div key={`${shot}-${index}`} className="rounded-2xl border border-slate-200 bg-white/70 p-2">
                    <img src={shot} alt={`Galleri-bilde ${index + 1}`} className="h-32 w-full rounded-xl object-cover" />
                    <button
                      type="button"
                      onClick={() => handleGalleryShotRemoval(index)}
                      className="mt-2 w-full rounded-full border border-rose-300 px-3 py-1 text-[0.6rem] uppercase tracking-[0.3em] text-rose-600 transition hover:bg-rose-50"
                    >
                      Fjern bilde
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <Muted className="text-xs">Ingen ekstra galleri-bilder er lastet opp.</Muted>
            )}
            <input type="file" accept="image/*" multiple onChange={(event) => handleGalleryShotFileChange(event.target.files)} />
            {galleryShotFiles.length ? (
              <div className="space-y-1 rounded-2xl border border-slate-200 bg-white/70 p-3 text-xs text-slate-600">
                {galleryShotFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-2">
                    <span className="truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setGalleryShotFiles((prev) => prev.filter((_, i) => i !== index))}
                      className="text-rose-600 transition hover:text-rose-700"
                    >
                      Fjern
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition-opacity hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isEditing ? 'Oppdater' : 'Legg til'} oppføring
            </button>
            {isEditing ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-slate-300 px-6 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
              >
                Avbryt
              </button>
            ) : null}
            {successMessage ? <Muted className="text-xs text-emerald-600">{successMessage}</Muted> : null}
            {error ? <Muted className="text-xs text-rose-600">{error}</Muted> : null}
          </div>
        </form>
      </Surface>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Gallerielementer</h2>
          <ButtonLink href="#" tone="neutral" className="pointer-events-none opacity-40">
            {items.length} elementer
          </ButtonLink>
        </div>
        <div className="space-y-4">
          {loading ? (
            <Surface variant="subtle" className="animate-pulse border-dashed text-sm text-slate-500">
              Laster galleriet...
            </Surface>
          ) : items.length === 0 ? (
            <Surface variant="subtle" className="border-dashed text-sm text-slate-600">
              Ingen elementer er publisert ennå. Legg til ditt første kunstverk ovenfor.
            </Surface>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4 shadow-[0_12px_30px_-25px_rgba(15,23,42,0.65)]"
                >
                  <div className="flex items-center gap-4">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-20 w-20 flex-shrink-0 rounded-2xl object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-[0.55rem] uppercase tracking-[0.35em] text-slate-400">
                        Ingen
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="space-y-0.5">
                        <p className="text-[0.55rem] uppercase tracking-[0.35em] text-slate-400">
                          {galleryCategoryLabels[item.category]}
                        </p>
                        <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>
                      <div className="text-[0.55rem] font-mono uppercase tracking-[0.3em] text-slate-400">
                        <span>rekkefølge · {item.displayOrder ?? '∞'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
                    >
                      Rediger
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="rounded-full border border-rose-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-rose-600 transition-colors hover:border-rose-400 hover:text-rose-700"
                    >
                      Slett
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
