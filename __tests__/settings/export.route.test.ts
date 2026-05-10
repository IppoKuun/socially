const mockGetSession = jest.fn();
const mockDataExportLimit = jest.fn();
const mockUserProfileFindUnique = jest.fn();
const mockPostFindMany = jest.fn();
const mockPostLikeFindMany = jest.fn();
const mockCommentLikeFindMany = jest.fn();
const mockCommentFindMany = jest.fn();

jest.mock("@/lib/authSession", () => ({
  getSession: (...args: unknown[]) => mockGetSession(...args),
}));

jest.mock("@/lib/rateLimits", () => ({
  rateLimits: {
    dataExport: {
      limit: (...args: unknown[]) => mockDataExportLimit(...args),
    },
  },
}));

jest.mock("@/lib/prisma", () => ({
  myPrisma: {
    userProfile: {
      findUnique: (...args: unknown[]) => mockUserProfileFindUnique(...args),
    },
    post: {
      findMany: (...args: unknown[]) => mockPostFindMany(...args),
    },
    postLike: {
      findMany: (...args: unknown[]) => mockPostLikeFindMany(...args),
    },
    commentLike: {
      findMany: (...args: unknown[]) => mockCommentLikeFindMany(...args),
    },
    comment: {
      findMany: (...args: unknown[]) => mockCommentFindMany(...args),
    },
  },
}));

import { GET } from "@/app/api/export/route";

describe("GET /api/export", () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue({ user: { id: "user-123" } });
    mockDataExportLimit.mockResolvedValue({
      success: true,
      reset: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
  });

  it("returns 429 when the data export rate limit is reached", async () => {
    const reset = Date.now() + 7 * 24 * 60 * 60 * 1000;
    mockDataExportLimit.mockResolvedValueOnce({
      success: false,
      reset,
    });

    const response = await GET();
    const body = await response.json();

    expect(mockDataExportLimit).toHaveBeenCalledWith("user-123");
    expect(response.status).toBe(429);
    expect(body).toEqual({
      error: "DATA_EXPORT_RATE_LIMITED",
      userMsg: "You have already exported your data this week.",
      resetAt: new Date(reset).toISOString(),
    });
    expect(mockUserProfileFindUnique).not.toHaveBeenCalled();
    expect(mockPostFindMany).not.toHaveBeenCalled();
    expect(mockPostLikeFindMany).not.toHaveBeenCalled();
    expect(mockCommentLikeFindMany).not.toHaveBeenCalled();
    expect(mockCommentFindMany).not.toHaveBeenCalled();
  });
});
