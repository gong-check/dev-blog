import * as React from "react"
import getTeamInfo from "../utils/getTeamInfo"

const Bio = ({ name }) => {
  const { img, division } = getTeamInfo(name)

  return (
    <div className="bio">
      <img
        className="bio-avatar"
        src={img}
        width={50}
        height={50}
        alt="profile"
      />

      <div>
        <strong>{name}</strong>
        <div>우아한테크코스 4기 {division}</div>
      </div>
    </div>
  )
}

export default Bio
