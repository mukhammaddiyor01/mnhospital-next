export interface Service {
  id: string;
  title: string;
  description: string | null;
  type: string | null;
  price: number | null;
  discountPercent: number;
  duration: string | null;
  image: string | null;
  doctor: { id: string; name: string; specialty: string | null } | null;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string | null;
  experience: number | null;
  description: string | null;
  address: string | null;
  image: string | null;
}

export interface Article {
  id: string;
  title: string;
  category: string | null;
  paragraphs: string[];
  image: string | null;
  createdAt: string | null;
  author: string | null;
}

export interface Page<T> {
  items: T[];
  total: number;
}

export type CatalogError = 'configuration' | 'unavailable';

export const PAGE_SIZE = 10;

const invalid = () => new Error('Invalid catalog response');

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object') throw invalid();
  return value as Record<string, unknown>;
}

function required(value: unknown): string {
  if (typeof value !== 'string' || !value) throw invalid();
  return value;
}

const text = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : null);
const count = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null);

export function parsePageNumber(page: number): number {
  if (!Number.isSafeInteger(page) || page < 1) throw new Error('Invalid catalog page');
  return page;
}

// Route params arrive from deep links, so check them before they reach the API.
export function parseId(id: unknown): string {
  if (typeof id !== 'string' || !/^[a-f\d]{24}$/i.test(id)) throw new Error('Invalid catalog id');
  return id;
}

export function parseService(value: unknown): Service {
  const item = record(value);
  const doctor = item.memberData && typeof item.memberData === 'object'
    ? item.memberData as Record<string, unknown>
    : null;
  const images = Array.isArray(item.serviceImages) ? item.serviceImages : [];
  return {
    id: required(item._id),
    title: required(item.serviceTitle),
    description: text(item.serviceDesc),
    type: text(item.serviceType),
    price: count(item.servicePrice),
    discountPercent: count(item.serviceDiscountPercent) ?? 0,
    duration: text(item.serviceDuration),
    image: text(images[0]),
    doctor: doctor && text(doctor._id) && text(doctor.docFullName)
      ? { id: text(doctor._id)!, name: text(doctor.docFullName)!, specialty: text(doctor.docSpecialty) }
      : null,
  };
}

export function parseDoctor(value: unknown): Doctor {
  const item = record(value);
  return {
    id: required(item._id),
    name: required(text(item.docFullName) ?? text(item.docNick)),
    specialty: text(item.docSpecialty),
    experience: count(item.docExperience),
    description: text(item.docDesc),
    address: text(item.docAddress),
    image: text(item.docImage),
  };
}

// Same tag stripping as the web article page.
export function toParagraphs(content: unknown): string[] {
  if (typeof content !== 'string') return [];
  return content
    .replace(/<\/?(?:p|br|div)[^>]*>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function parseArticle(value: unknown): Article {
  const item = record(value);
  const author = item.memberData && typeof item.memberData === 'object'
    ? item.memberData as Record<string, unknown>
    : null;
  return {
    id: required(item._id),
    title: required(item.articleTitle),
    category: text(item.articleCategory),
    paragraphs: toParagraphs(item.articleContent),
    image: text(item.articleImage),
    createdAt: text(item.createdAt),
    author: text(author?.docFullName),
  };
}

export function parsePage<T>(value: unknown, parseItem: (item: unknown) => T): Page<T> {
  const result = record(value);
  const { list, metaCounter } = result;
  if (!Array.isArray(list) || !Array.isArray(metaCounter) || list.length > PAGE_SIZE) throw invalid();
  const first = metaCounter[0] as { total?: unknown } | undefined;
  const total = first?.total === undefined ? 0 : first.total;
  if (typeof total !== 'number' || !Number.isInteger(total) || total < 0) throw invalid();
  return { items: list.map(parseItem), total };
}

export function mergeById<T extends { id: string }>(current: T[], incoming: T[]): T[] {
  const seen = new Set<string>();
  return [...current, ...incoming].filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

// Uploads live under their own public prefix (production: https://mnhospital.uz/backend).
export function resolveAssetUrl(asset: string | null, base: string | undefined): string | null {
  if (!asset) return null;
  if (/^[a-z][a-z\d+.-]*:/i.test(asset)) return asset.startsWith('https://') ? asset : null;
  if (!base?.startsWith('https://')) return null;
  return `${base.replace(/\/+$/, '')}/${asset.replace(/^\/+/, '')}`;
}

export function formatByline(author: string | null, createdAt: string | null, locale: string): string {
  const date = createdAt ? new Date(createdAt) : null;
  return [author, date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString(locale) : null]
    .filter(Boolean)
    .join(' · ');
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString('en-US')} KRW`;
}
