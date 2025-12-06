import { getPosts } from "./posts";
import type { Post } from "./posts";

export interface Tag {
  name: string;
}

export interface Path {
  params: {
    tag: string;
  };
}

export function getTagsPaths(): Path[] {
  const tags = getTags();
  const paths: Path[] = [];

  tags.map((tag) => {
    paths.push({
      params: {
        tag: tag.toLowerCase(),
      },
    });
  });

  return paths;
}

const posts = getPosts();

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// Tag: data_science -> Data Science
export function getPrettyTag(tag: String) {
  let prettyTag: String = "";
  let arrTag = tag.split("_");

  let i = 0;

  if (arrTag.length > 1) {
    arrTag.map((tag) => {
      prettyTag += capitalizeFirstLetter(tag)
      if (i < arrTag.length - 1) {
        prettyTag += " ";
      }
      i++;
    });
  } else {
    prettyTag = capitalizeFirstLetter(tag.toString())
  }

  return prettyTag
}

// Tag: Data Science -> data_science
export function getUglyTag(tag: String) {
  let formattedTag = "";
  let arrTag = tag.split(" ");

  let i = 0;
  if (arrTag.length > 1) {
    arrTag.map((tag) => {
      formattedTag += tag.toLowerCase();
      if (i < arrTag.length - 1) {
        formattedTag += "_";
      }
      i++;
    });
  } else {
    formattedTag = tag.toLowerCase();
  }

  return formattedTag;
}

// Return unique tags from posts.
export function getTags() {
  let tagsList: Array<String> = [];
  posts.forEach((post: Post) => {
    post.frontmatter.tags.forEach((tag: String) => {
      let fTag = getUglyTag(tag);

      !tagsList.includes(tag) ? tagsList.push(fTag) : {};
    });
  });
  return tagsList;
}
