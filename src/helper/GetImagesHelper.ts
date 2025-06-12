export const getImagesFromUrl = (url: string) => {
    return `${process.env.NEXT_PUBLIC_BE_URL}${url}`;
};