import { SignInButton } from '../SignInButton'
import styles from './Header.module.scss'

export function Header(): React.ReactElement {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <img src="/images/logo.svg" alt="if.news" />
        <nav>
          <a className={styles.active} href="http://localhost:3000">
            Home
          </a>
          <a href="">Posts</a>
        </nav>
        <SignInButton />
      </div>
    </header>
  )
}
