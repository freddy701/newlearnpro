"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { useState, useEffect } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

const navItems = [
  {
    name: "Accueil",
    href: "#hero",
  },
  {
    name: "Fonctionnalités",
    href: "#features",
  },
  {
    name: "Cours",
    href: "#courses",
  },
  {
    name: "Témoignages",
    href: "#testimonials",
  },
  {
    name: "Tarifs",
    href: "#pricing",
  },
  {
    name: "Contact",
    href: "#contact",
  },
]

export function Navbar() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)

  // Détecte le défilement pour changer l'apparence de la navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Fonction pour faire défiler vers une section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId.replace("#", ""))
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              LearnPro
            </span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {navItems.map((item, index) => (
              <button
                key={index}
                onClick={() => scrollToSection(item.href)}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.name}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Se connecter
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">S&apos;inscrire</Button>
            </Link>
          </div>
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="pr-0">
              <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
              <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                <div className="flex flex-col gap-4">
                  <Link
                    href="/"
                    className="flex items-center space-x-2 mb-6"
                  >
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      LearnPro
                    </span>
                  </Link>
                  <div className="flex flex-col gap-3">
                    {navItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          scrollToSection(item.href)
                          document.querySelector('[data-state="open"]')?.setAttribute('data-state', 'closed')
                        }}
                        className="text-base font-medium transition-colors hover:text-primary"
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    <Link href="/auth/login">
                      <Button variant="ghost" className="w-full justify-start">
                        Se connecter
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button className="w-full">S&apos;inscrire</Button>
                    </Link>
                  </div>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
