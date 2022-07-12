import React, { useEffect, useRef, useState } from "react"
import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"
import ScrollUpButton from "./ScrollUpButton"
import useScroll from "../hooks/useScroll"

const Layout = ({ location, title, children }) => {
  const { scrollPosition } = useScroll()
  const layoutRef = useRef(null)
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath

  const onClickUpScrollPage = () => {
    layoutRef.current.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
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
        <section className="main-section">
          <div className="main-section-image-wrapper">
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
      <main className="content-wrapper">{children}</main>
      <footer></footer>
      <ScrollUpButton onClick={onClickUpScrollPage} />
    </div>
  )
}

export default Layout
