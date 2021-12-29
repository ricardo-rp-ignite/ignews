import Link, { LinkProps } from 'next/link'
import { useRouter } from 'next/router'
import { ReactElement, cloneElement } from 'react'

type HighlightableLinkProps = LinkProps & {
  children: ReactElement
  activeClassName: string
}

export function HighlightableLink({
  children,
  activeClassName,
  ...rest
}: HighlightableLinkProps) {
  const { asPath } = useRouter()

  return (
    <Link {...rest}>
      {cloneElement(children, {
        className: asPath === rest.href ? activeClassName : '',
      })}
    </Link>
  )
}
