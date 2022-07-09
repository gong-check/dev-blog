const getInfoFromSlug = slug => {
  const info = slug.split("/").filter(item => !!item)

  return { division: info[0], author: info[1], title: info[2] }
}

export default getInfoFromSlug
