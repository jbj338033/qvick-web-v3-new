"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Lock } from "lucide-react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTokenStore } from "@/stores/token";

import authSide from "@/assets/images/auth-side.svg";

const loginSchema = z.object({
  email: z.string().email({
    message: "유효한 이메일 주소를 입력해주세요.",
  }),
  password: z.string().min(6, {
    message: "비밀번호는 최소 6자 이상이어야 합니다.",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginResponse {
  status: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    userRole: string;
  };
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(form: LoginFormValues) {
    setIsLoading(true);

    try {
      const {
        data: { data },
      } = await axios.post<LoginResponse>(`${apiUrl}/auth/sign-in`, form);

      if (data.userRole !== "TEACHER" && data.userRole !== "ADMIN") {
        toast.error("사감 선생님 또는 관리자만 로그인할 수 있습니다.");
        return;
      }

      useTokenStore
        .getState()
        .setTokens(data.accessToken, data.refreshToken, data.userRole);

      toast.success("로그인 성공!");
      router.push("/");
    } catch (error) {
      console.error("Login error:", error);

      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        if (status === 401) {
          toast.error("이메일 또는 비밀번호가 일치하지 않습니다.");
        } else if (status === 404) {
          toast.error("등록되지 않은 이메일입니다.");
        } else {
          toast.error("로그인 중 오류가 발생했습니다.");
        }
      } else {
        toast.error("로그인 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const renderInputField = (
    id: keyof LoginFormValues,
    label: string,
    placeholder: string,
    type: string = "text",
    icon: React.ReactNode
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-gray-700 text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
        <Input
          id={id}
          placeholder={placeholder}
          type={type}
          className="pl-10 h-12 text-base rounded-md border-gray-200"
          {...form.register(id)}
          disabled={isLoading}
        />
      </div>
      {form.formState.errors[id] && (
        <p className="text-sm text-red-500">
          {form.formState.errors[id]?.message}
        </p>
      )}
    </div>
  );

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src={authSide}
          alt="Side"
          className="object-cover"
          fill
          priority
        />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">로그인</h1>
          <p className="text-gray-600 mb-10">
            로그인을 위한 정보를 입력해주세요.
          </p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {renderInputField(
              "email",
              "이메일",
              "이메일 주소를 입력하세요",
              "email",
              <Mail size={18} />
            )}

            {renderInputField(
              "password",
              "비밀번호",
              "비밀번호를 입력하세요",
              "password",
              <Lock size={18} />
            )}

            <Button
              type="submit"
              className="w-full h-12 mt-8 text-base font-semibold bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <span>로그인 중...</span>
                </div>
              ) : (
                "로그인"
              )}
            </Button>

            <div className="text-center text-gray-600 mt-6">
              가입한 계정이 없으신가요?{" "}
              <Link
                href="/auth/signup"
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                회원가입
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
