import CreatePostForm from '@/components/post/CreatePostForm';
import Breadcrumb from '@/components/common/Breadcrumb';

export default function CreatePostPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-8 px-4 sm:py-12">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 animate-fade-in">
                    <Breadcrumb
                        items={[
                            { label: 'Trang chủ', href: '/home' },
                            { label: 'Tạo bài viết', isActive: true }
                        ]}
                        className="mb-2"
                    />
                </div>

                <div className="relative">
                    {/* Decorative elements */}
                    <div className="hidden md:block absolute -top-6 -left-12 w-24 h-24 bg-blue-100 rounded-full opacity-50 blur-2xl"></div>
                    <div className="hidden md:block absolute -bottom-8 -right-12 w-32 h-32 bg-orange-100 rounded-full opacity-50 blur-2xl"></div>

                    <CreatePostForm />
                </div>
            </div>
        </div>
    );
} 