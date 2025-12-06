import { getPrettyTag, getUglyTag } from "./tags";

export interface Post {
  frontmatter: {
    layout: string;
    title: string;
    description: string;
    date: string;
    tags: Array<String>;
  };
  [key: string]: any;
}

export function getPosts(): Array<Post> {
  return Object.values(
    import.meta.glob("/src/pages/posts/*.md", { eager: true }),
  );
}

export function getPostsWithTag(param_tag: string): Array<Post> {
  let posts = getPosts();
  let postsWithTag: Array<Post> = [];

  posts.map((post) => {
    post.frontmatter.tags.map((tag) => {
      if (getUglyTag(tag) == param_tag) {
        postsWithTag.push(post)
      }
    })
  });

  return postsWithTag
}
