import { useEffect } from "react";

/**
 * ページのタイトル（document.title）を動的に設定するカスタムフック
 * @param title ページ固有のタイトル。未指定の場合は "Video Ratings" のみ表示
 */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | Video Ratings` : "Video Ratings";

    return () => {
      document.title = "Video Ratings";
    };
  }, [title]);
}
