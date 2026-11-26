// File/metadata validation is not medical review. Keep internal status codes out of UI.
export function verificationLabel(status?: string | null): string {
  switch (status) {
    case "expert_reviewed":
      return "전문가 검수 완료";
    case "source_checked":
      return "출처 확인 · 전문의 검수 전";
    case "editorial_draft_not_exam_validated":
      return "초안 · 시험 문항 검증 전";
    case "draft":
    case "metadata_checked":
    case "all_paths_hashes_and_fma_checked":
    case "attachment_metadata_bounds_and_file_hash_verified":
      return "전문의 검수 전";
    default:
      return "검수 정보 없음";
  }
}
