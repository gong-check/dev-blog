import * as React from "react"
import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath
  let header

  if (isRootPath) {
    header = (
      <>
        <h1 className="main-heading">
          <Link to="/">
            <StaticImage
              className="logo-title"
              src="../images/logo-title.png"
              width={240}
              height={36}
              alt="Logo picture"
            />
          </Link>
        </h1>
        <section>
          <div className="main-section">
            <StaticImage
              className="main-cover"
              src="../images/main-cover.png"
            />
          </div>
        </section>
      </>
    )
  } else {
    header = (
      <h1 className="main-heading">
        <Link to="/">
          <StaticImage
            className="logo-title"
            src="../images/logo-title.png"
            width={240}
            height={36}
            alt="Logo picture"
          />
        </Link>
      </h1>
    )
  }

  return (
    <div className="global-wrapper" data-is-root-path={isRootPath}>
      <header>{header}</header>
      <main>{children}</main>
    </div>
  )
}

export default Layout
