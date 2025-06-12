import { Metadata } from 'next';
import PostDetail from '@/components/post/PostDetail';
import { getPostDetailBySlug } from '@/services/PostService';

type Props = {
    params: { slug: string; postSlug: string };
    searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { postSlug } = params;
    try {
        const post = await getPostDetailBySlug(postSlug);
        // @ts-ignore
        const postData = post.data;
        return {
            title: postData.title,
            description: postData.content,
        };
    } catch (error) {
        return {
            title: 'Chi tiết bài viết',
            description: 'Chi tiết bài viết trên NTU Connect',
        };
    }
}

export default async function PostDetailPage({ params }: Props) {
    const { postSlug } = params;

    try {
        const post = await getPostDetailBySlug(postSlug);
        // @ts-ignore
        const postData = post.data;

        return (
            <div className="container mx-auto py-8 px-4 sm:px-6">
                <PostDetail post={postData} />
            </div>
        );
    } catch (error) {
        console.error("Error loading post:", error);
        return (
            <div className="container mx-auto py-8 px-4 sm:px-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold text-red-500">Lỗi khi tải bài viết</h1>
                    <p className="text-gray-600 mt-2">
                        Không thể tải bài viết này. Vui lòng thử lại sau hoặc chọn bài viết khác.
                    </p>
                </div>
            </div>
        );
    }
}
