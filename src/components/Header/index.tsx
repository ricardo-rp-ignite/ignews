import styles from './Header.module.scss'

type HeaderProps = {
  
}

export function Header(props: HeaderProps): React.ReactElement {
  return (
    <header className={styles.headerContainer}>
        <div className={styles.headerContent}>
            <img src="/images/logo.svg" alt="if.news" />
            <nav>
                <a className={styles.active} href="">Home</a>
                <a href="">Posts</a>
            </nav>
        </div>
    </header>
  )
}