import { useEffect, useState } from "react"

const useScroll = () => {
  const [scrollPosition, setScrollPosition] = useState(window.scrollY)

  const updateScroll = () => {
    setScrollPosition(window.scrollY || document.documentElement.scrollTop)
  }

  useEffect(() => {
    window.addEventListener("scroll", updateScroll)
  })

  return { scrollPosition }
}

export default useScroll
