'use client'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { LoginRequestType, LoginRequest } from "@/types/user";
import { RegisterRequestType, RegisterRequest } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { login, register } from "@/app/api/authservice";
import { Input } from "@/components/ui/input";
import { toast, Toaster } from "react-hot-toast";


const AuthForm = () => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const router = useRouter();
    const [activeForm, setActiveForm] = useState<'login' | 'register'>('login');

    const formLogin = useForm<LoginRequestType>({
        resolver: zodResolver(LoginRequest),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const formRegister = useForm<RegisterRequestType>({
        resolver: zodResolver(RegisterRequest),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            firstName: "",
            lastName: "",
        },
    })


    useEffect(() => {
        const savedEmail = Cookies.get("rememberedEmail");
        if (savedEmail) {
            formLogin.setValue("email", savedEmail);
            setRememberMe(true);
        }
    }, []);

    useEffect(() => {
        if (activeForm === 'login') {
            const savedEmail = Cookies.get("rememberedEmail");
            formLogin.reset({
                email: savedEmail || "",
                password: ""
            });
        } else {
            formRegister.reset({
                email: "",
                password: "",
                confirmPassword: "",
                firstName: "",
                lastName: ""
            });
        }
    }, [activeForm]);

    async function onSubmitLogin(values: LoginRequestType) {
        setError(null);
        setLoading(true);
        try {
            const response = await login(values);
            toast.success("Đăng nhập thành công!");
            if (rememberMe) {
                Cookies.set("rememberedEmail", values.email, { expires: 7 });
            } else {
                Cookies.remove("rememberedEmail");
            }
            // setTimeout(() => {
            //     router.push("/home");
            // }, 1000);
        } catch (err: any) {
            toast.error("Đăng nhập thất bại! Kiểm tra lại lỗi");
            setError(err.message || "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }



    async function onSubmitRegister(values: RegisterRequestType) {
        setError(null);
        setLoading(true);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const nameRegex = /^[A-Za-zÀ-ỹ\s]+$/;

        if (!emailRegex.test(values.email)) {
            setError("Email không hợp lệ!");
            setLoading(false);
            return;
        }

        if (values.password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự!");
            setLoading(false);
            return;
        }

        if (values.password !== values.confirmPassword) {
            setError("Mật khẩu không khớp!");
            setLoading(false);
            return;
        }

        if (!nameRegex.test(values.firstName) || !nameRegex.test(values.lastName)) {
            setError("Họ và Tên chỉ được chứa chữ cái!");
            setLoading(false);
            return;
        }

        const registerPromise = register(values);
        try {
            await registerPromise;
            toast.success("Đăng kí thành công! Chuyển về trang đăng nhập")
            document.getElementById("login")?.click();
        } catch (err: any) {
            setError(err.message || "Đã xảy ra lỗi khi đăng kí. Vui lòng thử lại.");
            toast.error("Đăng kí thất bại! Kiểm tra lại lỗi");
        } finally {
            setLoading(false);
        }
    }


    return (
        <div className="container" id="container">
            <Toaster
                position="top-center"
                reverseOrder={true}
                toastOptions={{
                    style: {
                        maxWidth: "max-content",
                    }
                }}
            />
            <div className="form-container sign-up">
                <Form {...formRegister}>
                    <form onSubmit={formRegister.handleSubmit(onSubmitRegister)}>
                        <h1>Đăng Kí</h1>
                        <div className="social-icons">
                            <a href="#" className="icon"><i className="fa-brands fa-google-plus-g"></i></a>
                            <a href="#" className="icon"><i className="fa-brands fa-facebook-f"></i></a>
                            <a href="#" className="icon"><i className="fa-brands fa-github"></i></a>
                            <a href="#" className="icon"><i className="fa-brands fa-linkedin-in"></i></a>
                        </div>
                        {error ? (
                            <div><span style={{ fontSize: '14px', color: 'red', fontWeight: 'bold' }}>{error}</span></div>
                        ) : <div style={{ height: '20px' }}><span>or use your email password</span></div>}
                        <FormField
                            control={formRegister.control}
                            name='email'
                            render={({ field }) => (
                                <Input type="email" placeholder="Email" {...field} required />
                            )}
                        />
                        <FormField
                            control={formRegister.control}
                            name='password'
                            render={({ field }) => (
                                <Input type="password" placeholder="Password" {...field} required />

                            )}
                        />
                        <FormField
                            control={formRegister.control}
                            name='confirmPassword'
                            render={({ field }) => (
                                <Input type="password" placeholder="Confirm Password" {...field} required />
                            )}
                        />
                        <div className="name-fields">
                            <FormField
                                control={formRegister.control}
                                name='firstName'
                                render={({ field }) => (
                                    <Input type="text" placeholder="First Name" {...field} required />
                                )}
                            />
                            <FormField
                                control={formRegister.control}
                                name='lastName'
                                render={({ field }) => (
                                    <Input type="text" placeholder="Last Name" {...field} required />
                                )}
                            />
                        </div>

                        <button
                            id="submit"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Đang xử lý..." : "Đăng Ký"}
                        </button>
                    </form>
                </Form>
            </div>

            <div className="form-container sign-in">
                <Form {...formLogin}>
                    <form onSubmit={formLogin.handleSubmit(onSubmitLogin)}>
                        <h1>Đăng Nhập</h1>
                        <div className="social-icons">
                            <a href="#" className="icon"
                            ><i className="fa-brands fa-google-plus-g"></i
                            ></a>
                            <a href="#" className="icon"><i className="fa-brands fa-facebook-f"></i></a>
                            <a href="#" className="icon"><i className="fa-brands fa-github"></i></a>
                            <a href="#" className="icon"
                            ><i className="fa-brands fa-linkedin-in"></i
                            ></a>
                        </div>
                        {error ? (
                            <div><span style={{ fontSize: '14px', color: 'red', fontWeight: 'bold' }}>{error}</span></div>
                        ) : <div style={{ height: '20px' }}><span>or use your email password</span></div>}
                        <FormField
                            control={formLogin.control}
                            name='email'
                            render={({ field }) => (
                                <Input type="email" placeholder="Email" {...field} required />
                            )}
                        />
                        <FormField
                            control={formLogin.control}
                            name='password'
                            render={({ field }) => (
                                <Input type="password" placeholder="Password" {...field} required />
                            )}
                        />
                        {/* <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={() => setRememberMe(!rememberMe)}
                        />
                        <label htmlFor="rememberMe">
                            Ghi nhớ đăng nhập
                        </label> */}
                        <a href="#">Quên mật khẩu?</a>
                        <button
                            id="submit"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Đang xử lý..." : "Đăng Nhập"}
                        </button>
                    </form>
                </Form>
            </div>
            <div className="toggle-container">
                <div className="toggle">
                    <div className="toggle-panel toggle-left">
                        <h1>Welcome to NTU Connect</h1>
                        <p>Cùng nhau tạo ra một cộng đồng sinh viên tuyệt vời</p>
                        <button className="hidden" id="login">Đăng Nhập</button>
                    </div>
                    <div className="toggle-panel toggle-right">
                        <h1>Welcome to NTU Connect</h1>
                        <p>
                            Trở thành một thành viên tuyệt vời của cồng đồng.
                        </p>
                        <button className="hidden" id="register">Đăng Kí</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default AuthForm;