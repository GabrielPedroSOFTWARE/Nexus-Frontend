import { ADMIN_AVATAR_ASSET, USER_AVATAR_ASSET } from '../assets.js'

export function Avatar({ admin = false, size = 'md' }) {
  return (
    <span className={`avatar avatar-${size} ${admin ? 'avatar-admin' : ''}`} aria-hidden="true">
      <img src={admin ? ADMIN_AVATAR_ASSET : USER_AVATAR_ASSET} alt="" />
    </span>
  )
}
