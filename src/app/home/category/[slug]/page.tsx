import CategoryPosts from '@/components/category/CategoryPosts';
import { getCategoryById, getCategoryBySlug } from '@/services/CategoryService';
import { Metadata } from 'next';

type Props = {
    params: { slug: string };
    searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const { slug } = await params;
        const response = await getCategoryBySlug(slug)
        let categoryName = "Danh mục";
        if (response) {
            // @ts-ignore
            categoryName = response.data.name;
        }

        return {
            title: `${categoryName} | NTU Connect`,
            description: `Xem các bài viết trong danh mục ${categoryName}`,
        };
    } catch (error) {
        return {
            title: 'Danh mục | NTU Connect',
            description: 'Xem các bài viết trong danh mục',
        };
    }
}

export default async function CategoryPage({ params }: Props) {
    const { slug } = await params;
    let categoryName = "Danh mục";
    try {
        const response = await getCategoryBySlug(slug);
        if (response) {
            //@ts-ignore
            categoryName = response.data.name;
        }
    } catch (error) {
        console.error('Error fetching category:', error);
    }
    return (
        <>
            <CategoryPosts
                categoryName={categoryName}
                categorySlug={slug}
            />
        </>
    );
} 