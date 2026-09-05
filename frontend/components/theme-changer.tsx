"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export function ThemeChanger() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => { 
        setMounted(true); 
    }, []);

    if (!mounted) return

    return (
        <Button
            variant="outline"
            size="icon"
            className="cursor-pointer rounded-full p-2"
            onClick={() => {
                setTheme(theme === "light" ? "dark" : "light")
                toast.success(`Switched to ${theme === "light" ? "dark" : "light"} mode`)
            }}
        >
            {theme === "light" ? (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
            ) : (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}