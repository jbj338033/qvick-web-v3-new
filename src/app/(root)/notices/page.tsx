"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Pencil,
  Trash2,
  Plus,
  AlertTriangle,
  Clock,
  Calendar,
  User,
  RefreshCw,
} from "lucide-react";
import dayjs from "dayjs";
import axios from "@/lib/axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Notice {
  idx: number;
  title: string;
  content: string;
  writer: string;
  createdDateTime: string;
  modifiedDateTime: string;
}

export default function NoticesPage() {
  const queryClient = useQueryClient();

  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: notices = [],
    isLoading,
    refetch,
    isFetching,
  } = useQuery<Notice[]>({
    queryKey: ["notices"],
    queryFn: async () => {
      const { data } = await axios.get("/notice/list");
      return data.data;
    },
    staleTime: 30 * 1000,
  });

  const { mutate: deleteNotice, isPending: isDeleting } = useMutation({
    mutationFn: async (noticeId: number) => {
      await axios.delete(`/notice`, {
        params: { idx: noticeId },
      });
    },
    onSuccess: () => {
      toast.success("공지사항이 삭제되었습니다.");
      queryClient.setQueryData<Notice[]>(["notices"], (oldNotices) => {
        return oldNotices
          ? oldNotices.filter((notice) => notice.idx !== selectedNotice?.idx)
          : [];
      });

      setIsDetailOpen(false);
      setIsDeleteOpen(false);
      setSelectedNotice(null);
      refetch();
    },
    onError: () => {
      toast.error("공지사항 삭제 중 오류가 발생했습니다.");
      setIsDeleteOpen(false);
    },
  });

  const { mutate: createNotice, isPending: isCreating } = useMutation({
    mutationFn: async (newNotice: { title: string; content: string }) => {
      const { data } = await axios.post("/notice", newNotice);
      return data.data;
    },
    onSuccess: (data) => {
      toast.success("공지사항이 등록되었습니다.");
      handleCreateClose();

      queryClient.setQueryData<Notice[]>(["notices"], (oldNotices) => {
        return oldNotices ? [...oldNotices, data] : [data];
      });

      refetch();
    },
    onError: () => {
      toast.error("공지사항 등록 중 오류가 발생했습니다.");
    },
  });

  const { mutate: updateNotice, isPending: isUpdating } = useMutation({
    mutationFn: async (updatedNotice: {
      idx: number;
      title: string;
      content: string;
    }) => {
      const { data } = await axios.patch(`/notice`, updatedNotice);
      return data.data;
    },
    onSuccess: () => {
      toast.success("공지사항이 수정되었습니다.");

      queryClient.setQueryData<Notice[]>(["notices"], (oldNotices) => {
        return oldNotices
          ? oldNotices.map((notice) =>
              notice.idx === selectedNotice?.idx
                ? { ...notice, title, content }
                : notice
            )
          : [];
      });

      setIsEditOpen(false);
      setIsDetailOpen(false);
      setSelectedNotice(null);
      refetch();
    },
    onError: () => {
      toast.error("공지사항 수정 중 오류가 발생했습니다.");
    },
  });

  const handleDelete = () => {
    if (selectedNotice) {
      deleteNotice(selectedNotice.idx);
    }
  };

  const handleCreate = () => {
    if (!title.trim() || !content.trim()) {
      toast.error("제목과 내용을 입력해주세요.");
      return;
    }
    createNotice({ title, content });
  };

  const handleUpdate = () => {
    if (!selectedNotice) return;
    if (!title.trim() || !content.trim()) {
      toast.error("제목과 내용을 입력해주세요.");
      return;
    }
    updateNotice({
      idx: selectedNotice.idx,
      title,
      content,
    });
  };

  const handleCreateClose = () => {
    setIsCreateOpen(false);
    setTitle("");
    setContent("");
  };

  const handleEditOpen = (notice: Notice, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    setSelectedNotice(notice);
    setTitle(notice.title);
    setContent(notice.content);
    setIsEditOpen(true);
  };

  const handleEditClose = () => {
    setIsEditOpen(false);
    setTitle("");
    setContent("");
  };

  const handleDetailOpen = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsDetailOpen(true);
  };

  const handleDeleteOpen = (event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    setIsDeleteOpen(true);
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("YYYY년 MM월 DD일");
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format("YYYY년 MM월 DD일 HH:mm");
  };

  const filteredNotices = notices.filter(
    (notice) =>
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-800">공지사항</h1>
            <p className="text-sm text-gray-500 mt-1">
              총 {filteredNotices.length}개의 공지사항이 있습니다
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => refetch()}
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

            <Dialog
              open={isCreateOpen}
              onOpenChange={(open) => {
                setIsCreateOpen(open);
                if (!open) {
                  setTitle("");
                  setContent("");
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white h-9 rounded">
                  <Plus className="h-4 w-4 mr-1" /> 글쓰기
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>공지사항 작성</DialogTitle>
                  <DialogDescription>
                    새로운 공지사항을 작성해주세요.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">제목</Label>
                    <Input
                      id="title"
                      placeholder="제목을 입력하세요"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">내용</Label>
                    <Textarea
                      id="content"
                      placeholder="내용을 입력하세요"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[120px] resize-none"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={handleCreateClose}
                    disabled={isCreating}
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={isCreating || !title.trim() || !content.trim()}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {isCreating ? "등록 중..." : "등록"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="제목, 내용 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 h-9 w-full text-sm border-gray-200"
          />
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-2 flex justify-between items-center">
        <div>
          총{" "}
          <span className="font-medium text-gray-900">
            {filteredNotices.length}
          </span>
          개의 공지사항이 조회되었습니다
        </div>
        <div className="text-xs text-gray-400">
          마지막 업데이트: {dayjs().format("YYYY-MM-DD HH:mm:ss")}
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-gray-200">
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
          {filteredNotices.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-gray-50">
              <div className="flex flex-col items-center justify-center py-6">
                <AlertTriangle className="h-10 w-10 text-gray-400 mb-2" />
                <p>등록된 공지사항이 없습니다.</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50 sticky top-0">
                <TableRow className="border-b border-gray-200">
                  <TableHead className="w-[60px] text-center text-gray-600 font-medium py-3 bg-gray-50">
                    번호
                  </TableHead>
                  <TableHead className="text-gray-600 font-medium py-3 bg-gray-50">
                    제목
                  </TableHead>
                  <TableHead className="w-[120px] text-gray-600 font-medium py-3 bg-gray-50">
                    작성자
                  </TableHead>
                  <TableHead className="w-[130px] text-gray-600 font-medium py-3 bg-gray-50">
                    등록일
                  </TableHead>
                  <TableHead className="w-[100px] text-center text-gray-600 font-medium py-3 bg-gray-50">
                    관리
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotices.map((notice) => (
                  <TableRow
                    key={notice.idx}
                    className="hover:bg-blue-50/50 border-b border-gray-100 transition-colors"
                    onClick={() => handleDetailOpen(notice)}
                  >
                    <TableCell className="py-2.5 text-sm font-medium text-center text-gray-700">
                      {notice.idx}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="max-w-xl">
                        <div className="font-medium text-gray-800 truncate">
                          {notice.title}
                        </div>
                        <div className="text-xs text-gray-500 truncate mt-1">
                          {notice.content}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-gray-600">
                      {notice.writer || "관리자"}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-gray-600">
                      {formatDate(notice.createdDateTime)}
                    </TableCell>
                    <TableCell className="py-2.5 text-center">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-amber-600 hover:bg-amber-50 hover:text-amber-700 h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditOpen(notice, e);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNotice(notice);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {selectedNotice && (
        <Dialog
          open={isDetailOpen}
          onOpenChange={(open) => {
            setIsDetailOpen(open);
            if (!open && !isEditOpen && !isDeleteOpen) {
              setSelectedNotice(null);
            }
          }}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl">
                  {selectedNotice.title}
                </DialogTitle>
                <Badge
                  variant="outline"
                  className="ml-2 text-xs font-normal bg-blue-50 text-blue-700 border-blue-100"
                >
                  공지사항 #{selectedNotice.idx}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <User className="h-3.5 w-3.5 mr-1" />
                  <span>{selectedNotice.writer || "관리자"}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  <span>
                    작성일: {formatDateTime(selectedNotice.createdDateTime)}
                  </span>
                </div>
                {selectedNotice.modifiedDateTime &&
                  dayjs(selectedNotice.modifiedDateTime).isAfter(
                    selectedNotice.createdDateTime
                  ) && (
                    <div className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>
                        수정일:{" "}
                        {formatDateTime(selectedNotice.modifiedDateTime)}
                      </span>
                    </div>
                  )}
              </div>
            </DialogHeader>
            <Separator className="my-4" />
            <div className="text-sm leading-relaxed whitespace-pre-line max-h-[300px] overflow-y-auto text-gray-700">
              {selectedNotice.content}
            </div>
            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button
                variant="outline"
                className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                onClick={() => {
                  setIsDetailOpen(false);
                  handleEditOpen(selectedNotice);
                }}
                disabled={isUpdating || isDeleting}
              >
                <Pencil className="h-4 w-4 mr-1" /> 수정
              </Button>
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                onClick={handleDeleteOpen}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-1" /> 삭제
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {selectedNotice && (
        <Dialog
          open={isEditOpen}
          onOpenChange={(open) => {
            setIsEditOpen(open);
            if (!open && !isDetailOpen) {
              setSelectedNotice(null);
              setTitle("");
              setContent("");
            }
          }}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>공지사항 수정</DialogTitle>
              <DialogDescription>
                공지사항 내용을 수정해주세요.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">제목</Label>
                <Input
                  id="edit-title"
                  placeholder="제목을 입력하세요"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-content">내용</Label>
                <Textarea
                  id="edit-content"
                  placeholder="내용을 입력하세요"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleEditClose}
                disabled={isUpdating}
              >
                취소
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={isUpdating || !title.trim() || !content.trim()}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isUpdating ? "수정 중..." : "수정"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open && !isDeleting && selectedNotice && !isDetailOpen) {
            setSelectedNotice(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 공지사항이 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
