import * as React from "react"
import { BsArrowUpCircleFill } from "react-icons/bs"

const ScrollUpButton = ({ onClick }) => {
  const handleClick = () => {
    onClick()
  }
  return (
    <div className="scroll-up-button" onClick={handleClick}>
      <BsArrowUpCircleFill size={50} />
    </div>
  )
}

export default ScrollUpButton
