import * as React from "react"
import { StaticImage } from "gatsby-plugin-image"

const Bio = ({ name }) => {
  return (
    <div className="bio">
      <StaticImage
        className="bio-avatar"
        layout="fixed"
        formats={["auto", "webp", "avif"]}
        src="../images/profile-pic.png"
        width={50}
        height={50}
        quality={95}
        alt="Profile picture"
      />
      <div>
        <strong>{name}</strong>
        <div>우아한테크코스 4기</div>
      </div>
    </div>
  )
}

export default Bio
