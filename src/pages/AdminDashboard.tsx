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
import { useEffectOnce } from '../utils/useEffectOnce';

const emptyForm: GalleryItemInput = {
  title: '',
  description: '',
  modelPath: '',
  category: 'collection',
  imageUrl: null,
};

type FormState = GalleryItemInput & {
  id?: string;
};

const AdminDashboard = () => {
  const { user, logout, adminEmailsConfigured } = useAuth();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    const payload: GalleryItemInput = {
      title: formState.title,
      description: formState.description,
      modelPath: formState.modelPath,
      category: formState.category,
      imageUrl: formState.imageUrl && formState.imageUrl.length > 0 ? formState.imageUrl : null,
    };

    try {
      if (formState.id) {
        await updateGalleryItem(formState.id, payload);
        setSuccessMessage('Oppføringen ble oppdatert.');
      } else {
        await createGalleryItem(payload);
        setSuccessMessage('Ny oppføring ble lagt til.');
      }
      setFormState(emptyForm);
    } catch (submitError) {
      console.error('Klarte ikke å lagre oppføringen', submitError);
      setError((submitError as Error).message ?? 'Lagring mislyktes.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setFormState({
      id: item.id,
      title: item.title,
      description: item.description,
      modelPath: item.modelPath,
      category: item.category,
      imageUrl: item.imageUrl ?? null,
    });
    setSuccessMessage(null);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Er du sikker på at du vil slette denne oppføringen?');
    if (!confirmed) {
      return;
    }

    try {
      await deleteGalleryItem(id);
    } catch (deleteError) {
      console.error('Klarte ikke å slette oppføringen', deleteError);
      setError((deleteError as Error).message ?? 'Sletting mislyktes.');
    }
  };

  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <Eyebrow>administrator</Eyebrow>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-3">
            <PageTitle>Kontrollpanel for galleriet</PageTitle>
            <PageDescription>
              Legg til, oppdater eller fjern modeller og tilhørende bilder. Endringene lagres direkte i Firestore og er
              tilgjengelige for galleriet.
            </PageDescription>
          </div>
          <div className="flex flex-col items-end gap-2 text-right text-xs uppercase tracking-[0.3em] text-slate-500">
            <span>{user?.email}</span>
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-slate-300 px-4 py-1 text-[0.65rem] font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
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
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Filbane til modell</span>
              <input
                required
                value={formState.modelPath}
                onChange={(event) => updateField('modelPath', event.target.value)}
                placeholder="/models/artifact-01.glb"
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
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Bilde/preview URL (valgfritt)</span>
            <input
              value={formState.imageUrl ?? ''}
              onChange={(event) => updateField('imageUrl', event.target.value)}
              placeholder="https://..."
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
            />
          </label>
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
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-sm md:flex-row md:items-start md:justify-between"
                >
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                    <div className="space-y-1 text-xs font-mono uppercase tracking-[0.35em] text-slate-400">
                      <p>kategori · {galleryCategoryLabels[item.category]}</p>
                      <p>modell · {item.modelPath}</p>
                      {item.imageUrl ? <p>bilde · {item.imageUrl}</p> : null}
                    </div>
                    {item.imageUrl ? (
                      <div className="overflow-hidden rounded-3xl border border-slate-200">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-40 w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : null}
                  </div>
                  <div className="flex gap-2 self-start">
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
