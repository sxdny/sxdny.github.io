import type { Project } from "@/lib/projects";
import { ArrowUpRight } from "lucide-react";

export default function ShowProject({ project }: {
  project: Project
}) {
  return (
    <div className="flex flex-col-reverse md:flex-row w-full pb-2 border-b">
      <div className="py-2 w-1/8">
        <span> {project.year} </span>
      </div>
      <div className="flex flex-col gap-1 p-0 md:p-1 w-full">
        <a className="flex items-center hover:text-lime-600 dark:hover:text-lime-400 w-fit underline text-xl" href={project.url}> {project.name} <ArrowUpRight className="size-3.5" /> </a>
        <p className="text-md"> {project.description} </p>
      </div>
    </div>
  )
}
