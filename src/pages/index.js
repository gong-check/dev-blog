import * as React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"
import getInfoFromSlug from "../utils/getInfoFromSlug"
import getTeamInfo from "../utils/getTeamInfo"
import { StaticImage } from "gatsby-plugin-image"

const BlogIndex = ({ data, location }) => {
  const [tagSelector, setTagSelector] = React.useState("All")
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes
  const TAG = ["All", "FE", "BE"]

  const onClickTagButton = (e, tag) => {
    setTagSelector(tag)
  }

  if (posts.length === 0) {
    return (
      <Layout location={location} title={siteTitle}>
        <Seo title="GongCheck" />
        <div className="no-posts">작성된 게시글이 존재하지 않습니다.</div>
      </Layout>
    )
  }

  return (
    <Layout location={location} title={siteTitle}>
      <Seo title="GongCheck" />
      <div className="list-wrapper">
        <ol style={{ listStyle: `none` }}>
          <div>
            {TAG.map(tag => (
              <button
                onClick={e => onClickTagButton(e, tag)}
                className={tag === tagSelector ? "tag-button-clicked" : ""}
              >
                {tag}
              </button>
            ))}
          </div>
          {posts.map(post => {
            const postInfo = getInfoFromSlug(post.fields.slug)
            const title = post.frontmatter.title || postInfo.title
            const { img, division } = getTeamInfo(postInfo.author)

            if (tagSelector !== "All" && division !== tagSelector) return
            return (
              <li key={post.fields.slug}>
                <article
                  className="post-list-item"
                  itemScope
                  itemType="http://schema.org/Article"
                >
                  <header>
                    <h2>
                      <Link to={post.fields.slug} itemProp="url">
                        <span itemProp="headline">{title}</span>
                      </Link>
                    </h2>
                  </header>
                  <section>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: post.frontmatter.description || post.excerpt,
                      }}
                      itemProp="description"
                    />
                  </section>
                  <footer>
                    <img src={img}></img>
                    <strong>{postInfo.author}</strong>
                    <small>{post.frontmatter.date || "작성 날짜 없음"}</small>
                  </footer>
                </article>
              </li>
            )
          })}
        </ol>
      </div>
    </Layout>
  )
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      nodes {
        excerpt
        fields {
          slug
        }
        frontmatter {
          date(formatString: "YYYY.MM.DD")
          title
          description
        }
      }
    }
  }
`
