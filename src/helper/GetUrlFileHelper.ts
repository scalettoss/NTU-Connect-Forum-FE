export const getFileFromUrl = (url: string) => {
    return `${process.env.NEXT_PUBLIC_BE_URL}${url}`;
};

