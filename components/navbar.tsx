"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"

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
  // {
  //   name: "Tarifs",
  //   href: "#pricing",
  // },
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
        "w-full z-30 top-0 sticky bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-border transition-all",
        isScrolled ? "shadow-sm" : ""
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo à gauche */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo.jpg" alt="Logo LearnPro" width={48} height={48} className="w-10 h-10 object-contain" />
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent select-none">LearnPro</span>
        </Link>
        {/* Menu centré */}
        <ul className="hidden md:flex flex-1 justify-center gap-8">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "font-medium text-gray-700 dark:text-gray-200 hover:text-blue-700 dark:hover:text-blue-400 transition-colors px-2 py-1 rounded",
                  pathname === item.href ? "text-blue-700 dark:text-blue-400" : ""
                )}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
        {/* Actions à droite */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Se connecter
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">S'inscrire</Button>
            </Link>
          </div>
          <ThemeToggle />
          {/* Burger menu mobile */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Ouvrir le menu">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SheetTitle className="p-4 border-b border-border flex items-center gap-2">
                  <Image src="/images/logo.jpg" alt="Logo LearnPro" width={32} height={32} className="w-8 h-8 object-contain" />
                </SheetTitle>
                <ScrollArea className="h-full p-4">
                  <ul className="flex flex-col gap-4">
                    {navItems.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "font-medium text-gray-700 dark:text-gray-200 hover:text-blue-700 dark:hover:text-blue-400 transition-colors px-2 py-1 rounded block",
                            pathname === item.href ? "text-blue-700 dark:text-blue-400" : ""
                          )}
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col gap-2 mt-8">
                    <Link href="/auth/login">
                      <Button variant="ghost" className="w-full justify-start">
                        Se connecter
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button className="w-full">S'inscrire</Button>
                    </Link>
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  )
}
