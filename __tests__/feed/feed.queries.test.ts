const mockGetSession = jest.fn();
const mockUserProfileFindFirst = jest.fn();
const mockPostFindMany = jest.fn();
const mockPostFindFirst = jest.fn();

jest.mock("@/lib/authSession", () => ({
  getSession: (...args: unknown[]) => mockGetSession(...args),
}));

jest.mock("@/lib/prisma", () => ({
  myPrisma: {
    userProfile: {
      findFirst: (...args: unknown[]) => mockUserProfileFindFirst(...args),
    },
    post: {
      findMany: (...args: unknown[]) => mockPostFindMany(...args),
      findFirst: (...args: unknown[]) => mockPostFindFirst(...args),
    },
  },
}));

import { getFollowingFeedHeadQuery, getFollowingPage } from "@/lib/feed/queries";

describe("following feed queries", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGetSession.mockResolvedValue({ user: { id: "auth-user-123" } });
    mockUserProfileFindFirst.mockResolvedValue({ id: "profile-123" });
    mockPostFindMany.mockResolvedValue([]);
    mockPostFindFirst.mockResolvedValue(null);
  });

  it("excludes unsafe posts from the following feed page", async () => {
    await getFollowingPage(null);

    expect(mockPostFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
          moderationStatus: { not: "UNSAFE" },
          author: expect.objectContaining({
            deletedAt: null,
            relationWhereUserIsFollower: {
              some: { followerProfileId: "profile-123" },
            },
          }),
        }),
      }),
    );
  });

  it("excludes unsafe posts when checking the following feed head", async () => {
    await getFollowingFeedHeadQuery();

    expect(mockPostFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
          moderationStatus: { not: "UNSAFE" },
          author: expect.objectContaining({
            deletedAt: null,
            relationWhereUserIsFollower: {
              some: { followerProfileId: "profile-123" },
            },
          }),
        }),
      }),
    );
  });
});
