import { SignInButton } from '../SignInButton'
import { HighlightableLink } from '../HighlightableLink'

import styles from './Header.module.scss'

export function Header(): React.ReactElement {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo.svg" alt="ig.news" />

        <nav>
          <HighlightableLink href="/" prefetch activeClassName={styles.active}>
            <a>Home</a>
          </HighlightableLink>

          <HighlightableLink
            href="/posts"
            prefetch
            activeClassName={styles.active}
          >
            <a>Posts</a>
          </HighlightableLink>
        </nav>

        <SignInButton />
      </div>
    </header>
  )
}
