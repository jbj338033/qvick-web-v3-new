"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import axios from "@/lib/axios";
import { useTokenStore } from "@/stores/token";

import logo from "@/assets/images/logo.svg";

interface ProfileData {
  name: string;
  email: string;
  userRole: string;
}

const navigation = [
  { name: "메인 페이지", href: "/" },
  { name: "출석 인원", href: "/ckmember" },
  { name: "미출석 인원", href: "/nckmember" },
  { name: "공지사항", href: "/notices" },
];

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const { accessToken } = useTokenStore();

  const { data: profile } = useQuery<{ data: ProfileData }>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const { data } = await axios.get("/user");
      return data;
    },
    enabled: !!accessToken,
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
        isScrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-blue-500"
      )}
    >
      <nav className="flex items-center justify-between px-4 py-2 max-w-7xl mx-auto">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image
              src={logo}
              alt="Qvick 로고"
              width={38}
              height={38}
              className="h-9 w-auto"
            />
          </Link>
        </div>

        <ul className="hidden md:flex items-center space-x-8">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname === item.href
                    ? isScrolled
                      ? "text-blue-600 font-semibold"
                      : "text-white font-semibold"
                    : isScrolled
                    ? "text-gray-600 hover:text-blue-600"
                    : "text-white/80 hover:text-white"
                )}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          {accessToken && profile ? (
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full",
                isScrolled ? "bg-gray-100" : "bg-white"
              )}
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src="@/assets/images/profileImg.svg" />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  "text-sm font-medium",
                  isScrolled ? "text-gray-800" : "text-gray-800"
                )}
              >
                {profile.data.name}
              </span>
            </div>
          ) : null}

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={isScrolled ? "text-gray-700" : "text-white"}
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">메뉴 열기</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] px-6 py-8">
                <div className="flex flex-col space-y-6">
                  <div className="flex justify-between items-center">
                    <Image
                      src="@/assets/images/logo.svg"
                      alt="Qvick 로고"
                      width={32}
                      height={32}
                    />
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-5 w-5" />
                        <span className="sr-only">메뉴 닫기</span>
                      </Button>
                    </SheetTrigger>
                  </div>
                  <nav className="flex flex-col space-y-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "text-base font-medium transition-colors py-1",
                          pathname === item.href
                            ? "text-blue-600"
                            : "text-gray-600 hover:text-blue-600"
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
