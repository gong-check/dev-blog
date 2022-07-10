import React, { useEffect, useRef, useState } from "react"
import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"
import ScrollUpButton from "./ScrollUpButton"

const Layout = ({ location, title, children }) => {
  const [scrollPosition, setScrollPosition] = useState(0)
  const layoutRef = useRef(null)
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath

  const updateScroll = () => {
    setScrollPosition(window.scrollY)
  }

  const onClickUpScrollPage = () => {
    layoutRef.current.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    window.addEventListener("scroll", updateScroll)
    layoutRef.current.scrollIntoView()
  }, [])

  let header

  if (isRootPath) {
    header = (
      <>
        <h1
          className={scrollPosition < 24 ? "main-heading-top" : "main-heading"}
        >
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
      <h1 className="main-heading main-heading-scroll">
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
      <footer></footer>
      <ScrollUpButton onClick={onClickUpScrollPage} />
    </div>
  )
}

export default Layout
