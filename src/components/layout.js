import React, { useEffect, useRef, useState } from "react"
import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"
import ScrollUpButton from "./ScrollUpButton"
import useScroll from "../hooks/useScroll"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination, Navigation } from "swiper"

import "swiper/css"
import "swiper/css/pagination"

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
        <Swiper
          className="home_slider"
          spaceBetween={30}
          centeredSlides={true}
          modules={[Pagination, Autoplay, Navigation]}
          slidesPerView={1}
          loop={true}
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
        >
          <SwiperSlide>
            <StaticImage src="../images/1.png" alt="" />
          </SwiperSlide>
          <SwiperSlide>
            <StaticImage src="../images/2.png" alt="" />
          </SwiperSlide>
        </Swiper>
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
