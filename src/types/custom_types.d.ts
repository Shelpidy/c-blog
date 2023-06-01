declare type User = {
    userId: string;
    profilePicture: string;
    displayName: string;
  };

  declare type Comment = {
    commentId:string;
    content: string;
    author: User;
    createAt: string;
    lastUpdatedAt: string;
    likes:Like[] | number
    commnts?:Comment[] | number
  };

  declare type Contributor = User;
  
  declare type Like = {
    likeId:string;
    likeAt: string;
    likeBy: User;
  };
  
  declare type Blog = {
    blogId: string;
    title: string;
    url: string;
    content: string;
    tags: string[];
    posterImage: string;
    author: User;
    createAt: string;
    lastUpdatedAt: string;
    publishedAt: string;
    contributors: Contributor[];
    likes: Like[] | number;
    comments:Comment[] | number,
    status: "draft" | "published";
  };
  