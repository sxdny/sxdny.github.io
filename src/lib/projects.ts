const GH_URL_ORG = "https://github.com/getbettersn/";
const GH_URL = "https://github.com/sxdny/";

export interface Project {
  name: string,
  description: string,
  url: string,
  year: number,
  technologies: String[]
}

export let projects_list: Project[] = [
  {
    name: 'sn',
    description: 'Better sticky notes for macOS',
    url: GH_URL_ORG + "app",
    year: 2025,
    technologies: ['Rust', 'Tauri', 'React']
  }
]
