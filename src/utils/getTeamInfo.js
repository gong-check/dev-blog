const TEAM_INFO = Object.freeze({
  온스타: {
    img: "https://avatars.githubusercontent.com/u/62434898?v=4",
    division: "FE",
  },
  코카콜라: {
    img: "https://avatars.githubusercontent.com/u/56149367?v=4",
    division: "FE",
  },
  어썸오: {
    img: "https://avatars.githubusercontent.com/u/63030569?v=4",
    division: "BE",
  },
  찬: {
    img: "https://avatars.githubusercontent.com/u/55445564?v=4",
    division: "BE",
  },
  오리: {
    img: "https://avatars.githubusercontent.com/u/69106910?v=4",
    division: "BE",
  },
  쿼리치: {
    img: "https://avatars.githubusercontent.com/u/83967672?v=4",
    division: "BE",
  },
  범고래: {
    img: "https://avatars.githubusercontent.com/u/48307960?v=4",
    division: "BE",
  },
  default: {
    img: "https://avatars.githubusercontent.com/u/108911083?s=200&v=4",
    division: "BE",
  },
})

const getTeamInfo = name => {
  if (TEAM_INFO[name]) return TEAM_INFO[name]
  return TEAM_INFO["default"]
}

export default getTeamInfo
