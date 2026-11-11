import { BRAND_ASSET } from '../assets.js'

export function BrandMark({ size = 96, className = '' }) {
  return <img className={`brand-mark ${className}`} width={size} height={size} src={BRAND_ASSET} alt="NEXUS" />
}
