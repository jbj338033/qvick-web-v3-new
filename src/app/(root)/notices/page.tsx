"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Pencil, Trash2, Plus, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import axios from "@/lib/axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Notice {
  idx: number;
  title: string;
  content: string;
  writer: string;
  createdDateTime: string;
  modifiedDateTime: string;
}

export default function NoticesPage() {
  const [activeNoticeId, setActiveNoticeId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: notices = [],
    isLoading,
    refetch,
  } = useQuery<Notice[]>({
    queryKey: ["notices"],
    queryFn: async () => {
      const { data } = await axios.get("/notice/list");
      return data.data;
    },
    staleTime: 30 * 1000,
  });

  const { mutate: deleteNotice, isPending: isDeletingNotice } = useMutation({
    mutationFn: async (noticeId: number) => {
      await axios.delete(`/notice/${noticeId}`);
    },
    onSuccess: () => {
      toast.success("공지사항이 삭제되었습니다.");
      refetch();
    },
    onError: () => {
      toast.error("공지사항 삭제 중 오류가 발생했습니다.");
    },
  });

  const { mutate: createNotice, isPending: isCreatingNotice } = useMutation({
    mutationFn: async (newNotice: { title: string; content: string }) => {
      const { data } = await axios.post("/notice", newNotice);
      return data.data;
    },
    onSuccess: () => {
      toast.success("공지사항이 등록되었습니다.");
      closeCreateDialog();
      refetch();
    },
    onError: () => {
      toast.error("공지사항 등록 중 오류가 발생했습니다.");
    },
  });

  const handleDeleteNotice = (id: number) => {
    deleteNotice(id);
  };

  const handleCreateNotice = () => {
    if (!noticeTitle.trim() || !noticeContent.trim()) {
      toast.error("제목과 내용을 입력해주세요.");
      return;
    }
    createNotice({ title: noticeTitle, content: noticeContent });
  };

  const closeCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setNoticeTitle("");
    setNoticeContent("");
  };

  const toggleNoticeSelection = (id: number) => {
    setActiveNoticeId(activeNoticeId === id ? null : id);
  };

  const filteredNotices = notices.filter(
    (notice) =>
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-24 px-4">
      <div className="w-full max-w-4xl mx-auto">
        <Card className="mb-6 shadow-md sticky top-20 z-10 bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <CardTitle className="text-xl font-bold">공지사항</CardTitle>
              <div className="flex items-center gap-2 w-full sm:w-auto sm:max-w-md">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="찾으시는 점호내용을 입력해주세요"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Dialog
                  open={isCreateDialogOpen}
                  onOpenChange={setIsCreateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="rounded-full">
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
                      <Input
                        placeholder="제목을 입력하세요"
                        value={noticeTitle}
                        onChange={(e) => setNoticeTitle(e.target.value)}
                      />
                      <Textarea
                        placeholder="내용을 입력하세요"
                        value={noticeContent}
                        onChange={(e) => setNoticeContent(e.target.value)}
                        className="min-h-[120px] resize-none"
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={closeCreateDialog}>
                        취소
                      </Button>
                      <Button
                        onClick={handleCreateNotice}
                        disabled={
                          isCreatingNotice ||
                          !noticeTitle.trim() ||
                          !noticeContent.trim()
                        }
                      >
                        {isCreatingNotice ? "등록 중..." : "등록"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="space-y-4">
          {filteredNotices.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <div className="flex flex-col items-center justify-center py-6">
                  <AlertTriangle className="h-10 w-10 text-muted-foreground mb-2" />
                  <p>등록된 공지사항이 없습니다.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredNotices.map((notice) => (
              <Card
                key={notice.idx}
                className={`cursor-pointer transition-all ${
                  activeNoticeId === notice.idx
                    ? "border-blue-500 bg-blue-50"
                    : "hover:border-blue-200 hover:bg-blue-50/30"
                }`}
                onClick={() => toggleNoticeSelection(notice.idx)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{notice.title}</CardTitle>
                  <CardDescription>
                    {format(
                      new Date(notice.createdDateTime),
                      "yyyy년 MM월 dd일"
                    )}
                    {notice.writer && ` · ${notice.writer}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-line">
                    {notice.content}
                  </p>
                </CardContent>
                <CardFooter className="justify-end gap-2">
                  <Button
                    variant="outline"
                    className="text-amber-600 border-amber-600 hover:bg-amber-50 hover:text-amber-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.info("수정 기능은 추후 구현 예정입니다.");
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-1" /> 수정
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> 삭제
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          정말 삭제하시겠습니까?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          이 작업은 되돌릴 수 없습니다. 공지사항이 영구적으로
                          삭제됩니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotice(notice.idx);
                          }}
                          disabled={isDeletingNotice}
                        >
                          {isDeletingNotice ? "삭제 중..." : "삭제"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
