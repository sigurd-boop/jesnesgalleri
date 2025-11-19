import { ButtonLink } from './Bits';
import type { BigCartelProduct } from '../hooks/useBigCartelProducts';
import { cn } from '../lib/cn';

const DEFAULT_ARTWORK_FEATURES = [
  '1/1 original artwork',
  'A5 200 g/m² fine art paper',
  'Hand-painted frame included',
  'ArtGlass™ museum UV protection',
  'Mixed-media composition',
  'Varnished & sealed surfaces',
  'Part of the Jesné Aztro universe',
  'Certificate & ownership agreement',
  'Worldwide tracked shipping',
];

const buildFeatureList = (product: BigCartelProduct, descriptionParagraphs: string[]) => {
  const optionSummary = product.options?.length
    ? `${product.options.length} option${product.options.length > 1 ? 's' : ''}: ${product.options
        .map((option) => option.name)
        .slice(0, 3)
        .join(', ')}${product.options.length > 3 ? '…' : ''}`
    : 'Single edition';

  const baseFeatures = [
    `${product.sold_out ? 'Sold out' : 'Available now'} • ${product.status ?? 'Jesné drop'}`,
    optionSummary,
  ];

  const descriptionFeatures = descriptionParagraphs.slice(0, 2);
  const remainingSlots = Math.max(0, 9 - (baseFeatures.length + descriptionFeatures.length));
  const specFeatures = DEFAULT_ARTWORK_FEATURES.slice(0, remainingSlots);

  return [...baseFeatures, ...specFeatures, ...descriptionFeatures];
};

type ShopProductCardProps = {
  product: BigCartelProduct;
  priceLabel: string;
  soldOut: boolean;
  descriptionParagraphs: string[];
  onPreview: () => void;
};

const ShopProductCard = ({
  product,
  priceLabel,
  soldOut,
  descriptionParagraphs,
  onPreview,
}: ShopProductCardProps) => {
  const features = buildFeatureList(product, descriptionParagraphs);
  const coverImage = product.images?.[0]?.secure_url;

  return (
    <div className="flex h-full flex-col gap-6 rounded-[36px] border border-white/50 bg-white/80 p-6 shadow-lg shadow-slate-900/5">
      <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Jesné drop</p>
        <h3 className="text-2xl font-semibold text-slate-900">{product.name}</h3>
        <p className="text-sm text-slate-500">{soldOut ? 'All editions claimed' : 'Edition available now'}</p>
      </div>

      {coverImage ? (
        <button
          type="button"
          onClick={onPreview}
          className="group overflow-hidden rounded-[30px] border border-white/70 bg-white/70"
        >
          <img
            src={coverImage}
            alt={product.name}
            className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </button>
      ) : null}

      <div className="rounded-[30px] border border-slate-200/70 bg-white/70 p-5">
        <ul className="space-y-3 text-sm text-slate-600">
          {features.map((feature) => (
            <li key={`${product.id}-${feature}`} className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-slate-400" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Starting at</p>
          <p className={cn('text-3xl font-semibold', soldOut ? 'text-slate-400 line-through' : 'text-slate-900')}>
            {priceLabel}
          </p>
          <p className="text-[0.7rem] uppercase tracking-[0.3em] text-slate-400">
            {soldOut ? 'Sold out' : '1/1 original'}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onPreview}
            className="rounded-full border border-slate-200 px-5 py-2 text-xs uppercase tracking-[0.3em] text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
          >
            Preview piece
          </button>
          <ButtonLink
            href={`https://jesne.bigcartel.com${product.url}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-slate-900 px-6 py-2 text-center text-xs uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
          >
            Open in shop
          </ButtonLink>
        </div>
      </div>
    </div>
  );
};

export default ShopProductCard;
