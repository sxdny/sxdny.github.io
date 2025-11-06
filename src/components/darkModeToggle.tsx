import { Toggle } from "@/components/ui/toggle";
import { MoonIcon, SunIcon } from "lucide-react";
import { useState, useEffect } from "react";

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("dark") === "true";
  });

  useEffect(() => {
    localStorage.setItem("dark", darkMode.toString());
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <Toggle
      className="data-[state=on]:bg-transparent"
      onClick={() => {
        setDarkMode((prev) => !prev);
      }}
    >
      {darkMode ? <MoonIcon /> : <SunIcon />}
    </Toggle>
  );
}
