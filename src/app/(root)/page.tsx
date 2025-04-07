"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Clock, Calendar, Users, User, FileSpreadsheet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import axios from "@/lib/axios";

type Gender = "MALE" | "FEMALE";
type UserRole = "USER" | "ADMIN" | "TEACHER";
type SortCriteriaType = "학번" | "이름" | "호실" | "출석 여부";

interface Member {
  email: string;
  name: string;
  stdId: string;
  room: string;
  phoneNum: string;
  userRole: UserRole;
  gender: Gender;
  checked: boolean;
  checkedDate: string;
}

export default function MainPage(): React.ReactElement {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs().format("YYYY-MM-DD")
  );
  const [sortCriteria, setSortCriteria] = useState<SortCriteriaType>("학번");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const {
    data: members = [],
    isLoading,
    isError,
  } = useQuery<Member[]>({
    queryKey: ["getAllMembers"],
    queryFn: async (): Promise<Member[]> => {
      const { data } = await axios.get<{ data: Member[] }>("/user/list", {
        params: { page: 1, size: 100 },
      });
      return data.data.filter((member) => member.userRole === "USER");
    },
    staleTime: 30 * 1000,
  });

  const downloadExcel = async (): Promise<void> => {
    try {
      const response = await axios.get("/export/excel", {
        params: {
          date: selectedDate,
          sortBy: sortCriteria,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `전체_명단_${selectedDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("엑셀 다운로드 오류:", error);
    }
  };

  const sortedMembers = [...members].sort((a: Member, b: Member) => {
    switch (sortCriteria) {
      case "학번":
        return a.stdId.localeCompare(b.stdId);
      case "이름":
        return a.name.localeCompare(b.name);
      case "호실":
        return a.room.localeCompare(b.room);
      case "출석 여부":
        return a.checked === b.checked ? 0 : a.checked ? -1 : 1;
      default:
        return 0;
    }
  });

  const checkedMembersCount = members.filter((member) => member.checked).length;
  const uncheckedMembersCount = members.length - checkedMembersCount;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p className="text-lg">로딩 중...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p className="text-lg text-red-500">
          데이터를 불러오는 중 오류가 발생했습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Card className="w-full sm:w-64 bg-white shadow-sm">
            <CardContent className="flex items-center p-4">
              <Clock className="h-5 w-5 mr-3 text-gray-500" />
              <span className="text-sm font-medium">
                {dayjs(currentTime).format("HH:mm:ss")}
              </span>
            </CardContent>
          </Card>

          <Card className="w-full sm:w-64 bg-white shadow-sm">
            <CardContent className="flex items-center p-4">
              <Calendar className="h-5 w-5 mr-3 text-gray-500" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border-none p-0 h-auto focus-visible:ring-0"
              />
            </CardContent>
          </Card>
        </div>

        <Button
          onClick={downloadExcel}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          엑셀로 출력
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white shadow-sm">
          <CardContent className="flex items-center p-4">
            <Users className="h-5 w-5 mr-3 text-gray-500" />
            <span className="text-sm font-medium">
              전체 인원: {members.length}명
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="flex items-center p-4">
            <User className="h-5 w-5 mr-3 text-emerald-500" />
            <span className="text-sm font-medium">
              출석자 수:{" "}
              <span className="text-emerald-500">{checkedMembersCount}명</span>
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="flex items-center p-4">
            <User className="h-5 w-5 mr-3 text-red-500" />
            <span className="text-sm font-medium">
              미출석 인원:{" "}
              <span className="text-red-500">{uncheckedMembersCount}명</span>
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <Select
              value={sortCriteria}
              onValueChange={(value) =>
                setSortCriteria(value as SortCriteriaType)
              }
            >
              <SelectTrigger className="w-full border-none focus:ring-0">
                <SelectValue placeholder="정렬 기준" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="학번">학번</SelectItem>
                <SelectItem value="이름">이름</SelectItem>
                <SelectItem value="호실">호실</SelectItem>
                <SelectItem value="출석 여부">출석 여부</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
          <Table>
            <TableHeader className="bg-gray-50 sticky top-0">
              <TableRow>
                <TableHead className="w-[100px] text-center">학번</TableHead>
                <TableHead className="w-[80px] text-center">성별</TableHead>
                <TableHead className="w-[120px] text-center">이름</TableHead>
                <TableHead className="w-[100px] text-center">
                  출석 여부
                </TableHead>
                <TableHead className="w-[150px] text-center">
                  전화번호
                </TableHead>
                <TableHead className="w-[100px] text-center">호실</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMembers.map((member) => (
                <TableRow key={member.stdId}>
                  <TableCell className="text-center">{member.stdId}</TableCell>
                  <TableCell className="text-center">
                    {member.gender === "MALE" ? "남" : "여"}
                  </TableCell>
                  <TableCell className="text-center">{member.name}</TableCell>
                  <TableCell className="text-center">
                    <span
                      className={
                        member.checked
                          ? "text-emerald-500 font-medium"
                          : "text-red-500 font-medium"
                      }
                    >
                      {member.checked ? "출석" : "미출석"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {member.phoneNum}
                  </TableCell>
                  <TableCell className="text-center">{member.room}호</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
