import type { Project } from "@/lib/projects";
import { ArrowUpRight } from "lucide-react";

export default function ShowProject({ project }: {
  project: Project
}) {
  return (
    <div className="flex flex-col-reverse md:flex-row w-full pb-2 border-b">
      <div className="text-neutral-500 dark:text-neutral-400 py-2 w-1/8">
        <span> {project.year} </span>
      </div>
      <div className="flex flex-col gap-1 p-0 md:p-1 w-full">
        <a className="flex items-center hover:text-lime-600 dark:hover:text-lime-400 w-fit underline text-xl" href={project.url}> {project.name} <ArrowUpRight className="size-3.5" /> </a>
        <p className="text-md"> {project.description} </p>
        <div className="text-neutral-500 dark:text-neutral-400 w-fit py-1 flex gap-3 items-bottom text-sm">
          {project.technologies.map((tech) => (
            <span> {tech} </span>
          ))}
        </div>
      </div>
    </div>
  )
}
