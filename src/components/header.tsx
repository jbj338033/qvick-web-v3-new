"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, User, LogOut } from "lucide-react";

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
  { name: "출석 현황", href: "/" },
  { name: "공지사항", href: "/notices" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const { accessToken, clearTokens } = useTokenStore();

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

  const handleLogout = () => {
    clearTokens();
    router.push("/auth/login");
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
        isScrolled
          ? "bg-white/95 backdrop-blur-sm border-b border-gray-200"
          : "bg-blue-500"
      )}
    >
      <nav className="flex items-center justify-between px-4 py-3 max-w-6xl mx-auto">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image
              src={logo}
              alt="Qvick 로고"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <span
              className={cn(
                "ml-2 text-xl font-medium",
                isScrolled ? "text-gray-800" : "text-white"
              )}
            >
              Teather
            </span>
          </Link>
        </div>

        <ul className="hidden md:flex items-center space-x-8">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-opacity-100",
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

        <div className="flex items-center gap-3">
          {accessToken && profile ? (
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors",
                  isScrolled ? "bg-gray-100" : "bg-white/10"
                )}
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src="/images/profileImg.svg" />
                  <AvatarFallback
                    className={
                      isScrolled
                        ? "bg-blue-100 text-blue-600"
                        : "bg-white/20 text-white"
                    }
                  >
                    <User className="h-3.5 w-3.5" />
                  </AvatarFallback>
                </Avatar>
                <span
                  className={cn(
                    "text-sm font-medium",
                    isScrolled ? "text-gray-800" : "text-white"
                  )}
                >
                  {profile.data.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className={cn(
                  "rounded-full h-8 w-8",
                  isScrolled
                    ? "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                    : "text-white/70 hover:text-white hover:bg-white/20"
                )}
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">로그아웃</span>
              </Button>
            </div>
          ) : null}

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "rounded-full",
                    isScrolled
                      ? "text-gray-700 hover:bg-gray-100"
                      : "text-white hover:bg-white/10"
                  )}
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">메뉴 열기</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] px-6 py-8">
                <div className="flex flex-col space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Image
                        src={logo}
                        alt="Qvick 로고"
                        width={28}
                        height={28}
                      />
                    </div>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                      >
                        <X className="h-5 w-5" />
                        <span className="sr-only">메뉴 닫기</span>
                      </Button>
                    </SheetTrigger>
                  </div>

                  {accessToken && profile ? (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage src="/images/profileImg.svg" />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800">
                          {profile.data.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {profile.data.email}
                        </span>
                      </div>
                    </div>
                  ) : null}

                  <nav className="flex flex-col space-y-1">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "text-base font-medium transition-colors py-2 px-3 rounded-md",
                          pathname === item.href
                            ? "text-blue-600 bg-blue-50"
                            : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="mt-4 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 justify-start gap-2 py-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>로그아웃</span>
                    </Button>
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
