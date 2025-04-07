"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User, Mail, Lock } from "lucide-react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";

import authSide from "@/assets/images/auth-side.svg";
import authTerms from "@/assets/images/auth-terms.svg";

const TERMS_OF_SERVICE = `
Qvick 이용약관
    
제1조 목적
Team C0nnect(이하 운영진)는 이용자(이하 유저)에게 기숙사 온라인 출석체크 서비스 "Qvick" (이하 서비스)를 이용하기 위한 약관과 그 정의를 서술하고 있습니다.
    
제2조 이용 조건
유저는 대구소프트웨어마이스터고등학교(이하 학교)에 재학 중이며, 기숙사 시설을 이용 중이거나 이용 예정인 자여야 합니다. 또한 운영진은 아래의 사항에 해당하지 않는 자에게 합당한 사유가 없는 한 서비스 이용을 수락, 제공해야 합니다.
1. 유저가 학교 재학생이 아닌 경우, 이는 자퇴 / 퇴학 등 현재 학교 서류 상으로 재학 중이지 않은 경우를 모두 포괄한다.
2. 유저가 현재 학교에 기숙사 시설을 이용 중이지 않을 경우, 시설 이용자라 함은 기숙사에 숙박하며 이용하는 것을 말한다.
3. 유저 정보를 허위/과장하여 작성하거나 타인의 개인정보를 도용하였을 경우. 이미 이용 중인 유저더라도 허위/과장된 정보 또는 도용 사실이 밝혀질 경우 즉시 회원 탈퇴 조치된다.
`;

const PRIVACY_POLICY = `
개인정보처리방침
    
제1조 목적
Team C0nnect(이하 운영진)는 대구소프트웨어마이스터고등학교(이하 학교)의 기숙사 관리 온라인 플랫폼 Qvick(이하 서비스) 이용을 위해 개인정보를 수집 및 관리하고 있습니다.
    
제2조 수집과 이용목적
운영진은 다음과 같은 개인정보를 유저에게서 수집합니다.
- 전자메일(e-mail)
- 유저의 주민등록등본 상의 실명
- 유저가 등록한 비밀번호
- 유저의 현재 학번과 호실
- 유저의 기숙사 출석 여부
`;

const termsSchema = z.object({
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "이용약관에 동의해주세요.",
  }),
  privacyAccepted: z.boolean().refine((val) => val === true, {
    message: "개인정보처리방침에 동의해주세요.",
  }),
});

const signupSchema = z.object({
  name: z.string().min(2, {
    message: "이름은 최소 2자 이상이어야 합니다.",
  }),
  email: z.string().email({
    message: "유효한 이메일 주소를 입력해주세요.",
  }),
  password: z.string().min(8, {
    message: "비밀번호는 최소 8자 이상이어야 합니다.",
  }),
});

type TermsFormValues = z.infer<typeof termsSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"terms" | "signup">("terms");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const termsForm = useForm<TermsFormValues>({
    resolver: zodResolver(termsSchema),
    defaultValues: {
      termsAccepted: false,
      privacyAccepted: false,
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  function onSubmitTerms(data: TermsFormValues) {
    setStep("signup");
  }

  async function onSubmitSignup(data: SignupFormValues) {
    setIsLoading(true);

    const signupData = {
      name: data.name,
      email: data.email,
      password: data.password,
      stdId: "0000",
      room: "000",
      phoneNum: "000-0000-0000",
      gender: "FEMALE",
    };

    try {
      await axios.post(`${apiUrl}/auth/sign-up/teacher`, signupData);
      toast.success("회원가입 성공!");
      router.push("/auth/login");
    } catch (error) {
      console.error("Signup error:", error);

      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        if (status === 400) {
          toast.error("잘못된 요청입니다. 입력 정보를 확인해주세요.");
        } else if (status === 409) {
          toast.error("이미 등록된 이메일입니다.");
        } else {
          toast.error("회원가입 중 오류가 발생했습니다.");
        }
      } else {
        toast.error("회원가입 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const renderCheckboxItem = (
    id: "termsAccepted" | "privacyAccepted",
    label: string
  ) => (
    <div className="flex items-start space-x-3">
      <Checkbox
        id={id}
        checked={termsForm.watch(id)}
        onCheckedChange={(checked) => {
          termsForm.setValue(id, checked === true);
        }}
        className="mt-0.5"
      />
      <div className="flex flex-col">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {termsForm.formState.errors[id] && (
          <p className="text-sm text-red-500 mt-1">
            {termsForm.formState.errors[id]?.message}
          </p>
        )}
      </div>
    </div>
  );

  const renderInputField = (
    id: keyof SignupFormValues,
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
          {...signupForm.register(id)}
          disabled={isLoading}
        />
      </div>
      {signupForm.formState.errors[id] && (
        <p className="text-sm text-red-500">
          {signupForm.formState.errors[id]?.message}
        </p>
      )}
    </div>
  );

  if (step === "terms") {
    return (
      <div className="flex w-full min-h-screen bg-gray-50">
        <div className="hidden lg:block lg:w-1/2 relative">
          <Image
            src={authTerms}
            alt="Terms"
            className="object-cover"
            fill
            priority
          />
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold mb-2 text-gray-900">회원가입</h1>
            <p className="text-gray-600 mb-10">
              Qvick 이용약관 및 개인정보처리방침에 동의해주세요.
            </p>

            <form
              onSubmit={termsForm.handleSubmit(onSubmitTerms)}
              className="space-y-8"
            >
              <div className="space-y-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem
                    value="terms"
                    className="border-b border-gray-200"
                  >
                    <AccordionTrigger className="text-base font-medium py-4 hover:no-underline text-gray-800 hover:text-blue-600">
                      이용약관
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="h-48 overflow-y-auto p-4 text-sm bg-white rounded-md border border-gray-100 shadow-sm">
                        {TERMS_OF_SERVICE}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {renderCheckboxItem("termsAccepted", "이용약관에 동의합니다")}

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem
                    value="privacy"
                    className="border-b border-gray-200"
                  >
                    <AccordionTrigger className="text-base font-medium py-4 hover:no-underline text-gray-800 hover:text-blue-600">
                      개인정보처리방침
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="h-48 overflow-y-auto p-4 text-sm bg-white rounded-md border border-gray-100 shadow-sm">
                        {PRIVACY_POLICY}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {renderCheckboxItem(
                  "privacyAccepted",
                  "개인정보처리방침에 동의합니다"
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors"
              >
                다음
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold mb-2 text-gray-900">회원가입</h1>
          <p className="text-gray-600 mb-10">
            회원가입을 위한 정보를 입력해주세요.
          </p>

          <form
            onSubmit={signupForm.handleSubmit(onSubmitSignup)}
            className="space-y-6"
          >
            {renderInputField(
              "name",
              "이름",
              "이름을 입력하세요",
              "text",
              <User size={18} />
            )}

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
                  <span>회원가입 중...</span>
                </div>
              ) : (
                "회원가입"
              )}
            </Button>

            <div className="text-center text-gray-600 mt-6">
              가입한 계정이 있으신가요?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                로그인으로 돌아가기
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
