import { Metadata } from "next";

export const metadata: Metadata = {
  title: "회원가입 | Qvick",
  description: "Qvick 서비스 회원가입 페이지입니다.",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
