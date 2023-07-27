declare type User = {
    userId: string;
    profilePicture: string;
    displayName: string;
};

declare type Comment = {
    commentId: string;
    content: string;
    user: User;
    createAt: string;
    lastlastUpdatedBy: string;
    likes: Like[] | number;
    comments?: Comment[] | number;
};

declare type Contributor = User;

declare type Like = {
    likeId: string;
    likeAt: string;
    user: User;
};

declare type Blog = {
    blogId: string;
    title: string;
    url: string;
    content: string;
    tags: User[];
    imageUrl: string;
    author: User;
    createAt: string;
    lastlastUpdatedBy: string;
    publishedAt: string;
    contributors: Contributor[];
    likes: Like[] | number;
    comments: Comment[] | number;
    status: "draft" | "published";
};
