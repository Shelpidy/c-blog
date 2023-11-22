declare type Verification = {
    verificationData: {
        verified: boolean;
        verificationRank: "low" | "medium" | "high";
    };
    userId: string;
};
