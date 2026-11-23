import { DESKTOP_ASSET, MACBOOK_ASSET } from '../assets.js'

export function ComputerGraphic({ laptopMode = false }) {
  return <span className={`computer-graphic ${laptopMode ? 'laptop-graphic' : ''}`} aria-hidden="true">
    <img className="computer-graphic-image" src={laptopMode ? MACBOOK_ASSET : DESKTOP_ASSET} alt="" />
  </span>
}
