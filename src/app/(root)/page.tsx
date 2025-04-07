"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  Clock,
  Calendar,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Users,
  Search,
  RefreshCw,
  Filter,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import axios from "@/lib/axios";

type Gender = "MALE" | "FEMALE";
type UserRole = "USER" | "ADMIN" | "TEACHER";
type SortCriteriaType = "학번" | "이름" | "호실" | "출석 여부";
type AttendanceFilter = "전체" | "출석" | "미출석";
type GenderFilter = "전체" | "남성" | "여성";

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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [attendanceFilter, setAttendanceFilter] =
    useState<AttendanceFilter>("전체");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("전체");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const {
    data: members = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<Member[]>({
    queryKey: ["getAllMembers", selectedDate],
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
      const response = await axios.get("/check/export/excel", {
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

  const refreshData = () => {
    refetch();
  };

  const resetFilters = () => {
    setSearchTerm("");
    setAttendanceFilter("전체");
    setGenderFilter("전체");
    setSortCriteria("학번");
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      searchTerm === "" ||
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.stdId.includes(searchTerm) ||
      member.room.includes(searchTerm);

    const matchesAttendance =
      attendanceFilter === "전체" ||
      (attendanceFilter === "출석" && member.checked) ||
      (attendanceFilter === "미출석" && !member.checked);

    const matchesGender =
      genderFilter === "전체" ||
      (genderFilter === "남성" && member.gender === "MALE") ||
      (genderFilter === "여성" && member.gender === "FEMALE");

    return matchesSearch && matchesAttendance && matchesGender;
  });

  const sortedMembers = [...filteredMembers].sort((a: Member, b: Member) => {
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
  const attendanceRate =
    members.length > 0
      ? Math.round((checkedMembersCount / members.length) * 100)
      : 0;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent border-blue-500"></div>
          <p className="text-sm text-gray-500">데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-600 font-medium">
            데이터를 불러오는 중 오류가 발생했습니다.
          </p>
          <p className="text-sm text-red-500 mt-1">
            잠시 후 다시 시도해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-800">출석 현황</h1>
            <p className="text-sm text-gray-500 mt-1">
              {dayjs(selectedDate).format("YYYY년 M월 D일")} 기준
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              <span>{dayjs(currentTime).format("HH:mm:ss")}</span>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border-0 p-0 h-7 focus-visible:ring-0 text-sm"
              />
            </div>

            <Button
              onClick={downloadExcel}
              className="bg-green-500 hover:bg-green-600 text-white h-8 px-3 gap-1.5 rounded"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-sm">엑셀</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center py-3 px-4 bg-blue-50 rounded">
            <Users className="h-5 w-5 text-blue-600 mr-3" />
            <div>
              <div className="text-xs text-gray-500">전체 인원</div>
              <div className="text-lg font-medium text-gray-800">
                {members.length}명
              </div>
            </div>
          </div>

          <div className="flex items-center py-3 px-4 bg-green-50 rounded">
            <CheckCircle2 className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <div className="text-xs text-gray-500">출석</div>
              <div className="text-lg font-medium text-green-600">
                {checkedMembersCount}명
              </div>
            </div>
          </div>

          <div className="flex items-center py-3 px-4 bg-red-50 rounded">
            <XCircle className="h-5 w-5 text-red-600 mr-3" />
            <div>
              <div className="text-xs text-gray-500">미출석</div>
              <div className="text-lg font-medium text-red-600">
                {uncheckedMembersCount}명
              </div>
            </div>
          </div>

          <div className="flex items-center py-3 px-4 bg-gray-50 rounded">
            <div className="w-full">
              <div className="text-xs text-gray-500 mb-1 flex items-center justify-between">
                <span>출석률</span>
                <span className="font-medium text-gray-800">
                  {attendanceRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full"
                  style={{ width: `${attendanceRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative w-full sm:w-auto flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="이름, 학번, 호실 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 h-9 w-full text-sm border-gray-200"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 flex gap-2 text-gray-600 border-gray-200"
              >
                <Filter className="h-4 w-4" />
                <span>필터</span>
                {(attendanceFilter !== "전체" || genderFilter !== "전체") && (
                  <Badge className="ml-1 bg-blue-100 text-blue-800 hover:bg-blue-100 px-1.5 h-5 text-xs">
                    {attendanceFilter !== "전체" && genderFilter !== "전체"
                      ? "2"
                      : "1"}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>필터 옵션</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-gray-500">
                  출석 상태
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setAttendanceFilter("전체")}
                  className={
                    attendanceFilter === "전체"
                      ? "bg-blue-50 text-blue-600"
                      : ""
                  }
                >
                  전체
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setAttendanceFilter("출석")}
                  className={
                    attendanceFilter === "출석"
                      ? "bg-blue-50 text-blue-600"
                      : ""
                  }
                >
                  출석
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setAttendanceFilter("미출석")}
                  className={
                    attendanceFilter === "미출석"
                      ? "bg-blue-50 text-blue-600"
                      : ""
                  }
                >
                  미출석
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-gray-500">
                  성별
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setGenderFilter("전체")}
                  className={
                    genderFilter === "전체" ? "bg-blue-50 text-blue-600" : ""
                  }
                >
                  전체
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setGenderFilter("남성")}
                  className={
                    genderFilter === "남성" ? "bg-blue-50 text-blue-600" : ""
                  }
                >
                  남성
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setGenderFilter("여성")}
                  className={
                    genderFilter === "여성" ? "bg-blue-50 text-blue-600" : ""
                  }
                >
                  여성
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={resetFilters}
              >
                필터 초기화
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>

          <Select
            value={sortCriteria}
            onValueChange={(value) =>
              setSortCriteria(value as SortCriteriaType)
            }
          >
            <SelectTrigger className="h-9 w-28 border-gray-200 text-sm">
              <SelectValue placeholder="정렬 기준" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="학번">학번</SelectItem>
              <SelectItem value="이름">이름</SelectItem>
              <SelectItem value="호실">호실</SelectItem>
              <SelectItem value="출석 여부">출석 여부</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={refreshData}
            disabled={isFetching}
            variant="outline"
            size="sm"
            className="h-9 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 ${isFetching ? "animate-spin" : ""}`}
            />
            <span className="text-sm">새로고침</span>
          </Button>
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span>
            총{" "}
            <span className="font-medium text-gray-900">
              {sortedMembers.length}
            </span>
            명의 인원이 조회되었습니다
          </span>
          {(attendanceFilter !== "전체" || genderFilter !== "전체") && (
            <div className="flex gap-1">
              {attendanceFilter !== "전체" && (
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-100 px-2"
                >
                  {attendanceFilter}
                </Badge>
              )}
              {genderFilter !== "전체" && (
                <Badge
                  variant="outline"
                  className="bg-purple-50 text-purple-700 border-purple-100 px-2"
                >
                  {genderFilter}
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="text-xs text-gray-400">
          마지막 업데이트: {dayjs().format("YYYY-MM-DD HH:mm:ss")}
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-gray-200">
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
          <Table>
            <TableHeader className="bg-gray-50 sticky top-0">
              <TableRow className="border-b border-gray-200">
                <TableHead className="w-[80px] text-center text-gray-600 font-medium py-3 bg-gray-50">
                  학번
                </TableHead>
                <TableHead className="w-[60px] text-center text-gray-600 font-medium py-3 bg-gray-50">
                  성별
                </TableHead>
                <TableHead className="w-[100px] text-gray-600 font-medium py-3 bg-gray-50">
                  이름
                </TableHead>
                <TableHead className="w-[90px] text-center text-gray-600 font-medium py-3 bg-gray-50">
                  출석 상태
                </TableHead>
                <TableHead className="w-[130px] text-gray-600 font-medium py-3 bg-gray-50">
                  전화번호
                </TableHead>
                <TableHead className="w-[80px] text-center text-gray-600 font-medium py-3 bg-gray-50">
                  호실
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMembers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-gray-500"
                  >
                    조회된 인원이 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                sortedMembers.map((member) => (
                  <TableRow
                    key={member.stdId}
                    className={`
                      hover:bg-blue-50/50 border-b border-gray-100 transition-colors
                      ${member.checked ? "bg-white" : "bg-gray-50/50"}
                    `}
                  >
                    <TableCell className="py-2.5 text-sm font-mono text-center text-gray-700">
                      {member.stdId}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-center">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                          member.gender === "MALE"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-pink-50 text-pink-700"
                        }`}
                      >
                        {member.gender === "MALE" ? "남" : "여"}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 text-sm font-medium text-gray-800">
                      {member.name}
                    </TableCell>
                    <TableCell className="py-2.5 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-2 py-0.5 text-xs rounded-full min-w-[56px] ${
                          member.checked
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {member.checked ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" /> 출석
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" /> 미출석
                          </>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-gray-600">
                      {member.phoneNum}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-center font-medium text-gray-700">
                      {member.room}호
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500 flex justify-end items-center">
        <div>
          출석률:{" "}
          <span className="font-medium text-blue-600">{attendanceRate}%</span> (
          {checkedMembersCount}/{members.length}명)
        </div>
      </div>
    </div>
  );
}
