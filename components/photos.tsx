import Image from 'next/image';
import type { PhotoCredit } from '@/lib/photos';
import { photoAlt, photoSrc } from '@/lib/photos';

type Props = {
  credit: PhotoCredit;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
};

export function Photo({ credit, className, sizes, priority, fill, width, height, style }: Props) {
  const src = photoSrc(credit.file);
  const alt = photoAlt(credit);
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? '100vw'}
        priority={priority}
        className={className}
        style={style}
      />
    );
  }
  const w = width ?? credit.width;
  const h = height ?? credit.height;
  return (
    <Image
      src={src}
      alt={alt}
      width={w}
      height={h}
      sizes={sizes}
      priority={priority}
      className={className}
      style={style}
    />
  );
}

export function PhotoCreditLine({ credit }: { credit: PhotoCredit }) {
  const lic = credit.license === 'cc0' ? 'CC0' : credit.license === 'pdm' ? 'PDM' : 'CC BY';
  const licUrl = credit.license_url;
  return (
    <span className="photo-credit">
      Photo:{' '}
      <a href={credit.source_url} target="_blank" rel="noopener noreferrer">
        {credit.title || credit.file}
      </a>{' '}
      by {credit.creator} ·{' '}
      <a href={licUrl} target="_blank" rel="noopener noreferrer">
        {lic}
      </a>
    </span>
  );
}
