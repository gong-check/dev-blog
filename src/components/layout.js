import React, { useRef } from "react"
import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"
import ScrollUpButton from "./ScrollUpButton"

const Layout = ({ location, title, children }) => {
  const layoutRef = useRef(null)
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath
  let header

  const onClickUpScrollPage = () => {
    layoutRef.current.scrollIntoView()
  }

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
              alt="Main cover picture"
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
    <div
      className="global-wrapper"
      data-is-root-path={isRootPath}
      ref={layoutRef}
    >
      <header>{header}</header>
      <main>{children}</main>
      <ScrollUpButton onClick={onClickUpScrollPage} />
    </div>
  )
}

export default Layout
